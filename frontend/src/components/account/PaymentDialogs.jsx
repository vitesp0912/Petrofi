import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { formatMoney } from '../../lib/subscription';

function Detail({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
            <dt className="text-slate-500 shrink-0">{label}</dt>
            <dd className="font-semibold text-pf-navy text-right break-words">{value}</dd>
        </div>
    );
}

function displayPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    let ten = digits;
    if (ten.startsWith('91') && ten.length === 12) ten = ten.slice(2);
    if (ten.length === 10) return `+91 ${ten}`;
    return phone || '';
}

export function ConfirmPayDialog({ open, plan, billing, paying, error, onOpenChange, onConfirm }) {
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
                        <dl className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-jakarta">
                            <Detail label="Name" value={billing?.name} />
                            <Detail label="Pump" value={billing?.pumpName} />
                            <Detail label="Email" value={billing?.email} />
                            <Detail label="Mobile" value={displayPhone(billing?.phone)} />
                            <Detail label="Address" value={billing?.address} />
                        </dl>
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
                        onClick={onConfirm}
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
                ? `Your transaction is complete. The ${plan} plan is now active for this pump.`
                : 'Your transaction is complete. The selected plan is now active for this pump.',
            hint: 'You can download your receipt anytime from the Transactions page.',
            action: 'Go to Dashboard',
            tone: 'success',
        };
    }
    if (status === 'pending') {
        return {
            title: 'Payment is processing',
            text: 'We are waiting for final confirmation from your bank or UPI app. This usually takes 2–3 minutes.',
            hint: 'You can safely close this window. We will automatically update your account once the bank clears it.',
            action: 'Return to Dashboard',
            tone: 'pending',
        };
    }
    return {
        title: 'Payment failed',
        text: 'Your transaction could not be completed. No money was deducted from your account.',
        hint: 'This usually happens due to bank downtime or network issues. You can safely try again.',
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
                <p className="text-sm font-jakarta leading-relaxed text-slate-500">{copy.hint}</p>
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
