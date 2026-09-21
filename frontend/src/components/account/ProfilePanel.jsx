import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { getAuthDisplayName } from '../../lib/auth';
import {
    daysUntil,
    formatDate,
    periodProgress,
    remainingLabel,
    roleLabel,
    titleCase,
} from '../../lib/subscription';
import { cardClass, FieldRow, GateCard, LoadingState, PageIntro, StatusPill } from './AccountBits';

const Metric = ({ label, value, hint }) => (
    <div>
        <p className="text-xs font-medium text-white/55 font-jakarta mb-1">{label}</p>
        <p className="text-lg sm:text-xl font-bold font-outfit text-white leading-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-white/60 font-jakarta">{hint}</p> : null}
    </div>
);

const ProfilePanel = () => {
    const { user, loading, reason, profile, pump } = useOutletContext();
    const remaining = daysUntil(pump?.endDate);
    const progress = periodProgress(pump?.startDate, pump?.endDate);
    const location = [pump?.city, pump?.state].filter(Boolean).join(', ');
    const displayName = profile?.name || getAuthDisplayName(user);
    const status = pump?.subscriptionStatus;

    if (loading) return <LoadingState />;

    if (reason === 'unavailable') {
        return (
            <GateCard
                title="Account details are not available right now"
                body="Please try again in a few minutes."
            />
        );
    }

    if (reason === 'load_failed') {
        return (
            <GateCard
                title="We could not load this pump"
                body="Please refresh the page. If this continues, contact PetroFI support."
            />
        );
    }

    return (
        <div className="space-y-5 sm:space-y-6" data-testid="account-profile">
            <PageIntro
                kicker="Profile"
                title={displayName ? `Hello, ${displayName}` : 'Your pump'}
                text="This is the live status of this PetroFI login: plan, valid till, and pump details."
            />

            <section className="relative overflow-hidden rounded-2xl bg-pf-navy text-white p-6 sm:p-8 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pf-sky/15 blur-2xl pointer-events-none" />
                <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-pf-sky font-jakarta mb-2">
                                {pump?.code || 'Pump'}
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-bold font-outfit leading-tight">
                                {pump?.name || 'No pump linked yet'}
                            </h2>
                            {location ? (
                                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/70 font-jakarta">
                                    <MapPin size={14} />
                                    {location}
                                </p>
                            ) : (
                                <p className="mt-2 text-sm text-white/70 font-jakarta">
                                    {pump ? 'Location not set' : 'Wait for PetroFI to approve your pump, or pick a plan.'}
                                </p>
                            )}
                        </div>
                        {status ? <StatusPill value={status} /> : null}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-6 border-t border-white/10">
                        <Metric
                            label="Subscription"
                            value={titleCase(status || 'None')}
                            hint={pump?.active ? 'App access is on' : 'App access is off'}
                        />
                        <Metric
                            label="Plan"
                            value={titleCase(pump?.plan)}
                            hint={titleCase(pump?.billingCycle)}
                        />
                        <Metric
                            label="Valid till"
                            value={formatDate(pump?.endDate)}
                            hint={pump?.startDate ? `From ${formatDate(pump.startDate)}` : 'No start date'}
                        />
                        <Metric
                            label="Time left"
                            value={remaining == null ? 'Not set' : remainingLabel(remaining)}
                            hint={pump?.paymentVerified ? 'Payment verified' : 'Payment not verified'}
                        />
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
                    <h3 className="text-lg font-bold font-outfit text-pf-navy mb-1">Account</h3>
                    <p className="text-sm text-slate-500 font-jakarta mb-2">Who is signed in on this login.</p>
                    <dl>
                        <FieldRow label="Name" value={profile?.name || displayName} />
                        <FieldRow label="Role" value={roleLabel(profile?.role)} />
                        <FieldRow label="Email" value={user.email} />
                        <FieldRow label="Phone" value={user.phone} />
                    </dl>
                </section>

                <section className={`${cardClass} p-6 sm:p-7`}>
                    <h3 className="text-lg font-bold font-outfit text-pf-navy mb-1">Pump</h3>
                    <p className="text-sm text-slate-500 font-jakarta mb-2">The petrol pump tied to this account.</p>
                    {pump ? (
                        <dl>
                            <FieldRow label="Name" value={pump.name} />
                            <FieldRow label="Code" value={pump.code} />
                            <FieldRow label="Owner" value={pump.ownerName} />
                            <FieldRow label="City" value={location} />
                            <FieldRow label="Phone" value={pump.phone} />
                            <FieldRow label="Email" value={pump.email} />
                            <FieldRow label="Registration" value={<StatusPill value={pump.registrationStatus} />} />
                        </dl>
                    ) : (
                        <div className="pt-3">
                            <p className="text-sm text-slate-500 font-jakarta leading-relaxed mb-4">
                                No pump is linked yet. You can still see plans and wait for approval.
                            </p>
                            <Link
                                to="/subscription/plans"
                                className="inline-flex items-center gap-2 bg-pf-navy text-white px-4 py-2.5 rounded-full text-sm font-semibold font-jakarta hover:bg-pf-navy/90"
                            >
                                See subscriptions <ArrowRight size={15} />
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePanel;
