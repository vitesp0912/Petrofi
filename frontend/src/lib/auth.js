import { supabase } from './supabase';
import { isLoginAllowed, LOGIN_ALLOWLIST_MESSAGE } from './login-allowlist';

export const IDENTIFIER_MAX_LENGTH = 254;
export const OTP_LENGTH = 6;
export const OTP_COOLDOWN_SECONDS = 60;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const IDENTIFIER_DISALLOWED = /[^0-9a-zA-Z@._+\-]/g;
const OTP_COOLDOWN_MS = OTP_COOLDOWN_SECONDS * 1000;

const cooldownUntilByKey = new Map();

export function sanitizeIdentifierInput(raw) {
    return String(raw ?? '').replace(IDENTIFIER_DISALLOWED, '').slice(0, IDENTIFIER_MAX_LENGTH);
}

export function sanitizeOtpInput(raw) {
    return String(raw ?? '').replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export function formatCooldown(seconds) {
    const total = Math.max(0, Math.ceil(Number(seconds) || 0));
    const minutes = Math.floor(total / 60);
    const remainder = total % 60;
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export function getCooldownSeconds(key) {
    if (!key) return 0;
    const until = cooldownUntilByKey.get(key);
    if (!until) return 0;
    const remaining = Math.ceil((until - Date.now()) / 1000);
    if (remaining <= 0) {
        cooldownUntilByKey.delete(key);
        return 0;
    }
    return remaining;
}

function startCooldown(key) {
    cooldownUntilByKey.set(key, Date.now() + OTP_COOLDOWN_MS);
}

export function parseIdentifier(raw) {
    const value = String(raw ?? '').trim();
    if (!value) {
        return { ok: false, error: 'Enter your phone number or email.' };
    }

    if (value.includes('@')) {
        const email = value.toLowerCase();
        if (email.length < 6 || email.length > IDENTIFIER_MAX_LENGTH || !EMAIL_REGEX.test(email)) {
            return { ok: false, error: 'Enter a valid email address.' };
        }
        return {
            ok: true,
            kind: 'email',
            email,
            cooldownKey: email,
            display: email,
        };
    }

    if (/^\d+$/.test(value)) {
        if (value.length !== 10 || !/^[6-9]/.test(value)) {
            return { ok: false, error: 'Enter a valid 10-digit Indian mobile number.' };
        }
        const phoneE164 = `+91${value}`;
        return {
            ok: true,
            kind: 'phone',
            phone10: value,
            phoneE164,
            cooldownKey: phoneE164,
            display: phoneE164,
        };
    }

    return { ok: false, error: 'Enter a 10-digit mobile number or a valid email.' };
}

function readAccountCheck(data) {
    try {
        const result = typeof data === 'string' ? JSON.parse(data) : data;
        return {
            exists: result?.exists === true,
            isActive: result?.isActive === true,
        };
    } catch {
        return { exists: false, isActive: false };
    }
}

function accountCheckError(kind, check) {
    if (!check.exists) {
        return kind === 'phone'
            ? 'No PetroFI account found for this phone number.'
            : 'No PetroFI account found for this email.';
    }
    if (!check.isActive) {
        return 'This account is not active. Please contact PetroFI support.';
    }
    return null;
}

function cooldownError(seconds) {
    return `Please wait ${seconds} seconds before requesting another OTP.`;
}

function mapSendError(error, kind) {
    const message = String(error?.message || '').toLowerCase();
    const code = String(error?.code || '').toLowerCase();
    const combined = `${code} ${message}`;

    if (combined.includes('rate') || combined.includes('seconds') || combined.includes('over_email') || combined.includes('over_sms')) {
        return 'Please wait a minute before requesting another code.';
    }

    if (kind === 'phone') {
        return 'We could not send an SMS to this number right now. Please try again in a minute, or log in with your email instead.';
    }

    return 'We could not send an email to this address right now. Please try again in a minute, or log in with your phone number instead.';
}

export async function sendLoginOtp(parsed) {
    if (!supabase) {
        return { ok: false, error: 'Login is not configured yet.' };
    }
    if (!parsed?.ok) {
        return { ok: false, error: parsed?.error || 'Enter a valid phone number or email.' };
    }

    const remaining = getCooldownSeconds(parsed.cooldownKey);
    if (remaining > 0) {
        return { ok: false, error: cooldownError(remaining), cooldown: remaining };
    }

    if (!isLoginAllowed(parsed)) {
        return { ok: false, error: LOGIN_ALLOWLIST_MESSAGE };
    }

    if (parsed.kind === 'phone') {
        const { data, error } = await supabase.rpc('validate_phone_for_login', {
            phone_number: parsed.phone10,
        });
        if (error) {
            return { ok: false, error: 'We could not check this account right now. Please try again.' };
        }
        const check = readAccountCheck(data);
        const blocked = accountCheckError('phone', check);
        if (blocked) {
            return {
                ok: false,
                error: blocked,
                reason: check.exists ? 'inactive' : 'not_registered',
            };
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({
            phone: parsed.phoneE164,
            options: { shouldCreateUser: false },
        });
        if (otpError) {
            return { ok: false, error: mapSendError(otpError, parsed.kind) };
        }
    } else {
        const { data, error } = await supabase.rpc('validate_email_for_login', {
            p_email: parsed.email,
        });
        if (error) {
            return { ok: false, error: 'We could not check this account right now. Please try again.' };
        }
        const check = readAccountCheck(data);
        const blocked = accountCheckError('email', check);
        if (blocked) {
            return {
                ok: false,
                error: blocked,
                reason: check.exists ? 'inactive' : 'not_registered',
            };
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({
            email: parsed.email,
            options: { shouldCreateUser: false },
        });
        if (otpError) {
            return { ok: false, error: mapSendError(otpError, parsed.kind) };
        }
    }

    startCooldown(parsed.cooldownKey);
    return { ok: true, cooldown: OTP_COOLDOWN_SECONDS };
}

export async function verifyLoginOtp(parsed, token) {
    if (!supabase) {
        return { ok: false, error: 'Login is not configured yet.' };
    }
    if (!parsed?.ok) {
        return { ok: false, error: parsed?.error || 'Enter a valid phone number or email.' };
    }

    const otp = sanitizeOtpInput(token);
    if (otp.length !== OTP_LENGTH) {
        return { ok: false, error: 'Enter the 6-digit code.' };
    }

    if (!isLoginAllowed(parsed)) {
        return { ok: false, error: LOGIN_ALLOWLIST_MESSAGE };
    }

    const { error } = parsed.kind === 'phone'
        ? await supabase.auth.verifyOtp({
            phone: parsed.phoneE164,
            token: otp,
            type: 'sms',
        })
        : await supabase.auth.verifyOtp({
            email: parsed.email,
            token: otp,
            type: 'email',
        });

    if (error) {
        const message = String(error.message || '').toLowerCase();
        if (message.includes('expired')) {
            return { ok: false, error: 'That code has expired. Please request a new one.' };
        }
        return { ok: false, error: 'That code is incorrect. Please try again.' };
    }

    return { ok: true };
}

export function getAuthDisplayName(user) {
    if (!user) return '';
    if (user.email) return user.email;
    if (user.phone) return user.phone;
    return 'Account';
}

export function getAuthInitials(user) {
    const label = getAuthDisplayName(user);
    if (!label || label === 'Account') return 'P';
    if (label.includes('@')) return label[0].toUpperCase();
    const digits = label.replace(/\D/g, '');
    return (digits.slice(-2) || 'P').toUpperCase();
}
