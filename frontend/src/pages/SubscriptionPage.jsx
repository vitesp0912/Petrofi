import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarRange, CreditCard, MapPin, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import FooterSection from '../components/FooterSection';
import LoginDialog from '../components/LoginDialog';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import {
    daysUntil,
    fetchPumpSubscription,
    formatDate,
    formatMoney,
    roleLabel,
    statusTone,
    titleCase,
} from '../lib/subscription';

function SubscriptionPage() {
    const { user, loading: authLoading } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [state, setState] = useState({ loading: true, reason: '', profile: null, pump: null, history: [] });

    usePageMeta({
        title: 'Subscription | PetroFI',
        description: 'View your PetroFI petrol pump subscription details.',
        canonical: 'https://www.petrofi.in/subscription',
        robots: 'noindex, nofollow',
    });

    useEffect(() => {
        let cancelled = false;

        if (authLoading) return undefined;
        if (!user) {
            setState({ loading: false, reason: 'signed_out', profile: null, pump: null, history: [] });
            return undefined;
        }

        setState((prev) => ({ ...prev, loading: true, reason: '' }));
        fetchPumpSubscription().then((result) => {
            if (cancelled) return;
            if (!result.ok) {
                setState({ loading: false, reason: result.reason, profile: null, pump: null, history: [] });
                return;
            }
            setState({
                loading: false,
                reason: '',
                profile: result.profile,
                pump: result.pump,
                history: result.history,
            });
        });

        return () => {
            cancelled = true;
        };
    }, [authLoading, user]);

    const pump = state.pump;
    const remaining = daysUntil(pump?.endDate);
    const location = [pump?.city, pump?.state].filter(Boolean).join(', ');

    return (
        <div className="min-h-screen bg-[#F4F7FB] text-pf-navy">
            <Navbar forceSolid />
            <main id="main-content" aria-label="Subscription" className="pt-16">
                <header className="relative bg-pf-navy overflow-hidden">
                    <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-pf-sky/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                        <p className="text-pf-sky text-xs font-semibold uppercase tracking-widest font-jakarta mb-3">
                            Your pump
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-bold font-outfit text-white leading-tight">
                            Subscription
                        </h1>
                        <p className="mt-3 text-slate-300 font-jakarta text-sm sm:text-base max-w-2xl leading-relaxed">
                            Plan, billing, and status for the petrol pump on this PetroFI account.
                        </p>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {authLoading || state.loading ? (
                        <LoadingState />
                    ) : !user || state.reason === 'signed_out' ? (
                        <GateCard
                            title="Log in to see your subscription"
                            body="Use the phone number or email on your PetroFI account to view this pump’s plan and billing details."
                            action="Log in"
                            onAction={() => setLoginOpen(true)}
                        />
                    ) : state.reason === 'unavailable' ? (
                        <GateCard
                            title="Subscription details are not available right now"
                            body="Please try again in a few minutes."
                        />
                    ) : state.reason === 'load_failed' ? (
                        <GateCard
                            title="We could not load this pump’s subscription"
                            body="Please refresh the page. If this continues, contact PetroFI support."
                        />
                    ) : !pump ? (
                        <GateCard
                            title="No petrol pump is linked to this account yet"
                            body="If you just registered, wait for PetroFI to approve your pump. You can also go back to the homepage or contact support."
                            action="Back to homepage"
                            to="/"
                        />
                    ) : (
                        <div className="space-y-6">
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-jakarta mb-1">
                                            {pump.code || 'Pump'}
                                        </p>
                                        <h2 className="text-2xl font-bold font-outfit text-pf-navy">{pump.name}</h2>
                                        {location ? (
                                            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500 font-jakarta">
                                                <MapPin size={14} className="text-pf-sky" />
                                                {location}
                                            </p>
                                        ) : null}
                                    </div>
                                    <StatusPill value={pump.subscriptionStatus} />
                                </div>

                                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Detail label="Owner" value={pump.ownerName || state.profile?.name || 'Not set'} />
                                    <Detail label="Your role" value={roleLabel(state.profile?.role)} />
                                    <Detail label="Pump phone" value={pump.phone || 'Not set'} />
                                    <Detail label="Pump email" value={pump.email || 'Not set'} />
                                </dl>
                            </section>

                            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SummaryCard
                                    icon={CreditCard}
                                    label="Plan"
                                    value={titleCase(pump.plan)}
                                    hint={titleCase(pump.billingCycle)}
                                />
                                <SummaryCard
                                    icon={CalendarRange}
                                    label="Current period"
                                    value={formatDate(pump.startDate)}
                                    hint={pump.endDate ? `Renews or ends ${formatDate(pump.endDate)}` : 'No end date on file'}
                                />
                                <SummaryCard
                                    icon={ShieldCheck}
                                    label="Payment"
                                    value={pump.paymentVerified ? 'Verified' : 'Not verified'}
                                    hint={remaining == null ? 'No end date on file' : remaining >= 0 ? `${remaining} day${remaining === 1 ? '' : 's'} remaining` : `${Math.abs(remaining)} day${Math.abs(remaining) === 1 ? '' : 's'} overdue`}
                                />
                            </section>

                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
                                <h3 className="text-lg font-bold font-outfit text-pf-navy mb-4">Plan details</h3>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Detail label="Subscription status" value={<StatusPill value={pump.subscriptionStatus} />} />
                                    <Detail label="Registration" value={<StatusPill value={pump.registrationStatus} />} />
                                    <Detail label="Pump access" value={pump.active ? 'Active' : 'Inactive'} />
                                    <Detail label="Billing cycle" value={titleCase(pump.billingCycle)} />
                                    <Detail label="Start date" value={formatDate(pump.startDate)} />
                                    <Detail label="End date" value={formatDate(pump.endDate)} />
                                </dl>
                            </section>

                            {state.history.length > 0 ? (
                                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
                                    <h3 className="text-lg font-bold font-outfit text-pf-navy mb-4">Billing history</h3>
                                    <div className="overflow-x-auto -mx-1 sm:mx-0">
                                        <table className="w-full min-w-[520px] text-left text-sm font-jakarta">
                                            <thead>
                                                <tr className="text-xs uppercase tracking-wide text-slate-400">
                                                    <th className="pb-3 font-semibold">Plan</th>
                                                    <th className="pb-3 font-semibold">Status</th>
                                                    <th className="pb-3 font-semibold">Period</th>
                                                    <th className="pb-3 font-semibold">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {state.history.map((row, index) => (
                                                    <tr key={`${row.plan}-${row.startDate}-${index}`} className="border-t border-slate-100">
                                                        <td className="py-3 font-semibold text-pf-navy">{titleCase(row.plan)}</td>
                                                        <td className="py-3">{titleCase(row.status)}</td>
                                                        <td className="py-3 text-slate-600">
                                                            {formatDate(row.startDate)} – {formatDate(row.endDate)}
                                                        </td>
                                                        <td className="py-3 text-slate-700">{formatMoney(row.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            ) : null}

                            <p className="text-sm text-slate-500 font-jakarta">
                                Need a change to this plan? Call{' '}
                                <a href="tel:+917398621812" className="font-semibold text-pf-navy hover:text-pf-sky">
                                    +91 73986 21812
                                </a>
                                {' '}or{' '}
                                <Link to="/" className="font-semibold text-pf-navy hover:text-pf-sky">
                                    go back to the homepage
                                </Link>
                                .
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <FooterSection />
            <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
        </div>
    );
}

const StatusPill = ({ value }) => (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold font-jakarta ${statusTone(value)}`}>
        {titleCase(value)}
    </span>
);

const Detail = ({ label, value }) => (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
        <dt className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 font-jakarta mb-1">{label}</dt>
        <dd className="text-sm font-semibold text-pf-navy font-jakarta">{value}</dd>
    </div>
);

const SummaryCard = ({ icon: Icon, label, value, hint }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="w-9 h-9 rounded-xl bg-pf-sky/10 text-pf-sky flex items-center justify-center mb-3">
            <Icon size={16} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 font-jakarta">{label}</p>
        <p className="mt-1 text-lg font-bold font-outfit text-pf-navy">{value}</p>
        <p className="mt-1 text-xs text-slate-500 font-jakarta">{hint}</p>
    </div>
);

const GateCard = ({ title, body, action, onAction, to }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-xl" data-testid="subscription-gate">
        <div className="w-10 h-10 rounded-xl bg-pf-sky/10 text-pf-sky flex items-center justify-center mb-4">
            <Building2 size={18} />
        </div>
        <h2 className="text-xl font-bold font-outfit text-pf-navy mb-2">{title}</h2>
        <p className="text-sm text-slate-500 font-jakarta leading-relaxed">{body}</p>
        {action && to ? (
            <Link
                to={to}
                className="inline-flex mt-5 bg-pf-navy text-white px-4 py-2.5 rounded-lg text-sm font-semibold font-jakarta hover:bg-pf-navy/90"
            >
                {action}
            </Link>
        ) : null}
        {action && onAction ? (
            <button
                type="button"
                onClick={onAction}
                className="inline-flex mt-5 bg-pf-navy text-white px-4 py-2.5 rounded-lg text-sm font-semibold font-jakarta hover:bg-pf-navy/90"
            >
                {action}
            </button>
        ) : null}
    </div>
);

const LoadingState = () => (
    <div className="space-y-4" data-testid="subscription-loading">
        <div className="h-40 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            <div className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            <div className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        </div>
    </div>
);

export default SubscriptionPage;
