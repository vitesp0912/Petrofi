import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { formatMoney } from '../../lib/subscription';

export function ConfirmPayDialog({ open, plan, paying, error, onOpenChange, onConfirm }) {
    return (
        <Dialog open={open} onOpenChange={(next) => { if (!paying) onOpenChange(next); }}>
            <DialogContent className="sm:max-w-md rounded-2xl" data-testid="pay-confirm-dialog">
                <DialogHeader>
                    <DialogTitle className="font-outfit text-pf-navy">Confirm payment</DialogTitle>
                    <DialogDescription className="font-jakarta text-slate-500">
                        {plan
                            ? `Continue with ${plan.name}. You will be taken to a secure payment page.`
                            : 'Select a plan to continue.'}
                    </DialogDescription>
                </DialogHeader>
                {plan ? (
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
                ) : null}
                {error ? <p className="text-sm text-rose-600 font-jakarta">{error}</p> : null}
                <DialogFooter className="gap-2 sm:gap-2">
                    <button
                        type="button"
                        disabled={paying}
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

function resultCopy(status) {
    if (status === 'paid') {
        return {
            title: 'Payment successful',
            text: 'Your payment went through. This pump is now on the selected plan.',
        };
    }
    if (status === 'pending') {
        return {
            title: 'Payment pending',
            text: 'We have not confirmed this payment yet. It can take a few minutes. You can check Transactions shortly.',
        };
    }
    return {
        title: 'Payment failed',
        text: 'This payment did not complete. No amount was captured. You can try again from Subscriptions.',
    };
}

export function PaymentResultDialog({ status, onClose }) {
    const copy = resultCopy(status);
    return (
        <Dialog open={Boolean(status)} onOpenChange={(next) => { if (!next) onClose(); }}>
            <DialogContent className="sm:max-w-md rounded-2xl" data-testid="pay-result-dialog">
                <DialogHeader>
                    <DialogTitle className="font-outfit text-pf-navy">{copy.title}</DialogTitle>
                    <DialogDescription className="font-jakarta text-slate-500">{copy.text}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-full bg-pf-navy text-white px-5 py-2.5 text-sm font-bold font-jakarta"
                    >
                        OK
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
