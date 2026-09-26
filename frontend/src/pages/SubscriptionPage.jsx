import React, { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import AccountSidebar, { AccountMobileHeader, AccountMobileTabBar } from '../components/account/AccountSidebar';
import LoginForm from '../components/LoginForm';
import Navbar from '../components/Navbar';
import RegisterPumpDialog from '../components/RegisterPumpDialog';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { fetchPumpSubscription } from '../lib/subscription';

const TRIAL_POINTS = [
    '30 days of full access on your pump',
    'Our team completes the setup with you',
    'No payment required to begin',
];

function SubscriptionPage() {
    const { user, loading: authLoading } = useAuth();
    const [registerOpen, setRegisterOpen] = useState(false);
    const [registerPrefill, setRegisterPrefill] = useState(null);
    const [state, setState] = useState({
        loading: true,
        reason: '',
        profile: null,
        pump: null,
        subscription: null,
        history: [],
    });

    usePageMeta({
        title: 'Account | PetroFI',
        robots: 'noindex, nofollow, noarchive, nosnippet',
    });

    useEffect(() => {
        let cancelled = false;

        if (authLoading) return undefined;
        if (!user) {
            setState({
                loading: false,
                reason: 'signed_out',
                profile: null,
                pump: null,
                subscription: null,
                history: [],
            });
            return undefined;
        }

        setState((prev) => ({ ...prev, loading: true, reason: '' }));
        fetchPumpSubscription().then((result) => {
            if (cancelled) return;
            if (!result.ok) {
                setState({
                    loading: false,
                    reason: result.reason,
                    profile: null,
                    pump: null,
                    subscription: null,
                    history: [],
                });
                return;
            }
            setState({
                loading: false,
                reason: '',
                profile: result.profile,
                pump: result.pump,
                subscription: result.subscription,
                history: result.history,
            });
        });

        return () => {
            cancelled = true;
        };
    }, [authLoading, user]);

    const outletContext = useMemo(() => ({
        user,
        loading: authLoading || state.loading,
        reason: state.reason,
        profile: state.profile,
        pump: state.pump,
        subscription: state.subscription,
        history: state.history,
    }), [user, authLoading, state]);

    if (authLoading) {
        return (
            <div className="h-dvh bg-[#F3F6FB] flex items-center justify-center">
                <div className="h-9 w-9 rounded-full border-2 border-slate-200 border-t-pf-navy animate-spin" aria-label="Loading" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-dvh overflow-hidden bg-white text-pf-navy flex flex-col" data-testid="account-login-page">
                <Navbar forceSolid />
                <div className="flex-1 min-h-0 pt-16 flex flex-col lg:grid lg:grid-cols-2 overflow-y-auto lg:overflow-hidden">
                    <aside className="relative bg-pf-navy text-white flex lg:h-full lg:overflow-y-auto">
                        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-pf-sky/20 blur-3xl pointer-events-none" />
                        <div className="absolute -left-16 bottom-0 w-56 h-56 rounded-full bg-pf-sky/10 blur-3xl pointer-events-none" />
                        <div className="relative m-auto w-full max-w-[440px] px-8 py-12 sm:px-12 lg:px-14">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pf-sky font-jakarta">
                                30 days free
                            </p>
                            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-bold font-outfit leading-[1.12]">
                                Start your free trial
                            </h1>
                            <p className="mt-4 text-[15px] text-white/70 font-jakarta leading-relaxed">
                                Start a 30-day trial. Share a few details and we complete the setup. No payment to begin.
                            </p>
                            <ul className="mt-8 space-y-3.5">
                                {TRIAL_POINTS.map((point) => (
                                    <li key={point} className="flex items-center gap-3 text-[15px] font-jakarta text-white">
                                        <span className="h-6 w-6 rounded-full bg-pf-sky text-pf-navy flex items-center justify-center shrink-0">
                                            <Check size={13} strokeWidth={2.75} />
                                        </span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={() => {
                                    setRegisterPrefill(null);
                                    setRegisterOpen(true);
                                }}
                                data-testid="account-register-pump"
                                className="mt-10 inline-flex items-center justify-center gap-2 w-full bg-pf-sky text-pf-navy px-7 py-3 rounded-full text-sm font-bold font-jakarta hover:bg-pf-sky/90"
                            >
                                Start free trial <ArrowRight size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setRegisterPrefill(null);
                                    setRegisterOpen(true);
                                }}
                                className="mt-4 block w-full text-center text-sm font-semibold text-white/70 hover:text-white font-jakarta"
                            >
                                Book a live demo
                            </button>
                        </div>
                    </aside>
                    <main className="bg-[#F3F6FB] flex flex-1 lg:h-full lg:overflow-y-auto">
                        <div className="m-auto w-full max-w-[440px] px-6 py-12 sm:px-10">
                            <div
                                id="account-login"
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_18px_50px_rgba(13,27,62,0.08)] p-7 sm:p-9"
                            >
                                <LoginForm
                                    hideTrialNote
                                    onRegister={() => {
                                        setRegisterPrefill(null);
                                        setRegisterOpen(true);
                                    }}
                                    onUnregistered={(prefill) => {
                                        setRegisterPrefill(prefill);
                                        setRegisterOpen(true);
                                    }}
                                />
                            </div>
                        </div>
                    </main>
                </div>
                <RegisterPumpDialog
                    open={registerOpen}
                    onOpenChange={(next) => {
                        setRegisterOpen(next);
                        if (!next) setRegisterPrefill(null);
                    }}
                    source="account-login"
                    variant="account"
                    prefill={registerPrefill}
                />
            </div>
        );
    }

    return (
        <div className="h-dvh overflow-hidden bg-[#F3F6FB] text-pf-navy">
            <div className="h-dvh flex">
                <AccountSidebar profile={state.profile} />
                <div className="flex-1 min-w-0 h-full flex flex-col">
                    <AccountMobileHeader />
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-5 sm:py-8">
                            <main id="main-content" aria-label="Account">
                                <Outlet context={outletContext} />
                            </main>
                        </div>
                    </div>
                    <AccountMobileTabBar />
                </div>
            </div>
        </div>
    );
}

export default SubscriptionPage;
