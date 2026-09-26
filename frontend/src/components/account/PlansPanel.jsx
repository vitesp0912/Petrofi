import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowRight, Check, FileText, Phone, Shield } from 'lucide-react';
import { formatMoney, isActiveSubscription, trialCopy } from '../../lib/subscription';
import {
    createPaymentOrder,
    fetchPaymentCatalog,
    paymentErrorText,
    savePaymentStatus,
    startHostedCheckout,
} from '../../lib/payments';
import CurrentPlanView, { CurrentPlanSkeleton } from './CurrentPlanView';
import { ConfirmPayDialog } from './PaymentDialogs';
import { Bone, cardClass } from './AccountBits';

const PlansSkeleton = () => (
    <div className="max-w-7xl mx-auto min-w-0 space-y-6 sm:space-y-7" data-testid="account-plans-skeleton" aria-busy="true" aria-live="polite">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
                <Bone className="h-3 w-28 bg-sky-100" />
                <Bone className="mt-3 h-8 sm:h-9 w-64 sm:w-80 max-w-full" />
                <Bone className="mt-3 h-4 w-72 sm:w-[26rem] max-w-full" />
            </div>
            <Bone className="h-8 w-36 rounded-full bg-emerald-100" />
        </header>
        <section className="relative overflow-hidden rounded-2xl bg-pf-navy p-5 sm:p-7 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
            <div className="flex items-center justify-between gap-3">
                <Bone className="h-5 w-24 rounded-full bg-white/20" />
                <Bone className="h-3 w-36 max-w-[45%] bg-white/15" />
            </div>
            <Bone className="mt-3 h-6 w-72 max-w-full bg-white/25" />
            <Bone className="mt-4 h-3 w-28 bg-white/15" />
            <div className="mt-2 grid grid-cols-3 gap-3 max-w-lg">
                {[0, 1, 2].map((item) => (
                    <div key={item} className={item ? 'pl-3 border-l border-white/10' : ''}>
                        <Bone className="h-3 w-14 bg-white/15" />
                        <Bone className="mt-1.5 h-5 w-16 bg-white/25" />
                    </div>
                ))}
            </div>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3 min-[1200px]:gap-4 pt-1">
            {[0, 1, 2].map((card) => (
                <article key={card} className={`${cardClass} p-5 sm:p-6 min-[1200px]:p-6 lg:max-[1199px]:p-4 flex flex-col min-h-0`}>
                    <Bone className="h-3 w-16" />
                    <Bone className="mt-4 h-8 w-28" />
                    <Bone className="mt-2 h-4 w-24" />
                    <Bone className="mt-6 h-4 w-20" />
                    <Bone className="mt-2 h-4 w-40 max-w-full" />
                    <div className="mt-4 space-y-2">
                        {[0, 1, 2, 3].map((row) => (
                            <div key={row} className="flex items-center gap-2">
                                <Bone className="h-4 w-4 rounded-full bg-emerald-100" />
                                <Bone className="h-3.5 flex-1" />
                            </div>
                        ))}
                    </div>
                    <Bone className="mt-6 h-10 w-full rounded-full" />
                </article>
            ))}
        </section>
        <section className="relative overflow-hidden rounded-2xl bg-[#E8F4FC] p-5 sm:p-7 border-2 border-pf-sky/40">
            <Bone className="h-7 w-36" />
            <Bone className="mt-2 h-4 w-56 max-w-full" />
            <div className="mt-6 overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="grid grid-cols-5 gap-4 pb-3">
                        {[0, 1, 2, 3, 4].map((col) => (
                            <Bone key={col} className="h-3 w-14" />
                        ))}
                    </div>
                    {[0, 1, 2].map((row) => (
                        <div key={row} className="grid grid-cols-5 gap-4 items-center border-t border-sky-200/70 py-3">
                            <Bone className="h-4 w-16" />
                            <Bone className="h-4 w-14" />
                            <Bone className="h-4 w-16" />
                            <Bone className="h-4 w-16" />
                            <Bone className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
);

const BENEFITS = [
    'All PetroFI features',
    'Your existing pump data stays intact',
    'No setup required',
    'Download unlimited reports',
];

const LIST_PRICE = {
    month: 750,
    half: 4500,
    year: 7500,
};

function listPriceFor(plan) {
    const days = Number(plan.days);
    const months = Number(plan.months);
    if (days === 30 || months === 1) return LIST_PRICE.month;
    if (days === 180 || months === 6) return LIST_PRICE.half;
    if (days === 365 || days === 366 || months >= 12) return LIST_PRICE.year;
    return null;
}

function offPercent(list, sale) {
    const full = Number(list);
    const now = Number(sale);
    if (!Number.isFinite(full) || !Number.isFinite(now) || full <= now) return null;
    return Math.max(1, Math.round(((full - now) / full) * 100));
}

function nowPriceFor(quotes, later) {
    const found = (quotes || []).find((plan) => listPriceFor(plan) === later);
    const value = Number(found?.base);
    if (Number.isFinite(value) && value > 0) return value;
    if (later === LIST_PRICE.month) return 649;
    if (later === LIST_PRICE.half) return 2999;
    return 4999;
}

function savedAmount(list, sale) {
    const full = Number(list);
    const now = Number(sale);
    if (!Number.isFinite(full) || !Number.isFinite(now) || full <= now) return null;
    return Math.round((full - now) * 100) / 100;
}

const PlansPanel = () => {
    const { user, loading: pageLoading, profile, pump, subscription } = useOutletContext();
    const active = isActiveSubscription(subscription);
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
        if (pageLoading) return undefined;
        if (active) {
            setLoading(false);
            setQuotes([]);
            setError('');
            return undefined;
        }

        let cancelled = false;
        setLoading(true);
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
    }, [pageLoading, active]);

    const gstLabel = quotes[0] ? `+${quotes[0].gstPct}% GST` : null;
    const billing = {
        name: profile?.name || user?.email || '',
        pumpName: pump?.name || '',
        email: user?.email || pump?.email || '',
        phone: pump?.phone || user?.phone || '',
        address: [pump?.address, pump?.city, pump?.state, pump?.pincode].filter(Boolean).join(', '),
    };

    const handleConfirmPay = async (draft) => {
        if (!selected || paying) return;
        const lock = ++payLock.current;
        setPaying(true);
        setPayError('');
        const created = await createPaymentOrder({
            planId: selected.id,
            name: draft?.name,
            pumpName: draft?.pumpName,
            email: draft?.email,
            phone: draft?.phone,
            address: draft?.address,
        });
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

    if (pageLoading) return active ? <CurrentPlanSkeleton /> : <PlansSkeleton />;
    if (active) return <CurrentPlanView pump={pump} subscription={subscription} />;
    if (loading) return <PlansSkeleton />;

    return (
        <div className="max-w-7xl mx-auto min-w-0 space-y-6 sm:space-y-7" data-testid="account-plans">
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

            {error ? (
                <p className="text-sm text-rose-600 font-jakarta">{error}</p>
            ) : null}

            <section className="relative overflow-hidden rounded-2xl bg-pf-navy text-white p-5 sm:p-7 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pf-sky/15 blur-2xl pointer-events-none" />
                <svg
                    className="hidden lg:block pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 h-[124px] w-[124px] text-white opacity-[0.12]"
                    viewBox="0 0 96 96"
                    fill="none"
                    aria-hidden="true"
                >
                    <rect x="18" y="22" width="60" height="54" rx="8" stroke="currentColor" strokeWidth="3" />
                    <path d="M18 38h60" stroke="currentColor" strokeWidth="3" />
                    <path d="M34 16v12M62 16v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="36" cy="54" r="3" fill="currentColor" />
                    <circle cx="48" cy="54" r="3" fill="currentColor" />
                    <circle cx="60" cy="54" r="3" fill="currentColor" />
                    <circle cx="36" cy="66" r="3" fill="currentColor" />
                    <circle cx="48" cy="66" r="3" fill="currentColor" />
                </svg>
                <div className="relative flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="inline-flex self-start items-center rounded-full bg-pf-sky text-pf-navy px-2.5 py-0.5 text-[10px] font-bold tracking-wide font-jakarta">
                        Early Launch
                    </p>
                    <p className="text-[10px] sm:text-[11px] leading-snug text-white/55 font-jakarta sm:text-right">
                        All prices are exclusive of 18% GST*
                    </p>
                </div>
                <h2 className="relative mt-3 text-[clamp(1.05rem,2.4vw,1.35rem)] font-bold font-outfit leading-tight max-w-4xl lg:pr-28">
                    Early launch prices if you buy before{' '}
                    <span className="whitespace-nowrap">31 December, 2026</span>
                </h2>
                <p className="relative mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-pf-sky font-jakarta">
                    From 1 January, 2027
                </p>
                <dl className="relative mt-3 grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl">
                    {[
                        { label: 'Monthly', later: LIST_PRICE.month },
                        { label: 'Half yearly', later: LIST_PRICE.half },
                        { label: 'Yearly', later: LIST_PRICE.year },
                    ].map((row, index) => (
                        <div
                            key={row.label}
                            className={`min-w-0 ${index ? 'pl-3 sm:pl-4 border-l border-white/10' : 'pr-2'}`}
                        >
                            <dt className="text-[11px] sm:text-xs text-white/55 font-jakarta">{row.label}</dt>
                            <dd className="mt-0.5 flex items-center gap-1 sm:gap-1.5 text-[13px] sm:text-base font-bold font-outfit leading-tight">
                                <span className="text-white">{formatMoney(nowPriceFor(quotes, row.later))}</span>
                                <ArrowRight size={14} strokeWidth={2.4} className="shrink-0 text-white/40" />
                                <span className="text-white/45">{formatMoney(row.later)}</span>
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3 min-[1200px]:gap-4 pt-1">
                {quotes.map((plan) => {
                    const monthly = Number(plan.days) === 30 || Number(plan.months) === 1;
                    const perMonth = Math.round(plan.months > 0 ? plan.base / plan.months : plan.base);
                    const listPrice = listPriceFor(plan);
                    const off = offPercent(listPrice, plan.base);
                    const saved = savedAmount(listPrice, plan.base);
                    return (
                        <article
                            key={plan.id}
                            data-testid={`plan-card-${plan.id}`}
                            className={`${cardClass} relative p-5 sm:p-6 lg:max-[1199px]:p-4 min-[1200px]:p-6 flex flex-col min-w-0 ${
                                plan.featured ? 'ring-2 ring-emerald-400' : ''
                            }`}
                        >
                            {plan.featured ? (
                                <p className="absolute -top-2.5 left-5 inline-flex rounded-full bg-emerald-400 text-emerald-950 px-2.5 py-0.5 text-[10px] font-bold tracking-wide font-jakarta">
                                    BEST VALUE
                                </p>
                            ) : null}

                            {saved ? (
                                <p className="pf-sale-woosh absolute top-3 right-3 z-10 rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold font-outfit">
                                    Save {formatMoney(saved, plan.currency)}
                                </p>
                            ) : null}

                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 font-jakarta pr-24">
                                {plan.name}
                            </p>

                            <div className="mt-3 pr-24">
                                <div className="flex items-center gap-2 h-[22px]">
                                    {listPrice ? (
                                        <span className="invisible text-sm font-semibold font-outfit" aria-hidden="true">
                                            {formatMoney(listPrice, plan.currency)}
                                        </span>
                                    ) : null}
                                    {off ? (
                                        <span className="pf-off-pop -mt-2.5 -rotate-12 rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-white shadow-[0_5px_12px_rgba(225,29,72,0.32)] font-outfit">
                                            {off}% OFF
                                        </span>
                                    ) : null}
                                </div>
                                <div className="relative mt-1 min-h-8">
                                    {listPrice ? (
                                        <p className="pf-list-fly">{formatMoney(listPrice, plan.currency)}</p>
                                    ) : null}
                                    <div className={`${listPrice ? 'pf-sale-woosh ' : ''}relative inline-flex items-end gap-2 pr-2 flex-wrap`}>
                                        <p className="text-[32px] leading-none font-bold font-outfit text-pf-navy">
                                            {formatMoney(plan.base, plan.currency)}
                                        </p>
                                        {plan.billedAs ? (
                                            <span className="mb-0.5 text-xs font-medium text-slate-400 font-jakarta whitespace-nowrap">
                                                {plan.billedAs}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-rose-500 font-jakarta">
                                    Early launch price
                                </p>
                                <p
                                    className={`mt-2 text-sm font-semibold font-jakarta ${
                                        monthly ? 'invisible' : 'text-pf-navy'
                                    }`}
                                >
                                    {formatMoney(perMonth, plan.currency)} per month
                                </p>
                            </div>

                            <p className="mt-6 text-sm font-bold font-outfit text-pf-navy">+{plan.gstPct}% GST</p>
                            <p className="mt-2 text-sm text-slate-600 font-jakarta leading-snug">{plan.period}</p>

                            <ul className="mt-auto pt-5 space-y-1.5">
                                {BENEFITS.map((item) => (
                                    <li
                                        key={item}
                                        className="grid grid-cols-[16px_minmax(0,1fr)] gap-x-2 items-center text-sm leading-5 text-slate-600 font-jakarta"
                                    >
                                        <span className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Check size={10} strokeWidth={2.75} />
                                        </span>
                                        <span className="min-w-0">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPayError('');
                                        setSelected(plan);
                                    }}
                                    className={`inline-flex w-full min-h-11 items-center justify-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold font-jakarta ${
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
                    <p className="absolute top-3 right-4 sm:top-5 sm:right-6 max-w-[46%] text-right text-[10px] sm:text-[11px] leading-snug text-slate-500 font-jakarta">
                        All prices are exclusive of 18% GST*
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold font-outfit leading-tight pr-[42%]">Plan prices</h2>
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
                                            {Number(plan.days)} days
                                            {Number(plan.days) !== 30 && Number(plan.months) > 0 ? (
                                                <>
                                                    {' '}
                                                    <strong className="font-bold text-pf-navy">
                                                        ({Number(plan.months)} {Number(plan.months) === 1 ? 'month' : 'months'})
                                                    </strong>
                                                </>
                                            ) : null}
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
