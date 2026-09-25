import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, FileText, Phone, Shield } from 'lucide-react';
import { daysUntil, formatDateLong, formatMoney, remainingLabel } from '../../lib/subscription';
import {
    createPaymentOrder,
    fetchPaymentCatalog,
    paymentErrorText,
    savePaymentStatus,
    startHostedCheckout,
} from '../../lib/payments';
import { ConfirmPayDialog } from './PaymentDialogs';
import { cardClass, LoadingState } from './AccountBits';

const BENEFITS = [
    'All PetroFI features',
    'Your existing pump data stays intact',
    'No setup required',
    'Continue without interruption',
];

function trialCopy(subscription) {
    const remaining = subscription?.remainingDays ?? daysUntil(subscription?.endDate);
    const dateLabel = formatDateLong(subscription?.endDate);

    if (remaining == null) {
        return {
            pill: 'Trial ending soon',
            status: 'Ending soon',
            detail: 'Your free trial is ending soon.',
        };
    }
    if (remaining > 1) {
        return {
            pill: `Trial ends in ${remaining} days`,
            status: remainingLabel(remaining),
            detail: dateLabel ? `Your trial ends on ${dateLabel}.` : `Trial ends in ${remaining} days.`,
        };
    }
    if (remaining === 1) {
        return {
            pill: 'Trial ends tomorrow',
            status: '1 day left',
            detail: dateLabel ? `Your trial ends on ${dateLabel}.` : 'Your trial ends tomorrow.',
        };
    }
    if (remaining === 0) {
        return {
            pill: 'Trial ends today',
            status: 'Ends today',
            detail: 'Your trial ends today.',
        };
    }
    return {
        pill: 'Trial ended',
        status: remainingLabel(remaining),
        detail: dateLabel ? `Your trial ended on ${dateLabel}.` : 'Your trial has ended.',
    };
}

const PlansPanel = () => {
    const { user, profile, pump, subscription } = useOutletContext();
    const trial = trialCopy(subscription);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState('');
    const payLock = useRef(0);

    useEffect(() => {
        const unlockPay = () => {
            payLock.current += 1;
            setPaying(false);
        };
        window.addEventListener('pageshow', unlockPay);
        return () => window.removeEventListener('pageshow', unlockPay);
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetchPaymentCatalog().then((result) => {
            if (cancelled) return;
            setLoading(false);
            if (!result.ok) {
                setError(paymentErrorText(result.reason));
                setQuotes([]);
                return;
            }
            setQuotes(result.quotes || []);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const gstLabel = quotes[0] ? `+${quotes[0].gstPct}% GST` : null;
    const billing = {
        name: profile?.name || user?.email || '',
        pumpName: pump?.name || '',
        email: user?.email || pump?.email || '',
        phone: pump?.phone || user?.phone || '',
        address: [pump?.address, pump?.city, pump?.state, pump?.pincode].filter(Boolean).join(', '),
    };

    const handleConfirmPay = async () => {
        if (!selected || paying) return;
        const lock = ++payLock.current;
        setPaying(true);
        setPayError('');
        const created = await createPaymentOrder({ planId: selected.id });
        if (lock !== payLock.current) return;
        if (!created.ok) {
            setPaying(false);
            setPayError(paymentErrorText(created.reason));
            return;
        }
        try {
            await startHostedCheckout(created);
        } catch {
            if (lock !== payLock.current) return;
            if (created.orderId) {
                await savePaymentStatus(created.orderId, 'user_dropped');
            }
            setPayError('The payment page could not open. Try again.');
        } finally {
            if (lock === payLock.current) setPaying(false);
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-7" data-testid="account-plans">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <p className="text-pf-sky text-xs font-semibold uppercase tracking-[0.16em] font-jakarta mb-2">
                        Subscriptions
                    </p>
                    <h1 className="text-[28px] sm:text-[32px] font-bold font-outfit text-pf-navy leading-[1.15]">
                        Choose your PetroFI plan
                    </h1>
                    <p className="mt-2 text-[15px] text-slate-500 font-jakarta leading-relaxed max-w-xl">
                        Your free trial is ending soon. Choose a plan to keep using PetroFI without interruption.
                    </p>
                </div>
                <p
                    className="self-start sm:self-auto inline-flex items-center rounded-full bg-emerald-400 text-emerald-950 px-3 py-1.5 text-xs font-bold font-jakarta"
                    data-testid="plans-trial-pill"
                >
                    {trial.pill}
                </p>
            </header>

            <section className="relative overflow-hidden rounded-2xl bg-pf-navy text-white p-5 sm:p-7 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pf-sky/15 blur-2xl pointer-events-none" />
                <div className="relative">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pf-sky font-jakarta">
                        Your current trial
                    </p>
                    <h2 className="mt-3 text-xl sm:text-2xl font-bold font-outfit leading-tight">
                        Keep your PetroFI account active
                    </h2>
                    <p className="mt-2 text-sm text-white/70 font-jakarta leading-relaxed max-w-2xl">
                        {trial.detail} Select a plan to continue using your pump data, reports and PetroFI features without interruption.
                    </p>

                    <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 pt-5 border-t border-white/10">
                        <div className="sm:pr-6">
                            <dt className="text-xs font-medium text-white/55 font-jakarta">Trial status</dt>
                            <dd className="mt-1 text-base sm:text-lg font-bold font-outfit text-white leading-tight">
                                {trial.status}
                            </dd>
                        </div>
                        <div className="sm:px-6 sm:border-l sm:border-white/10">
                            <dt className="text-xs font-medium text-white/55 font-jakarta">Access</dt>
                            <dd className="mt-1 text-base sm:text-lg font-bold font-outfit text-white leading-tight">
                                Full PetroFI access
                            </dd>
                        </div>
                        <div className="sm:pl-6 sm:border-l sm:border-white/10">
                            <dt className="text-xs font-medium text-white/55 font-jakarta">After trial</dt>
                            <dd className="mt-1 text-base sm:text-lg font-bold font-outfit text-white leading-tight">
                                Choose a paid plan
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>

            {error ? (
                <p className="text-sm text-rose-600 font-jakarta">{error}</p>
            ) : null}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {quotes.map((plan) => {
                    const perMonth = plan.months > 0 ? plan.base / plan.months : plan.base;
                    return (
                        <article
                            key={plan.id}
                            data-testid={`plan-card-${plan.id}`}
                            className={`${cardClass} relative p-5 sm:p-6 flex flex-col ${
                                plan.featured ? 'ring-2 ring-emerald-400' : ''
                            }`}
                        >
                            {plan.featured ? (
                                <p className="absolute -top-2.5 left-5 inline-flex rounded-full bg-emerald-400 text-emerald-950 px-2.5 py-0.5 text-[10px] font-bold tracking-wide font-jakarta">
                                    BEST VALUE
                                </p>
                            ) : null}

                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 font-jakarta pr-4">
                                {plan.name}
                            </p>

                            <div className="mt-3">
                                <div className="relative inline-flex items-end gap-2 pr-2 flex-wrap">
                                    <p className="text-[32px] leading-none font-bold font-outfit text-pf-navy">
                                        {formatMoney(plan.base, plan.currency)}
                                    </p>
                                    {plan.billedAs ? (
                                        <span className="mb-0.5 text-xs font-medium text-slate-400 font-jakarta whitespace-nowrap">
                                            {plan.billedAs}
                                        </span>
                                    ) : null}
                                </div>
                                <p className="mt-2 text-sm font-semibold font-jakarta text-pf-navy">
                                    {formatMoney(perMonth, plan.currency)} per month
                                </p>
                            </div>

                            <p className="mt-6 text-sm font-bold font-outfit text-pf-navy">+{plan.gstPct}% GST</p>
                            <p className="mt-2 text-sm text-slate-600 font-jakarta leading-snug">{plan.period}</p>

                            <ul className="mt-3 space-y-1.5">
                                {BENEFITS.map((item) => (
                                    <li
                                        key={item}
                                        className="grid grid-cols-[16px_minmax(0,1fr)] gap-x-2 items-start text-sm leading-snug text-slate-600 font-jakarta"
                                    >
                                        <span className="mt-px h-4 w-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Check size={10} strokeWidth={2.75} />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPayError('');
                                        setSelected(plan);
                                    }}
                                    className={`inline-flex w-full items-center justify-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold font-jakarta ${
                                        plan.featured
                                            ? 'bg-pf-navy text-white hover:bg-pf-navy/90'
                                            : 'border border-slate-200 text-pf-navy hover:bg-slate-50'
                                    }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </section>

            {quotes.length ? (
                <section className="relative overflow-hidden rounded-2xl bg-[#E8F4FC] text-pf-navy p-5 sm:p-7 border-2 border-pf-sky shadow-[0_10px_32px_rgba(13,27,62,0.06)]">
                    <h2 className="text-2xl sm:text-3xl font-bold font-outfit leading-tight">Plan prices</h2>
                    <p className="mt-1 text-sm text-slate-600 font-jakarta">GST is applied at the rate stored on each plan.</p>
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm font-jakarta">
                            <thead>
                                <tr className="text-xs text-slate-500">
                                    <th className="pb-3 font-semibold">Plan</th>
                                    <th className="pb-3 font-semibold">Base</th>
                                    <th className="pb-3 font-semibold">GST</th>
                                    <th className="pb-3 font-semibold">Total</th>
                                    <th className="pb-3 font-semibold">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.map((plan) => (
                                    <tr key={plan.id} className="border-t border-sky-200/70">
                                        <td className="py-3 font-semibold text-pf-navy">{plan.name}</td>
                                        <td className="py-3 font-semibold text-pf-navy">
                                            {formatMoney(plan.base, plan.currency)}
                                        </td>
                                        <td className="py-3 text-slate-600">
                                            {formatMoney(plan.gst, plan.currency)} ({plan.gstPct}%)
                                        </td>
                                        <td className="py-3 font-semibold text-pf-navy">
                                            {formatMoney(plan.total, plan.currency)}
                                        </td>
                                        <td className="py-3 text-slate-600">
                                            {plan.days} days · {plan.months} {plan.months === 1 ? 'month' : 'months'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 text-xs text-slate-500 font-jakarta">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="inline-flex items-center gap-1.5">
                        <Shield size={13} className="text-pf-sky" />
                        Secure payments
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <FileText size={13} className="text-pf-sky" />
                        GST invoice · Transparent billing
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {gstLabel ? <span className="font-bold text-pf-navy">{gstLabel}</span> : null}
                    <a href="tel:+917398621812" className="inline-flex items-center gap-1.5 font-semibold text-pf-navy hover:text-pf-sky">
                        <Phone size={13} />
                        Need help? +91 73986 21812
                    </a>
                </div>
            </footer>

            <ConfirmPayDialog
                open={Boolean(selected)}
                plan={selected}
                billing={billing}
                paying={paying}
                error={payError}
                onOpenChange={(next) => {
                    if (!next) {
                        payLock.current += 1;
                        setPaying(false);
                        setSelected(null);
                        setPayError('');
                    }
                }}
                onConfirm={handleConfirmPay}
            />
        </div>
    );
};

export default PlansPanel;
