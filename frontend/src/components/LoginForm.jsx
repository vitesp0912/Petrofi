import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, LogIn } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import {
    formatCooldown,
    getCooldownSeconds,
    parseIdentifier,
    sanitizeIdentifierInput,
    sanitizeOtpInput,
    sendLoginOtp,
    verifyLoginOtp,
    OTP_LENGTH,
} from '../lib/auth';

const EMPTY = {
    step: 'identifier',
    identifier: '',
    otp: '',
    parsed: null,
    error: '',
    sending: false,
    verifying: false,
    cooldown: 0,
    signupWait: false,
};

const LoginForm = ({ onSuccess, onUnregistered, onRegister, hideTrialNote = false }) => {
    const [state, setState] = useState(EMPTY);
    const verifyingRef = useRef(false);
    const signupTimerRef = useRef(null);

    useEffect(() => () => {
        if (signupTimerRef.current) window.clearTimeout(signupTimerRef.current);
    }, []);

    useEffect(() => {
        if (state.step !== 'otp' || !state.parsed?.cooldownKey) return undefined;
        const tick = () => {
            setState((prev) => {
                if (prev.step !== 'otp' || !prev.parsed) return prev;
                const nextCooldown = getCooldownSeconds(prev.parsed.cooldownKey);
                if (nextCooldown === prev.cooldown) return prev;
                return { ...prev, cooldown: nextCooldown };
            });
        };
        tick();
        const id = window.setInterval(tick, 250);
        return () => window.clearInterval(id);
    }, [state.step, state.parsed?.cooldownKey]);

    const liveParsed = parseIdentifier(state.identifier);

    const handleIdentifierChange = (event) => {
        setState((prev) => ({
            ...prev,
            identifier: sanitizeIdentifierInput(event.target.value),
            error: '',
        }));
    };

    const goToOtp = (parsed) => {
        setState((prev) => ({
            ...prev,
            step: 'otp',
            parsed,
            otp: '',
            error: '',
            sending: false,
            verifying: false,
            cooldown: getCooldownSeconds(parsed.cooldownKey),
        }));
    };

    const notifyUnregistered = (parsed) => {
        if (!onUnregistered) {
            setState((prev) => ({ ...prev, sending: false, error: parsed.kind === 'phone'
                ? 'This number is not registered. Sign up to start a free trial.'
                : 'This email is not registered. Sign up to start a free trial.' }));
            return;
        }

        setState((prev) => ({
            ...prev,
            step: 'identifier',
            sending: true,
            error: '',
            signupWait: true,
        }));
        if (signupTimerRef.current) window.clearTimeout(signupTimerRef.current);
        signupTimerRef.current = window.setTimeout(() => {
            setState((prev) => ({
                ...prev,
                sending: false,
                signupWait: false,
                error: parsed.kind === 'phone'
                    ? 'This number is not registered. Sign up to start a free trial.'
                    : 'This email is not registered. Sign up to start a free trial.',
            }));
            onUnregistered({
                phone: parsed.kind === 'phone' ? parsed.phone10 : '',
                email: parsed.kind === 'email' ? parsed.email : '',
            });
        }, 5000);
    };

    const handleSend = async (event) => {
        event?.preventDefault();
        const parsed = parseIdentifier(state.identifier);
        if (!parsed.ok) {
            setState((prev) => ({ ...prev, error: parsed.error }));
            return;
        }

        setState((prev) => ({ ...prev, sending: true, error: '', parsed, signupWait: false }));
        const result = await sendLoginOtp(parsed);
        if (!result.ok) {
            if (result.reason === 'not_registered') {
                notifyUnregistered(parsed);
                return;
            }
            setState((prev) => ({ ...prev, sending: false, error: result.error }));
            return;
        }
        goToOtp(parsed);
    };

    const handleResend = async () => {
        if (!state.parsed || state.sending || getCooldownSeconds(state.parsed.cooldownKey) > 0) {
            return;
        }

        setState((prev) => ({ ...prev, sending: true, error: '', otp: '' }));
        const result = await sendLoginOtp(state.parsed);
        if (!result.ok) {
            if (result.reason === 'not_registered') {
                notifyUnregistered(state.parsed);
                return;
            }
            setState((prev) => ({ ...prev, sending: false, error: result.error }));
            return;
        }
        setState((prev) => ({
            ...prev,
            sending: false,
            otp: '',
            error: '',
            cooldown: getCooldownSeconds(prev.parsed.cooldownKey),
        }));
    };

    const handleVerify = async (token) => {
        const otp = sanitizeOtpInput(token);
        if (!state.parsed || otp.length !== OTP_LENGTH || verifyingRef.current) return;

        verifyingRef.current = true;
        setState((prev) => ({ ...prev, verifying: true, error: '', otp }));
        const result = await verifyLoginOtp(state.parsed, otp);
        verifyingRef.current = false;

        if (!result.ok) {
            setState((prev) => ({ ...prev, verifying: false, error: result.error, otp: '' }));
            return;
        }
        onSuccess?.();
    };

    const handleOtpChange = (value) => {
        const otp = sanitizeOtpInput(value);
        setState((prev) => ({ ...prev, otp, error: '' }));
        if (otp.length === OTP_LENGTH) {
            handleVerify(otp);
        }
    };

    const existingCooldown = liveParsed.ok ? getCooldownSeconds(liveParsed.cooldownKey) : 0;

    if (state.step === 'otp' && state.parsed) {
        return (
            <div data-testid="login-otp-step">
                <button
                    type="button"
                    onClick={() => setState((prev) => ({
                        ...prev,
                        step: 'identifier',
                        otp: '',
                        error: '',
                        verifying: false,
                    }))}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-pf-navy font-jakarta mb-4"
                    data-testid="login-change-identifier"
                >
                    <ArrowLeft size={14} />
                    Use a different phone or email
                </button>
                <h2 className="text-xl sm:text-2xl font-bold font-outfit text-pf-navy leading-snug">
                    Enter the 6-digit code
                </h2>
                <p className="mt-2 text-sm text-slate-500 font-jakarta leading-relaxed">
                    We sent a code to {state.parsed.display}.
                </p>

                <div className="flex justify-center mt-6">
                    <InputOTP
                        maxLength={OTP_LENGTH}
                        value={state.otp}
                        onChange={handleOtpChange}
                        disabled={state.verifying}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        data-testid="login-otp-input"
                    >
                        <InputOTPGroup className="gap-2">
                            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                                <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="h-11 w-10 sm:w-11 rounded-xl border border-slate-200 first:rounded-xl last:rounded-xl first:border-l shadow-none text-pf-navy font-outfit font-semibold bg-slate-50"
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {state.error ? (
                    <p className="text-red-500 text-xs font-jakarta mt-4 text-center" data-testid="login-otp-error">
                        {state.error}
                    </p>
                ) : (
                    <p className="text-slate-400 text-xs font-jakarta mt-4 text-center">
                        {state.verifying ? 'Verifying…' : 'The code submits automatically when all 6 digits are entered.'}
                    </p>
                )}

                <p className="text-center text-sm font-jakarta mt-6 text-slate-500">
                    Didn&apos;t receive the code?{' '}
                    {state.cooldown > 0 ? (
                        <span data-testid="login-resend-wait">
                            Resend in {formatCooldown(state.cooldown)}
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={state.sending}
                            className="font-semibold text-pf-sky hover:text-pf-navy disabled:opacity-60"
                            data-testid="login-resend"
                        >
                            {state.sending ? 'Sending…' : 'Resend'}
                        </button>
                    )}
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSend} data-testid="login-identifier-form">
            <div className="w-10 h-10 rounded-xl bg-pf-sky/10 flex items-center justify-center mb-4">
                <LogIn size={18} className="text-pf-sky" strokeWidth={1.8} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-outfit text-pf-navy leading-snug">
                Log in to PetroFI
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-jakarta leading-relaxed">
                Enter the phone number or email on your PetroFI account. We will send a 6-digit code.
            </p>

            <label htmlFor="login-identifier" className="block text-xs font-semibold text-pf-navy font-jakarta mt-6 mb-1.5">
                Phone or email
            </label>
            <input
                id="login-identifier"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoFocus
                value={state.identifier}
                onChange={handleIdentifierChange}
                placeholder="9876543210 or you@email.com"
                maxLength={254}
                data-testid="login-identifier-input"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-jakarta text-pf-navy placeholder-slate-400 focus:outline-none focus:border-pf-sky focus:ring-2 focus:ring-pf-sky/20 bg-slate-50"
            />

            {state.signupWait ? (
                <p className="text-pf-sky text-xs font-jakarta mt-3" data-testid="login-signup-wait">
                    This account is not on PetroFI. Opening signup in 5 seconds.
                </p>
            ) : state.error ? (
                <p className="text-red-500 text-xs font-jakarta mt-2" data-testid="login-identifier-error">
                    {state.error}
                </p>
            ) : null}

            {existingCooldown > 0 && liveParsed.ok && (
                <button
                    type="button"
                    onClick={() => goToOtp(liveParsed)}
                    className="mt-3 text-xs font-semibold text-pf-sky hover:text-pf-navy font-jakarta"
                    data-testid="login-enter-existing-code"
                >
                    I already have a code
                </button>
            )}

            <button
                type="submit"
                disabled={state.sending}
                data-testid="login-send-otp"
                className="w-full mt-5 bg-pf-navy text-white py-3 rounded-full text-sm font-bold font-jakarta flex items-center justify-center gap-2 hover:bg-pf-navy/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
                {state.sending ? (state.signupWait ? 'Opening signup…' : 'Sending code…') : (
                    <>Send OTP <ArrowRight size={16} /></>
                )}
            </button>
            {onRegister ? (
                <p className="text-center text-sm text-slate-500 font-jakarta mt-4">
                    Don&apos;t have a PetroFI account?{' '}
                    <button
                        type="button"
                        onClick={onRegister}
                        data-testid="login-register-now"
                        className="font-semibold text-pf-navy hover:text-pf-sky"
                    >
                        Register now
                    </button>
                </p>
            ) : hideTrialNote ? null : (
                <p className="text-center text-xs text-slate-400 font-jakarta mt-3">
                    New to PetroFI? Start a free 30-day trial on the app.
                </p>
            )}
        </form>
    );
};

export default LoginForm;
