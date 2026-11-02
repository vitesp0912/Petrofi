import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { gstinBody, isValidGstin } from '../../lib/gstin';
import { formatDateFull, formatMoney, nextSubscriptionEndDate } from '../../lib/subscription';

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
        gstin: '',
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

export function ConfirmPayDialog({
    open,
    plan,
    billing,
    paying,
    error,
    upgrade = false,
    subscription = null,
    onOpenChange,
    onConfirm,
}) {
    const [draft, setDraft] = useState(() => draftFromBilling(billing));
    const [editing, setEditing] = useState(false);
    const [acceptedRefund, setAcceptedRefund] = useState(false);
    const [hasGst, setHasGst] = useState(false);
    const name = billing?.name;
    const pumpName = billing?.pumpName;
    const email = billing?.email;
    const phone = billing?.phone;
    const address = billing?.address;

    useEffect(() => {
        if (!open) return;
        setDraft(draftFromBilling({ name, pumpName, email, phone, address }));
        setEditing(false);
        setAcceptedRefund(false);
        setHasGst(false);
    }, [open, name, pumpName, email, phone, address]);

    const setField = (key) => (value) => setDraft((prev) => ({ ...prev, [key]: value }));
    const gstin = gstinBody(draft.gstin);
    const gstinReady = !hasGst || isValidGstin(gstin);
    const gstinInvalid = hasGst && Boolean(gstin) && !isValidGstin(gstin);
    const validTill = plan
        ? nextSubscriptionEndDate(plan.days, subscription?.endDate)
        : null;
    const validTillLabel = validTill ? formatDateFull(validTill) : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex w-[calc(100%-1.25rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-[0_24px_80px_rgba(13,27,62,0.28)] max-h-[calc(var(--vv-height,100svh)-1.25rem)] sm:max-h-[min(90vh,calc(100vh-4rem))] [&>button]:right-3 [&>button]:top-3 [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100 [&>button]:hover:bg-white/10 [&>button]:ring-offset-0"
                data-testid="pay-confirm-dialog"
            >
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white">
                    <div className="shrink-0 bg-pf-navy px-4 py-4 pr-12 text-white sm:px-6 sm:py-5">
                        <DialogHeader className="space-y-2 text-left">
                            <DialogTitle className="font-outfit text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
                                CONFIRM PAYMENT
                            </DialogTitle>
                            <DialogDescription className="font-jakarta text-[13px] leading-relaxed text-white/75 sm:text-sm">
                                {plan
                                    ? upgrade
                                        ? `Upgrade or extend with ${plan.name}. Remaining days stay, and this plan length is added on top.`
                                        : `Continue with ${plan.name}. Check these details, then pay.`
                                    : 'Select a plan to continue.'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
                        {plan ? (
                            <div className="space-y-4">
                                <div className="flex justify-end -mb-1">
                                    <button
                                        type="button"
                                        onClick={() => setEditing((prev) => !prev)}
                                        disabled={paying}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#3157D5] font-jakarta hover:text-[#2546b0] disabled:opacity-50"
                                        data-testid="pay-edit-details"
                                    >
                                        <Pencil size={12} strokeWidth={2.25} />
                                        {editing ? 'Done' : 'Edit'}
                                    </button>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:px-4">
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
                                <dl className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4 text-sm font-jakarta">
                                    <div className="flex justify-between gap-4">
                                        <dt className="font-semibold text-slate-600">Plan</dt>
                                        <dd className="font-bold text-pf-navy text-right">{plan.name}</dd>
                                    </div>
                                    <div className="mt-2.5 flex justify-between gap-4">
                                        <dt className="font-semibold text-slate-600">Base price</dt>
                                        <dd className="font-bold text-pf-navy">{formatMoney(plan.base, plan.currency)}</dd>
                                    </div>
                                    <div className="mt-2.5 flex justify-between gap-4">
                                        <dt className="font-semibold text-slate-600">GST{plan.gstPct ? ` (${plan.gstPct}%)` : ''}</dt>
                                        <dd className="font-bold text-pf-navy">{formatMoney(plan.gst, plan.currency)}</dd>
                                    </div>
                                    {validTillLabel ? (
                                        <div className="mt-2.5 flex justify-between gap-4">
                                            <dt className="font-semibold text-slate-600 shrink-0">Valid till</dt>
                                            <dd className="font-bold text-pf-navy text-right">{validTillLabel}</dd>
                                        </div>
                                    ) : null}
                                    <div className="mt-3 -mx-0.5 flex justify-between items-center gap-4 rounded-lg bg-pf-navy px-3 py-2.5 text-sm text-white">
                                        <dt className="font-bold">Final price</dt>
                                        <dd className="font-bold tabular-nums text-base">{formatMoney(plan.total, plan.currency)}</dd>
                                    </div>
                                </dl>
                                <label className="flex items-start gap-2.5 text-sm font-jakarta text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={hasGst}
                                        disabled={paying}
                                        onChange={(event) => setHasGst(event.target.checked)}
                                        data-testid="pay-has-gst"
                                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-pf-navy focus:ring-pf-sky"
                                    />
                                    <span>Do you have GST?</span>
                                </label>
                                {hasGst ? (
                                    <label className="block" htmlFor="pay-gstin">
                                        <span className="text-xs font-semibold text-slate-500 font-jakarta">GSTIN</span>
                                        <input
                                            id="pay-gstin"
                                            type="text"
                                            inputMode="text"
                                            autoComplete="off"
                                            spellCheck={false}
                                            maxLength={15}
                                            disabled={paying}
                                            value={gstin}
                                            onChange={(event) => setField('gstin')(gstinBody(event.target.value))}
                                            data-testid="pay-gstin"
                                            className={`${FIELD_CLASS} mt-1 uppercase tracking-wide`}
                                            aria-invalid={gstinInvalid}
                                        />
                                        {!gstinReady ? (
                                            <span className="mt-1 block text-xs font-jakarta text-rose-600">
                                                Enter a valid 15-character GSTIN.
                                            </span>
                                        ) : null}
                                    </label>
                                ) : null}
                                <label className="flex items-start gap-2.5 text-sm font-jakarta text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={acceptedRefund}
                                        disabled={paying}
                                        onChange={(event) => setAcceptedRefund(event.target.checked)}
                                        data-testid="pay-accept-refund"
                                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-pf-navy focus:ring-pf-sky"
                                    />
                                    <span>
                                        I accept the{' '}
                                        <Link
                                            to="/refund-policy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-pf-sky hover:underline"
                                        >
                                            Refund and Cancellation Policy
                                        </Link>
                                        .
                                    </span>
                                </label>
                            </div>
                        ) : null}
                        {error ? <p className="mt-3 text-sm font-semibold text-rose-600 font-jakarta">{error}</p> : null}
                    </div>

                    <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
                        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2 sm:space-x-0">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-pf-navy font-jakarta hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={paying || !plan || !acceptedRefund || !gstinReady}
                                onClick={() => onConfirm({
                                    ...draft,
                                    hasGst,
                                    gstin: hasGst ? gstin : '',
                                    acceptRefundPolicy: true,
                                })}
                                data-testid="pay-confirm-now"
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-pf-navy px-5 py-2.5 text-sm font-bold font-jakarta text-white shadow-[0_10px_24px_rgba(13,27,62,0.25)] hover:bg-pf-navy/90 disabled:opacity-50 sm:min-w-[9.5rem] sm:flex-1"
                            >
                                {paying ? 'Opening a secure payment page…' : 'Pay Now'}
                            </button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function resultCopy(status, planName) {
    const plan = String(planName || '').trim();
    const value = String(status || '').toLowerCase();
    if (!value) return null;
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
    const shown = React.useRef({ status: '', planName: '' });
    if (status) shown.current = { status, planName };
    const copy = resultCopy(shown.current.status, shown.current.planName);
    const handleAction = () => {
        onClose();
        if (copy?.tone === 'failed') navigate('/subscription/plans');
        else navigate('/subscription');
    };

    if (!copy) return null;

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
