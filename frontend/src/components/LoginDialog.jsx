import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LogIn } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
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
};

const LoginDialog = ({ open, onOpenChange }) => {
    const navigate = useNavigate();
    const [state, setState] = useState(EMPTY);
    const verifyingRef = useRef(false);

    const reset = () => {
        verifyingRef.current = false;
        setState(EMPTY);
    };

    const handleOpenChange = (next) => {
        onOpenChange(next);
        if (!next) reset();
    };

    useEffect(() => {
        if (!open || state.step !== 'otp' || !state.parsed?.cooldownKey) return undefined;
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
    }, [open, state.step, state.parsed?.cooldownKey]);

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

    const handleSend = async (event) => {
        event?.preventDefault();
        const parsed = parseIdentifier(state.identifier);
        if (!parsed.ok) {
            setState((prev) => ({ ...prev, error: parsed.error }));
            return;
        }

        setState((prev) => ({ ...prev, sending: true, error: '', parsed }));
        const result = await sendLoginOtp(parsed);
        if (!result.ok) {
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
        handleOpenChange(false);
        navigate('/subscription');
    };

    const handleOtpChange = (value) => {
        const otp = sanitizeOtpInput(value);
        setState((prev) => ({ ...prev, otp, error: '' }));
        if (otp.length === OTP_LENGTH) {
            handleVerify(otp);
        }
    };

    const existingCooldown = liveParsed.ok ? getCooldownSeconds(liveParsed.cooldownKey) : 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] max-h-[90vh] overflow-y-auto rounded-2xl border-0 p-0 bg-white shadow-[0_24px_80px_rgba(13,27,62,0.28)] gap-0 sm:rounded-2xl">
                {state.step === 'otp' && state.parsed ? (
                    <div className="px-6 py-7 sm:px-8 sm:py-8" data-testid="login-otp-step">
                        <DialogHeader className="text-left space-y-2 mb-6">
                            <button
                                type="button"
                                onClick={() => setState((prev) => ({
                                    ...prev,
                                    step: 'identifier',
                                    otp: '',
                                    error: '',
                                    verifying: false,
                                }))}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-pf-navy font-jakarta mb-1"
                                data-testid="login-change-identifier"
                            >
                                <ArrowLeft size={14} />
                                Use a different phone or email
                            </button>
                            <DialogTitle className="text-xl sm:text-2xl font-bold font-outfit text-pf-navy leading-snug">
                                Enter the 6-digit code
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 font-jakarta leading-relaxed">
                                We sent a code to {state.parsed.display}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex justify-center">
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
                ) : (
                    <form onSubmit={handleSend} className="px-6 py-7 sm:px-8 sm:py-8" data-testid="login-identifier-form">
                        <DialogHeader className="text-left space-y-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-pf-sky/10 flex items-center justify-center mb-1">
                                <LogIn size={18} className="text-pf-sky" strokeWidth={1.8} />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold font-outfit text-pf-navy leading-snug">
                                Log in to PetroFI
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 font-jakarta leading-relaxed">
                                Enter the phone number or email on your PetroFI account. We will send a 6-digit code.
                            </DialogDescription>
                        </DialogHeader>

                        <label htmlFor="login-identifier" className="block text-xs font-semibold text-pf-navy font-jakarta mb-1.5">
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

                        {state.error && (
                            <p className="text-red-500 text-xs font-jakarta mt-2" data-testid="login-identifier-error">
                                {state.error}
                            </p>
                        )}

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
                            className="w-full mt-5 bg-pf-navy text-white py-3 rounded-xl text-sm font-bold font-jakarta flex items-center justify-center gap-2 hover:bg-pf-navy/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {state.sending ? 'Sending code…' : (
                                <>Send OTP <ArrowRight size={16} /></>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-400 font-jakarta mt-3">
                            Existing PetroFI accounts only. New pumps can start a free trial from the app.
                        </p>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default LoginDialog;
