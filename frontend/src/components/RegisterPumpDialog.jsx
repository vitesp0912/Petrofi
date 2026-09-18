import React, { useState } from 'react';
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

const RegisterPumpDialog = ({ open, onOpenChange, onSuccess }) => {
    const [form, setForm] = useState(EMPTY);
    const [status, setStatus] = useState('idle');

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
                    email: '',
                    source: 'screenshots',
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
            <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] max-h-[90vh] overflow-y-auto rounded-2xl border-0 p-0 bg-white shadow-[0_24px_80px_rgba(13,27,62,0.28)] gap-0 sm:rounded-2xl">
                {status === 'success' ? (
                    <div className="px-6 py-10 sm:px-8 text-center" data-testid="register-pump-success">
                        <DialogTitle className="sr-only">Pump registered</DialogTitle>
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={28} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold font-outfit text-pf-navy mb-2">You are in</h3>
                        <p className="text-slate-500 font-jakarta text-sm leading-relaxed mb-6">
                            We have your pump details. The screens below are open now.
                        </p>
                        <button
                            type="button"
                            onClick={() => handleOpenChange(false)}
                            className="inline-flex items-center justify-center gap-2 bg-pf-navy text-white px-6 py-3 rounded-xl text-sm font-semibold font-jakarta hover:bg-pf-navy/90"
                        >
                            See the app
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-6 py-7 sm:px-8 sm:py-8" data-testid="register-pump-form">
                        <DialogHeader className="text-left space-y-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-pf-sky/10 flex items-center justify-center mb-1">
                                <Fuel size={18} className="text-pf-sky" strokeWidth={1.8} />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold font-outfit text-pf-navy leading-snug">
                                Register your pump
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 font-jakarta leading-relaxed">
                                Tell us a few details. Then see the app.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3.5">
                            {[
                                { name: 'name', label: 'Your name', placeholder: 'Rajesh Kumar', type: 'text', autoComplete: 'name', required: true },
                                { name: 'phone', label: 'Phone number', placeholder: '98765 43210', type: 'tel', autoComplete: 'tel', required: true, inputMode: 'tel' },
                                { name: 'pump_name', label: 'Petrol pump name', placeholder: 'Sharma Fuel Station', type: 'text', autoComplete: 'organization', required: true },
                            ].map(({ name, label, placeholder, type, autoComplete, required, inputMode }) => (
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
                            className="w-full mt-5 bg-pf-navy text-white py-3 rounded-xl text-sm font-bold font-jakarta flex items-center justify-center gap-2 hover:bg-pf-navy/90 disabled:opacity-60 shadow-sm"
                        >
                            {status === 'loading' ? 'Submitting...' : (
                                <>Register your pump <ArrowRight size={16} /></>
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
