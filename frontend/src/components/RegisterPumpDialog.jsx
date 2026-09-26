import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Fuel } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';

const API_SEND_DEMO = '/api/send-demo-mail';
const EMPTY = { name: '', phone: '', pump_name: '', address: '' };
const APP_STORE = 'https://apps.apple.com/in/app/petrofi/id6758732447';
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.petrofi.app&hl=en_IN';

const ALL_FIELDS = [
    { name: 'name', label: 'Your name', placeholder: 'Rajesh Kumar', type: 'text', autoComplete: 'name', required: true },
    { name: 'phone', label: 'Phone number', placeholder: '98765 43210', type: 'tel', autoComplete: 'tel', required: true, inputMode: 'tel' },
    { name: 'pump_name', label: 'Petrol pump name', placeholder: 'Sharma Fuel Station', type: 'text', autoComplete: 'organization', required: true },
];

const RegisterPumpDialog = ({ open, onOpenChange, onSuccess, source = 'screenshots', variant = 'gallery', prefill = null }) => {
    const [form, setForm] = useState(EMPTY);
    const [status, setStatus] = useState('idle');
    const isAccount = variant === 'account';

    useEffect(() => {
        if (!open) return undefined;
        setStatus('idle');
        setForm({
            name: prefill?.name || '',
            phone: prefill?.phone || '',
            pump_name: prefill?.pump_name || '',
            address: '',
        });
        return undefined;
    }, [open, prefill?.name, prefill?.phone, prefill?.pump_name]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleOpenChange = (next) => {
        onOpenChange(next);
        if (!next) {
            setStatus('idle');
            setForm(EMPTY);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(API_SEND_DEMO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    phone: form.phone.trim(),
                    pump_name: form.pump_name.trim(),
                    address: form.address.trim(),
                    city: '',
                    email: prefill?.email || '',
                    source,
                }),
            });
            const data = res.ok ? await res.json().catch(() => ({})) : null;
            if (res.ok && data && data.ok !== false) {
                setStatus('success');
                onSuccess?.();
                return;
            }
            setStatus('error');
        } catch {
            setStatus('error');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] rounded-2xl border-0 p-0 bg-white shadow-[0_24px_80px_rgba(13,27,62,0.28)] gap-0 sm:rounded-2xl">
                {status === 'success' ? (
                    <div className="px-6 py-10 sm:px-8 text-center" data-testid="register-pump-success">
                        <DialogTitle className="sr-only">{isAccount ? 'Thank you' : 'Pump registered'}</DialogTitle>
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={28} className="text-green-600" />
                        </div>
                        {isAccount ? (
                            <>
                                <h3 className="text-xl font-bold font-outfit text-pf-navy mb-2">Thank you</h3>
                                <p className="text-slate-500 font-jakarta text-sm leading-relaxed mb-6">
                                    Your pump is registered. Download PetroFI and start the 30-day trial.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <a
                                        href={APP_STORE}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-pf-navy text-white px-5 py-3 rounded-full hover:bg-pf-navy/90"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0" aria-hidden>
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                        </svg>
                                        <span className="text-sm font-semibold font-jakarta">Download on the App Store</span>
                                    </a>
                                    <a
                                        href={PLAY_STORE}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 border border-pf-navy text-pf-navy px-5 py-3 rounded-full hover:bg-pf-navy hover:text-white"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" aria-hidden>
                                            <path d="M3.18 23.75c.37.21.8.23 1.19.08L15.54 12 12 8.46 3.18 23.75zM20.46 10.5l-2.91-1.67-3.96 3.5 3.96 3.5 2.95-1.69c.84-.48.84-1.66-.04-2.14zM1.22.59C1.08.93 1 1.29 1 1.68v20.62c0 .39.08.76.22 1.1L12.46 12 1.22.59zM15.54 12L4.37.33C3.98.18 3.55.2 3.18.41L15.54 12z" />
                                        </svg>
                                        <span className="text-sm font-semibold font-jakarta">Get it on Google Play</span>
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold font-outfit text-pf-navy mb-2">You are in</h3>
                                <p className="text-slate-500 font-jakarta text-sm leading-relaxed mb-6">
                                    We have your pump details. You can see the app now.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleOpenChange(false)}
                                    className="inline-flex items-center justify-center gap-2 bg-pf-navy text-white px-6 py-3 rounded-full text-sm font-semibold font-jakarta hover:bg-pf-navy/90"
                                >
                                    See the app
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-6 py-7 sm:px-8 sm:py-8" data-testid="register-pump-form">
                        <DialogHeader className="text-left space-y-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-pf-sky/10 flex items-center justify-center mb-1">
                                <Fuel size={18} className="text-pf-sky" strokeWidth={1.8} />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold font-outfit text-pf-navy leading-snug">
                                {isAccount ? 'Start your free 30-day trial' : 'Register your pump'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 font-jakarta leading-relaxed">
                                {isAccount
                                    ? 'Share a few details and we will set up PetroFI on this pump.'
                                    : 'Tell us a few details. Then see the app.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3.5">
                            {ALL_FIELDS.map(({ name, label, placeholder, type, autoComplete, required, inputMode }) => (
                                <div key={name}>
                                    <label htmlFor={`register-${name}`} className="block text-xs font-semibold text-pf-navy font-jakarta mb-1.5">
                                        {label}
                                    </label>
                                    <input
                                        id={`register-${name}`}
                                        type={type}
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        placeholder={placeholder}
                                        required={required}
                                        autoComplete={autoComplete}
                                        inputMode={inputMode}
                                        data-testid={`register-input-${name}`}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-jakarta text-pf-navy placeholder-slate-400 focus:outline-none focus:border-pf-sky focus:ring-2 focus:ring-pf-sky/20 bg-slate-50"
                                    />
                                </div>
                            ))}
                            {isAccount ? null : (
                                <div>
                                    <label htmlFor="register-address" className="block text-xs font-semibold text-pf-navy font-jakarta mb-1.5">
                                        Address <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        id="register-address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Pump address"
                                        rows={2}
                                        autoComplete="street-address"
                                        data-testid="register-input-address"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-jakarta text-pf-navy placeholder-slate-400 focus:outline-none focus:border-pf-sky focus:ring-2 focus:ring-pf-sky/20 bg-slate-50 resize-none"
                                    />
                                </div>
                            )}
                        </div>

                        {status === 'error' && (
                            <p className="text-red-500 text-xs font-jakarta mt-3" data-testid="register-pump-error">
                                Could not send. Try again or call +91 73986 21812.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            data-testid="register-pump-submit"
                            className="w-full mt-5 bg-pf-navy text-white py-3 rounded-full text-sm font-bold font-jakarta flex items-center justify-center gap-2 hover:bg-pf-navy/90 disabled:opacity-60 shadow-sm"
                        >
                            {status === 'loading' ? 'Submitting...' : (
                                <>
                                    {isAccount ? 'Start free trial' : 'Register your pump'}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-400 font-jakarta mt-3">
                            No spam. We only use this to reach you.
                        </p>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default RegisterPumpDialog;
