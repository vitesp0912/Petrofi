import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Check, FileText, Phone, Shield, Timer } from 'lucide-react';
import {
    daysUntil,
    daysUntilEarlyBirdEnd,
    formatDateLong,
    formatMoney,
    GST_RATE,
    isEarlyBirdActive,
    PETROFI_PLANS,
    planPrice,
    remainingLabel,
    STANDARD_FROM_LABEL,
} from '../../lib/subscription';
import { cardClass } from './AccountBits';

const gstPct = Math.round(GST_RATE * 100);

const BENEFITS = [
    'All PetroFI features',
    'Your existing pump data stays intact',
    'No setup required',
    'Continue without interruption',
];

const PLAN_COPY = {
    'first-year': {
        cta: 'Continue with 1 Year',
        period: 'Covers 12 months after payment.',
    },
    'six-months': {
        cta: 'Continue with 6 Months',
        period: 'Covers 6 months after payment.',
    },
    monthly: {
        cta: 'Continue Monthly',
        period: 'Billed every month after payment.',
    },
};

function trialCopy(pump) {
    const remaining = daysUntil(pump?.endDate);
    const dateLabel = formatDateLong(pump?.endDate);

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
    const { pump } = useOutletContext();
    const early = isEarlyBirdActive();
    const trial = trialCopy(pump);
    const daysLeft = daysUntilEarlyBirdEnd();
    const yearPlan = PETROFI_PLANS.find((plan) => plan.id === 'first-year');
    const monthlyPlan = PETROFI_PLANS.find((plan) => plan.id === 'monthly');
    const year = planPrice(yearPlan);
    const monthly = planPrice(monthlyPlan);
    const rows = PETROFI_PLANS.map((plan) => ({
        plan,
        name: plan.name,
        now: early && !plan.noDiscount ? plan.earlyBird : plan.standard,
        later: plan.standard,
        price: planPrice(plan),
    }));

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

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {PETROFI_PLANS.map((plan) => {
                    const price = planPrice(plan);
                    const copy = PLAN_COPY[plan.id];
                    const showSave = early && !plan.noDiscount && price.saved > 0;
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
                            <div className="absolute top-3 right-3 z-10">
                                {plan.noDiscount ? (
                                    <p className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-bold font-jakarta">
                                        No discount
                                    </p>
                                ) : null}
                                {showSave ? (
                                    <p className="rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold font-outfit">
                                        Save {formatMoney(price.saved)}
                                    </p>
                                ) : null}
                            </div>

                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 font-jakarta pr-20">
                                {plan.name}
                            </p>

                            <div className="mt-3">
                                {showSave ? (
                                    <p className="text-sm text-slate-400 font-outfit line-through">
                                        {formatMoney(plan.standard)}
                                    </p>
                                ) : (
                                    <p className="h-5" aria-hidden="true" />
                                )}
                                <div className="relative inline-flex items-end gap-2 pr-2 flex-wrap">
                                    <p className="text-[32px] leading-none font-bold font-outfit text-pf-navy">
                                        {formatMoney(price.base)}
                                    </p>
                                    {plan.billedAs ? (
                                        <span className="mb-0.5 text-xs font-medium text-slate-400 font-jakarta whitespace-nowrap">
                                            {plan.billedAs}
                                        </span>
                                    ) : null}
                                    {showSave ? (
                                        <span className="-mt-1.5 -rotate-12 rounded-md bg-rose-500 px-2 py-1 text-[11px] font-extrabold tracking-wide text-white shadow-[0_6px_14px_rgba(225,29,72,0.35)] font-outfit">
                                            {price.off}% OFF
                                        </span>
                                    ) : null}
                                </div>
                                <p
                                    className={`mt-2 text-sm font-semibold font-jakarta ${
                                        plan.id === 'monthly' ? 'invisible' : 'text-pf-navy'
                                    }`}
                                >
                                    {formatMoney(price.perMonth)} per month
                                </p>
                            </div>

                            <p className="mt-6 text-sm font-bold font-outfit text-pf-navy">+{gstPct}% GST</p>
                            <p className="mt-2 text-sm text-slate-600 font-jakarta leading-snug">{copy.period}</p>

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
                                <Link
                                    to={`/subscription/payments?plan=${plan.id}`}
                                    className={`inline-flex w-full items-center justify-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold font-jakarta ${
                                        plan.featured
                                            ? 'bg-pf-navy text-white hover:bg-pf-navy/90'
                                            : 'border border-slate-200 text-pf-navy hover:bg-slate-50'
                                    }`}
                                >
                                    {copy.cta}
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="relative overflow-hidden rounded-2xl bg-[#E8F4FC] text-pf-navy p-5 sm:p-7 border-2 border-pf-sky shadow-[0_10px_32px_rgba(13,27,62,0.06)]">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pf-sky/20 blur-2xl pointer-events-none" />
                <div className="relative">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 text-emerald-950 px-3 py-1 text-xs font-bold font-jakarta">
                            Early launch
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-pf-navy font-jakarta ring-1 ring-sky-100">
                            <Timer size={13} className="text-pf-sky" />
                            {early ? `${daysLeft} days left` : 'Offer ended'}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-outfit leading-tight">
                        {early ? `1 year for ${formatMoney(year.base)}` : `Prices from ${STANDARD_FROM_LABEL}`}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 font-jakarta">
                        {early
                            ? `After 31 Dec this is ${formatMoney(yearPlan.standard)}. You save ${formatMoney(year.saved)}. Monthly stays ${formatMoney(monthly.base)}. No cut.`
                            : 'GST is extra on every plan.'}
                    </p>

                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm font-jakarta">
                            <thead>
                                <tr className="text-xs text-slate-500">
                                    <th className="pb-3 font-semibold">Plan</th>
                                    <th className="pb-3 font-semibold">Now</th>
                                    <th className="pb-3 font-semibold">Per month</th>
                                    <th className="pb-3 font-semibold">After 31 Dec</th>
                                    <th className="pb-3 font-semibold">You save</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.name} className="border-t border-sky-200/70">
                                        <td className="py-3 font-semibold text-pf-navy">{row.name}</td>
                                        <td className="py-3 font-semibold text-pf-navy">{formatMoney(row.now)}</td>
                                        <td className="py-3 text-slate-600">{formatMoney(row.price.perMonth)}</td>
                                        <td className="py-3 text-slate-400">{formatMoney(row.later)}</td>
                                        <td className="py-3 text-emerald-700 font-semibold">
                                            {row.plan.noDiscount ? 'No cut' : formatMoney(row.price.saved)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 font-jakarta">
                        1 year is {formatMoney(year.perMonth)} a month now. Monthly plan is {formatMoney(monthly.base)} with no discount.
                    </p>
                </div>
            </section>

            <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 text-xs text-slate-500 font-jakarta">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="inline-flex items-center gap-1.5">
                        <Shield size={13} className="text-pf-sky" />
                        Secure payments · Powered by Cashfree
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <FileText size={13} className="text-pf-sky" />
                        GST invoice · Transparent billing
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold text-pf-navy">+{gstPct}% GST</span>
                    <a href="tel:+917398621812" className="inline-flex items-center gap-1.5 font-semibold text-pf-navy hover:text-pf-sky">
                        <Phone size={13} />
                        Need help? +91 73986 21812
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default PlansPanel;
