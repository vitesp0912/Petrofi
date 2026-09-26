import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CircleUser, CreditCard, Layers, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAuthDisplayName, getAuthInitials } from '../../lib/auth';
import { roleLabel } from '../../lib/subscription';
import { BrandLink } from './AccountBits';

export const ACCOUNT_LINKS = [
    { to: '/subscription', end: true, label: 'Profile', icon: CircleUser, testId: 'account-nav-profile' },
    { to: '/subscription/plans', label: 'Subscriptions', icon: Layers, testId: 'account-nav-plans' },
    { to: '/subscription/payments', label: 'Payments', icon: CreditCard, testId: 'account-nav-payments' },
];

const navClass = (active) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold font-jakarta transition-colors ${
        active
            ? 'bg-pf-navy text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-pf-navy'
    }`;

const AccountSidebar = ({ profile }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const name = profile?.name || getAuthDisplayName(user) || 'Guest';
    const initials = user ? getAuthInitials(user) : 'P';

    const handleSignOut = async () => {
        await signOut();
        if (location.pathname.startsWith('/subscription')) navigate('/');
    };

    return (
        <aside className="hidden lg:flex w-[280px] shrink-0 h-full flex-col bg-white border-r border-slate-200">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                <BrandLink />
            </div>
            <div className="px-5 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-slate-100 text-pf-navy ring-1 ring-slate-200 flex items-center justify-center">
                        {user ? (
                            <span className="text-sm font-bold font-outfit">{initials}</span>
                        ) : (
                            <CircleUser size={22} strokeWidth={1.75} />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold font-outfit text-pf-navy truncate">{name}</p>
                        <p className="text-xs text-slate-500 font-jakarta truncate">
                            {user ? roleLabel(profile?.role) : 'Not signed in'}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Account">
                {ACCOUNT_LINKS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        data-testid={item.testId}
                        className={({ isActive }) => navClass(isActive)}
                    >
                        <item.icon size={16} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="px-3 py-4 border-t border-slate-100 space-y-2">
                <a
                    href="tel:+917398621812"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 font-jakarta hover:bg-slate-100"
                >
                    <Phone size={22} className="shrink-0" />
                    <span className="min-w-0">
                        <span className="block text-[11px] font-semibold text-slate-500">Customer support</span>
                        <span className="block text-sm font-bold text-pf-navy mt-0.5">+91 73986 21812</span>
                    </span>
                </a>
                <button
                    type="button"
                    onClick={handleSignOut}
                    data-testid="account-sign-out"
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-semibold text-red-600 font-jakarta hover:bg-red-50"
                >
                    <LogOut size={16} />
                    Log out
                </button>
            </div>
        </aside>
    );
};

export const AccountMobileHeader = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        if (location.pathname.startsWith('/subscription')) navigate('/');
    };

    return (
        <header
            className="lg:hidden shrink-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-[#F3F6FB]/95 backdrop-blur border-b border-slate-200"
            data-testid="account-mobile-header"
        >
            <BrandLink compact />
            <button
                type="button"
                onClick={handleSignOut}
                data-testid="account-sign-out-mobile"
                className="shrink-0 inline-flex items-center gap-1.5 min-h-11 px-3 py-2 rounded-full text-sm font-semibold text-red-600 bg-white border border-red-100 font-jakarta"
            >
                <LogOut size={14} />
                Log out
            </button>
        </header>
    );
};

export const AccountMobileTabBar = () => (
    <nav
        className="lg:hidden shrink-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
        aria-label="Account"
        data-testid="account-mobile-tabs"
    >
        <div className="grid grid-cols-3">
            {ACCOUNT_LINKS.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    data-testid={`${item.testId}-mobile`}
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-0.5 min-h-14 px-1 pt-2 pb-1.5 text-[11px] font-semibold font-jakarta ${
                            isActive ? 'text-pf-navy' : 'text-slate-400'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <item.icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                            {item.label}
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    </nav>
);

export default AccountSidebar;
