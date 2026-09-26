import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { formatMoney } from '../../lib/subscription';

const FIELD_CLASS =
    'w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-pf-navy font-jakarta placeholder-slate-400 focus:outline-none focus:border-pf-sky focus:ring-2 focus:ring-pf-sky/20 disabled:opacity-60';

function displayPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    let ten = digits;
    if (ten.startsWith('91') && ten.length === 12) ten = ten.slice(2);
    if (ten.length === 10) return `+91 ${ten}`;
    return phone || '';
}

function draftFromBilling(billing) {
    return {
        name: billing?.name || '',
        pumpName: billing?.pumpName || '',
        email: billing?.email || '',
        phone: displayPhone(billing?.phone) || '',
        address: billing?.address || '',
    };
}

function Detail({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
            <dt className="text-slate-500 shrink-0">{label}</dt>
            <dd className="font-semibold text-pf-navy text-right break-words">{value || 'Not set'}</dd>
        </div>
    );
}

function Field({ id, label, value, onChange, type = 'text', disabled, multiline = false }) {
    return (
        <label className="block" htmlFor={id}>
            <span className="text-xs font-semibold text-slate-500 font-jakarta">{label}</span>
            {multiline ? (
                <textarea
                    id={id}
                    rows={2}
                    disabled={disabled}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={`${FIELD_CLASS} mt-1 resize-none`}
                />
            ) : (
                <input
                    id={id}
                    type={type}
                    disabled={disabled}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={`${FIELD_CLASS} mt-1`}
                />
            )}
        </label>
    );
}

export function ConfirmPayDialog({ open, plan, billing, paying, error, onOpenChange, onConfirm }) {
    const [draft, setDraft] = useState(() => draftFromBilling(billing));
    const [editing, setEditing] = useState(false);
    const name = billing?.name;
    const pumpName = billing?.pumpName;
    const email = billing?.email;
    const phone = billing?.phone;
    const address = billing?.address;

    useEffect(() => {
        if (!open) return;
        setDraft(draftFromBilling({ name, pumpName, email, phone, address }));
        setEditing(false);
    }, [open, name, pumpName, email, phone, address]);

    const setField = (key) => (value) => setDraft((prev) => ({ ...prev, [key]: value }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl" data-testid="pay-confirm-dialog">
                <DialogHeader>
                    <DialogTitle className="font-outfit text-pf-navy">Confirm payment</DialogTitle>
                    <DialogDescription className="font-jakarta text-slate-500">
                        {plan
                            ? `Continue with ${plan.name}. Check these details, then pay.`
                            : 'Select a plan to continue.'}
                    </DialogDescription>
                </DialogHeader>
                {plan ? (
                    <div className="space-y-3">
                        <div className="flex justify-end -mb-1">
                            <button
                                type="button"
                                onClick={() => setEditing((prev) => !prev)}
                                disabled={paying}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3157D5] font-jakarta hover:text-[#2546b0] disabled:opacity-50"
                                data-testid="pay-edit-details"
                            >
                                <Pencil size={12} strokeWidth={2.25} />
                                {editing ? 'Done' : 'Edit'}
                            </button>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-2">
                            {editing ? (
                                <div className="space-y-2.5 py-1">
                                    <Field id="pay-name" label="Name" value={draft.name} onChange={setField('name')} disabled={paying} />
                                    <Field id="pay-pump" label="Pump" value={draft.pumpName} onChange={setField('pumpName')} disabled={paying} />
                                    <Field id="pay-email" label="Email" type="email" value={draft.email} onChange={setField('email')} disabled={paying} />
                                    <Field id="pay-mobile" label="Mobile" type="tel" value={draft.phone} onChange={setField('phone')} disabled={paying} />
                                    <Field id="pay-address" label="Address" value={draft.address} onChange={setField('address')} disabled={paying} multiline />
                                </div>
                            ) : (
                                <dl className="text-sm font-jakarta">
                                    <Detail label="Name" value={draft.name} />
                                    <Detail label="Pump" value={draft.pumpName} />
                                    <Detail label="Email" value={draft.email} />
                                    <Detail label="Mobile" value={draft.phone} />
                                    <Detail label="Address" value={draft.address} />
                                </dl>
                            )}
                        </div>
                        <dl className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-jakarta">
                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">Plan</dt>
                                <dd className="font-semibold text-pf-navy">{plan.name}</dd>
                            </div>
                            <div className="mt-2 flex justify-between gap-4">
                                <dt className="text-slate-500">Amount</dt>
                                <dd className="font-semibold text-pf-navy">{formatMoney(plan.total, plan.currency)}</dd>
                            </div>
                        </dl>
                    </div>
                ) : null}
                {error ? <p className="text-sm text-rose-600 font-jakarta">{error}</p> : null}
                <DialogFooter className="gap-2 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-pf-navy font-jakarta hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={paying || !plan}
                        onClick={() => onConfirm(draft)}
                        data-testid="pay-confirm-now"
                        className="inline-flex items-center justify-center rounded-full bg-pf-navy text-white px-5 py-2.5 text-sm font-bold font-jakarta hover:bg-pf-navy/90 disabled:opacity-50"
                    >
                        {paying ? 'Opening a secure payment page…' : 'Pay Now'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function resultCopy(status, planName) {
    const plan = String(planName || '').trim();
    if (status === 'paid') {
        return {
            title: 'Payment successful',
            text: plan
                ? `Your transaction is complete. This payment for ${plan} is recorded.`
                : 'Your transaction is complete. This payment is recorded.',
            action: 'Go to Dashboard',
            tone: 'success',
        };
    }
    if (status === 'pending') {
        return {
            title: 'Payment is processing',
            text: 'We are waiting for final confirmation from your bank or UPI app. This usually takes 2–3 minutes.',
            action: 'Return to Dashboard',
            tone: 'pending',
        };
    }
    return {
        title: 'Payment failed',
        text: 'Your transaction could not be completed. No money was deducted from your account.',
        action: 'Try Payment Again',
        tone: 'failed',
    };
}

function ResultMark({ tone }) {
    if (tone === 'success') {
        return (
            <div className="pf-result-icon mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/80">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        className="pf-result-check"
                        d="M6.5 12.5 10 16l7.5-8"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        );
    }
    if (tone === 'pending') {
        return (
            <div className="pf-result-icon relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/80">
                <span className="pf-result-pending-ring pointer-events-none absolute inset-0 rounded-full border-2 border-amber-200" />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8.5v4l2.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        );
    }
    return (
        <div className="pf-result-icon mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-8 ring-rose-50/80">
            <svg className="pf-result-fail" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
        </div>
    );
}

export function PaymentResultDialog({ status, planName, onClose }) {
    const navigate = useNavigate();
    const copy = resultCopy(status, planName);
    const handleAction = () => {
        onClose();
        if (copy.tone === 'failed') navigate('/subscription/plans');
        else navigate('/subscription');
    };

    return (
        <Dialog open={Boolean(status)} onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent className="sm:max-w-[22rem] rounded-2xl px-6 py-7 text-center" data-testid="pay-result-dialog">
                <DialogHeader className="items-center space-y-3 sm:text-center">
                    <ResultMark tone={copy.tone} />
                    <DialogTitle className="font-outfit text-xl text-pf-navy pt-1">{copy.title}</DialogTitle>
                    <DialogDescription className="font-jakarta text-[15px] leading-relaxed text-slate-600">
                        {copy.text}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <button
                        type="button"
                        onClick={handleAction}
                        className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold font-jakarta text-white ${
                            copy.tone === 'failed' ? 'bg-pf-navy hover:bg-pf-navy/90' : copy.tone === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-pf-navy hover:bg-pf-navy/90'
                        }`}
                    >
                        {copy.action}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function paymentResultKind(status) {
    const value = String(status || '').toLowerCase();
    if (value === 'paid') return 'paid';
    if (value === 'pending' || value === 'created' || value === 'active') return 'pending';
    if (!value) return '';
    return 'failed';
}
