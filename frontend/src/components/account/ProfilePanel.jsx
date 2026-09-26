import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { getAuthDisplayName } from '../../lib/auth';
import { formatDate, isPaidSubscription, paidCopy, periodProgress, roleLabel, titleCase, trialCopy } from '../../lib/subscription';
import { Bone, cardClass, FieldRow, GateCard, PageIntro, StatusPill } from './AccountBits';

const ProfileSkeleton = () => (
    <div className="space-y-5 sm:space-y-6" data-testid="account-profile-skeleton" aria-busy="true" aria-live="polite">
        <header className="mb-6 sm:mb-8">
            <Bone className="h-3 w-16 bg-sky-100" />
            <Bone className="mt-3 h-8 sm:h-9 w-52 sm:w-64" />
            <Bone className="mt-3 h-4 w-72 sm:w-[28rem] max-w-full" />
        </header>
        <section className="relative overflow-hidden rounded-2xl bg-pf-navy p-6 sm:p-8 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
                <div>
                    <Bone className="h-3 w-16 bg-white/20" />
                    <Bone className="mt-3 h-8 w-48 sm:w-64 bg-white/25" />
                    <Bone className="mt-3 h-4 w-40 bg-white/15" />
                </div>
                <Bone className="h-7 w-20 rounded-full bg-white/20" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-6 border-t border-white/10">
                {[0, 1, 2, 3].map((item) => (
                    <div key={item}>
                        <Bone className="h-3 w-16 bg-white/15" />
                        <Bone className="mt-2 h-6 w-24 bg-white/25" />
                    </div>
                ))}
            </div>
            <div className="mt-7">
                <div className="flex items-center justify-between mb-2">
                    <Bone className="h-3 w-24 bg-white/15" />
                    <Bone className="h-3 w-14 bg-white/15" />
                </div>
                <Bone className="h-1.5 w-full rounded-full bg-white/10" />
            </div>
        </section>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {[0, 1].map((card) => (
                <section key={card} className={`${cardClass} p-6 sm:p-7`}>
                    <Bone className="h-5 w-24" />
                    <Bone className="mt-2 h-4 w-48 max-w-full" />
                    <div className="mt-4 space-y-0">
                        {[0, 1, 2, 3].map((row) => (
                            <div key={row} className="flex items-center justify-between gap-6 py-3.5 border-b border-slate-100 last:border-b-0">
                                <Bone className="h-4 w-16" />
                                <Bone className="h-4 w-28" />
                            </div>
                        ))}
                    </div>
                    {card === 0 ? (
                        <div className="mt-4 rounded-xl bg-pf-navy p-4">
                            <Bone className="h-3 w-28 bg-white/20" />
                            <Bone className="mt-2 h-4 w-48 max-w-full bg-white/25" />
                            <Bone className="mt-2 h-3 w-full bg-white/15" />
                            <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                                {[0, 1, 2].map((item) => (
                                    <div key={item}>
                                        <Bone className="h-2.5 w-12 bg-white/15" />
                                        <Bone className="mt-1.5 h-3.5 w-16 bg-white/25" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </section>
            ))}
        </div>
    </div>
);

const Metric = ({ label, value, hint }) => (
    <div>
        <p className="text-[10px] sm:text-xs font-medium text-white/55 font-jakarta mb-0.5 sm:mb-1">{label}</p>
        <p className="text-[15px] sm:text-xl font-bold font-outfit text-white leading-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-white/60 font-jakarta">{hint}</p> : null}
    </div>
);

const ProfilePanel = () => {
    const { user, loading, reason, profile, pump, subscription } = useOutletContext();
    const progress = periodProgress(subscription?.startDate, subscription?.endDate);
    const location = [pump?.city, pump?.state].filter(Boolean).join(', ');
    const displayName = profile?.name || getAuthDisplayName(user);
    const status = subscription?.status;
    const paid = isPaidSubscription(subscription);
    const trial = trialCopy(subscription);
    const paidPlan = paidCopy(subscription);

    if (loading) return <ProfileSkeleton />;

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

            <section className="relative overflow-hidden rounded-2xl bg-pf-navy text-white p-4 sm:p-8 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pf-sky/15 blur-2xl pointer-events-none" />
                <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-7">
                        <div>
                            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-pf-sky font-jakarta mb-1.5 sm:mb-2">
                                {pump?.code || 'Pump'}
                            </p>
                            <h2 className="text-xl sm:text-3xl font-bold font-outfit leading-tight">
                                {pump?.name || 'No pump linked yet'}
                            </h2>
                            {location ? (
                                <p className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 text-[13px] sm:text-sm text-white/70 font-jakarta">
                                    <MapPin size={14} />
                                    {location}
                                </p>
                            ) : (
                                <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm text-white/70 font-jakarta">
                                    {pump ? 'Location not set' : 'Wait for PetroFI to approve your pump, or pick a plan.'}
                                </p>
                            )}
                        </div>
                        {status ? <StatusPill value={status} compact /> : null}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-white/10">
                        <Metric label="Subscription" value={titleCase(status || 'None')} />
                        <Metric label="Plan" value={subscription?.planName || 'Not set'} />
                        <Metric label="Valid till" value={formatDate(subscription?.endDate)} />
                        <Metric label="Time left" value={subscription?.timeLeft || 'Not set'} />
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
                <section className={`${cardClass} p-4 sm:p-7`}>
                    <h3 className="text-base sm:text-lg font-bold font-outfit text-pf-navy mb-2">Account</h3>
                    <dl>
                        <FieldRow label="Name" value={profile?.name || displayName} />
                        <FieldRow label="Role" value={roleLabel(profile?.role)} />
                        <FieldRow label="Email" value={user.email} />
                        <FieldRow label="Phone" value={user.phone} />
                    </dl>
                    <div className="relative mt-4 rounded-xl bg-pf-navy text-white p-4">
                        <Link
                            to="/subscription/plans"
                            aria-label={paid ? 'See current plan' : 'See plans'}
                            className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-white/20"
                        >
                            <ArrowRight size={15} />
                        </Link>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-pf-sky font-jakarta pr-10">
                            {paid ? 'Your current plan' : 'Your current trial'}
                        </p>
                        <p className="mt-1.5 text-sm font-bold font-outfit leading-tight">
                            {paid ? paidPlan.headline : 'Keep your PetroFI account active'}
                        </p>
                        <p className="mt-1 text-xs text-white/70 font-jakarta leading-relaxed">
                            {paid
                                ? paidPlan.detail
                                : `${trial.detail} Select a plan to continue using your pump data, reports and PetroFI features without interruption.`}
                        </p>
                        <dl className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                            <div>
                                <dt className="text-[10px] font-medium text-white/55 font-jakarta">
                                    {paid ? 'Plan status' : 'Trial status'}
                                </dt>
                                <dd className="mt-0.5 text-xs font-bold font-outfit text-white leading-tight">
                                    {paid ? paidPlan.status : trial.status}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[10px] font-medium text-white/55 font-jakarta">Access</dt>
                                <dd className="mt-0.5 text-xs font-bold font-outfit text-white leading-tight">
                                    Full PetroFI access
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[10px] font-medium text-white/55 font-jakarta">
                                    {paid ? 'Valid till' : 'After trial'}
                                </dt>
                                <dd className="mt-0.5 text-xs font-bold font-outfit text-white leading-tight">
                                    {paid ? formatDate(subscription?.endDate) : 'Choose a paid plan'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>

                <section className={`${cardClass} p-4 sm:p-7`}>
                    <h3 className="text-base sm:text-lg font-bold font-outfit text-pf-navy mb-2">Pump</h3>
                    {pump ? (
                        <dl>
                            <FieldRow label="Name" value={pump.name} />
                            <FieldRow label="Code" value={pump.code} />
                            <FieldRow label="Owner" value={pump.ownerName} />
                            <FieldRow label="Address" value={pump.address} />
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
