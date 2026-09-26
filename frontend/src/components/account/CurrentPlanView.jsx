import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, FileText, Phone, Shield } from 'lucide-react';
import {
    formatDate,
    formatDateFull,
    formatMoney,
    paidCopy,
    periodProgress,
    planDurationLabel,
    titleCase,
} from '../../lib/subscription';
import { fetchPaymentCatalog } from '../../lib/payments';
import { Bone, cardClass, FieldRow, StatusPill } from './AccountBits';

const INCLUDED = [
    'All PetroFI features',
    'Your existing pump data stays intact',
    'No setup required',
    'Download unlimited reports',
];

function methodLabel(value) {
    const key = String(value || '').trim().toLowerCase();
    if (!key) return null;
    if (key === 'upi') return 'UPI';
    if (key === 'card' || key === 'cc' || key === 'dc') return 'Card';
    if (key === 'nb' || key === 'netbanking' || key === 'net_banking') return 'Net banking';
    if (key === 'wallet') return 'Wallet';
    return titleCase(value);
}

const Metric = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium text-white/55 font-jakarta mb-1">{label}</p>
        <p className="text-lg sm:text-xl font-bold font-outfit text-white leading-tight">{value}</p>
    </div>
);

const PlanStamp = ({ className = '' }) => (
    <span
        className={`pf-plan-stamp flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full bg-[#00A63E] text-white ${className}`}
        aria-hidden="true"
    >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
                className="pf-result-check"
                d="M6.5 12.5 10 16l7.5-8"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    </span>
);

export const CurrentPlanSkeleton = () => (
    <div className="max-w-7xl mx-auto min-w-0 space-y-6 sm:space-y-7" data-testid="account-current-plan-skeleton" aria-busy="true">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
                <Bone className="h-3 w-28 bg-sky-100" />
                <Bone className="mt-3 h-8 sm:h-9 w-52 sm:w-64 max-w-full" />
                <Bone className="mt-3 h-4 w-72 sm:w-[26rem] max-w-full" />
            </div>
            <Bone className="h-8 w-32 rounded-full bg-emerald-100" />
        </header>
        <section className="relative overflow-hidden rounded-2xl bg-pf-navy p-6 sm:p-8 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
            <Bone className="h-5 w-24 rounded-full bg-white/20" />
            <Bone className="mt-4 h-9 w-48 bg-white/25" />
            <Bone className="mt-3 h-4 w-72 max-w-full bg-white/15" />
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-5 pt-6 border-t border-white/10">
                {[0, 1, 2, 3].map((item) => (
                    <div key={item}>
                        <Bone className="h-3 w-16 bg-white/15" />
                        <Bone className="mt-2 h-6 w-24 bg-white/25" />
                    </div>
                ))}
            </div>
        </section>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {[0, 1].map((card) => (
                <section key={card} className={`${cardClass} p-6 sm:p-7`}>
                    <Bone className="h-5 w-32" />
                    <Bone className="mt-2 h-4 w-48 max-w-full" />
                    <div className="mt-5 space-y-3">
                        {[0, 1, 2, 3].map((row) => (
                            <Bone key={row} className="h-4 w-full" />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    </div>
);

const CurrentPlanView = ({ pump, subscription }) => {
    const copy = paidCopy(subscription);
    const progress = periodProgress(subscription?.startDate, subscription?.endDate);
    const duration = planDurationLabel(subscription);
    const [lastPaid, setLastPaid] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchPaymentCatalog('orders').then((result) => {
            if (cancelled || !result.ok) return;
            const paid = (result.orders || []).find((row) => String(row.status || '').toLowerCase() === 'paid');
            if (paid) setLastPaid(paid);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const lastPaidLine = lastPaid
        ? [
              formatMoney(lastPaid.amount, lastPaid.currency),
              formatDate(lastPaid.paidAt || lastPaid.createdAt),
              methodLabel(lastPaid.paymentMethod),
          ]
              .filter(Boolean)
              .join(', ')
        : null;

    return (
        <div className="max-w-7xl mx-auto min-w-0 space-y-6 sm:space-y-7" data-testid="account-current-plan">
            <header>
                <p className="text-pf-sky text-xs font-semibold uppercase tracking-[0.16em] font-jakarta mb-2">
                    Subscriptions
                </p>
                <h1 className="text-[28px] sm:text-[32px] font-bold font-outfit text-pf-navy leading-[1.15]">
                    Your PetroFI plan
                </h1>
                <p className="mt-2 text-[15px] text-slate-500 font-jakarta leading-relaxed max-w-xl">
                    {copy.detail} Your pump data, reports and PetroFI features stay on this plan.
                </p>
            </header>

            <section className="relative overflow-hidden rounded-2xl bg-pf-navy text-white p-6 sm:p-8 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pf-sky/15 blur-2xl pointer-events-none" />
                <PlanStamp className="absolute top-4 right-4 sm:hidden" />
                <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                        <div className="min-w-0 pr-[5.25rem] sm:pr-0">
                            <p className="inline-flex items-center min-h-8 rounded-full bg-pf-sky text-pf-navy px-3 py-1.5 text-[10px] font-bold tracking-wide font-jakarta">
                                {copy.live ? 'Current plan' : 'Last plan'}
                            </p>
                            <div className="mt-3 flex items-center gap-3 sm:gap-3.5">
                                <h2 className="text-[clamp(1.6rem,3vw,2.1rem)] font-bold font-outfit leading-tight">
                                    {copy.headline}
                                </h2>
                                <PlanStamp className="hidden sm:flex" />
                            </div>
                            <p className="mt-2 text-sm text-white/70 font-jakarta leading-relaxed max-w-2xl">
                                {copy.live
                                    ? `This pump is on ${copy.headline}. Access stays open until ${
                                          formatDateFull(subscription?.endDate) || 'the date on file'
                                      }.`
                                    : copy.detail}
                            </p>
                        </div>
                        {subscription?.status ? <StatusPill value={subscription.status} /> : null}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-6 border-t border-white/10">
                        <Metric label="Started" value={formatDate(subscription?.startDate)} />
                        <Metric label="Valid till" value={formatDate(subscription?.endDate)} />
                        <Metric label="Time left" value={subscription?.timeLeft || copy.status} />
                        <Metric label="Duration" value={duration || 'Not set'} />
                    </div>

                    {progress != null ? (
                        <div className="mt-7">
                            <div className="flex items-center justify-between text-xs font-jakarta mb-2">
                                <span className="text-white/55">Current period</span>
                                <span className="text-white/80">{progress}% used</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-pf-sky" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <section className={`${cardClass} p-6 sm:p-7`}>
                    <h3 className="text-lg font-bold font-outfit text-pf-navy mb-1">What this plan includes</h3>
                    <p className="text-sm text-slate-500 font-jakarta mb-5">
                        The same PetroFI access this pump already uses.
                    </p>
                    <ul className="space-y-2.5">
                        {INCLUDED.map((item) => (
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
                </section>

                <section className={`${cardClass} p-6 sm:p-7`}>
                    <h3 className="text-lg font-bold font-outfit text-pf-navy mb-1">Plan details</h3>
                    <p className="text-sm text-slate-500 font-jakarta mb-2">
                        What is already bought for this pump.
                    </p>
                    <dl>
                        <FieldRow label="Plan" value={subscription?.planName} />
                        <FieldRow label="Status" value={titleCase(subscription?.status)} />
                        <FieldRow label="Duration" value={duration} />
                        <FieldRow label="Pump" value={pump?.name} />
                        {lastPaidLine ? <FieldRow label="Last payment" value={lastPaidLine} /> : null}
                    </dl>
                    <Link
                        to="/subscription/payments"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-pf-navy hover:text-pf-sky font-jakarta"
                    >
                        <FileText size={14} />
                        See transactions
                    </Link>
                </section>
            </div>

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
                <a href="tel:+917398621812" className="inline-flex items-center gap-1.5 font-semibold text-pf-navy hover:text-pf-sky">
                    <Phone size={13} />
                    Need help? +91 73986 21812
                </a>
            </footer>
        </div>
    );
};

export default CurrentPlanView;
