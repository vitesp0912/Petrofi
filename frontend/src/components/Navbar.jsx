import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, LogOut, Menu, Phone, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuthDisplayName, getAuthInitials } from '../lib/auth';
import LoginDialog from './LoginDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

const NAV_LINKS = [
    { label: 'Features', id: 'tracks' },
    { label: 'How it Works', id: 'how-it-works' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Download', id: 'download' },
];

const PHONES = [
    { label: '+91 73986 21812', href: 'tel:+917398621812' },
    { label: '+91 87001 17495', href: 'tel:+918700117495' },
];

const Navbar = ({ forceSolid = false }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';
    const solid = forceSolid || !isHome || scrolled;
    const accountLabel = getAuthDisplayName(user);
    const accountInitials = getAuthInitials(user);

    const openLogin = () => {
        setMobileOpen(false);
        setLoginOpen(true);
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const handleSignOut = async () => {
        setMobileOpen(false);
        await signOut();
        if (location.pathname.startsWith('/subscription')) {
            navigate('/');
        }
    };

    const goToSection = (id) => {
        setMobileOpen(false);
        if (isHome) {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        navigate('/', { state: { scrollTo: id } });
    };

    return (
        <header
            data-testid="navbar"
            className={`fixed top-0 left-0 right-0 z-50 ${solid ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'}`}
            style={{ transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease' }}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-[1fr_auto] md:grid-cols-3 items-center gap-4">
                <Link
                    to="/"
                    className="flex items-center gap-2 justify-self-start"
                    onClick={() => {
                        if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <img
                        src="https://customer-assets.emergentagent.com/job_shift-clarity/artifacts/zbnh3pqn_app_icon.png"
                        alt="PetroFI Logo"
                        className="w-9 h-9 object-contain"
                    />
                    <span className="text-xl font-bold text-pf-navy font-outfit">PetroFI</span>
                </Link>

                <div className="hidden md:flex items-center justify-center gap-7">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => goToSection(link.id)}
                            className="text-sm font-medium text-slate-600 hover:text-pf-navy font-jakarta"
                            style={{ transition: 'color 0.2s ease' }}
                            data-testid={`nav-link-${link.id}`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                <div className="justify-self-end flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => goToSection('pricing')}
                        data-testid="nav-start-free-btn"
                        className="hidden md:inline-flex items-center h-10 bg-pf-navy text-white px-5 rounded-lg text-sm font-semibold font-jakarta hover:bg-pf-navy/90 shadow-sm"
                        style={{ transition: 'background-color 0.2s ease, box-shadow 0.2s ease' }}
                    >
                        Start Free Trial
                    </button>
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    data-testid="nav-account-btn"
                                    aria-label={accountLabel}
                                    className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-pf-navy text-white text-[11px] font-bold font-outfit hover:bg-pf-navy/90"
                                    style={{ transition: 'background-color 0.2s ease' }}
                                >
                                    {accountInitials}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-[70] w-56 rounded-xl border-slate-100 bg-white text-pf-navy">
                                <DropdownMenuLabel className="font-jakarta text-xs text-slate-500 font-medium">
                                    Signed in
                                </DropdownMenuLabel>
                                <p className="px-2 pb-2 text-sm font-semibold font-jakarta truncate">{accountLabel}</p>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="font-jakarta cursor-pointer"
                                    onSelect={() => navigate('/subscription')}
                                    data-testid="nav-subscription"
                                >
                                    <CreditCard size={14} />
                                    Subscription
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="font-jakarta cursor-pointer text-red-600 focus:text-red-600"
                                    onSelect={() => handleSignOut()}
                                    data-testid="nav-sign-out"
                                >
                                    <LogOut size={14} />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <button
                            type="button"
                            onClick={openLogin}
                            data-testid="nav-login-btn"
                            className="inline-flex items-center h-10 border border-pf-navy bg-white/90 text-pf-navy px-3.5 sm:px-4 rounded-lg text-sm font-semibold font-jakarta hover:bg-pf-navy hover:text-white"
                            style={{ transition: 'background-color 0.2s ease, color 0.2s ease' }}
                        >
                            Login
                        </button>
                    )}
                    <button
                        className="md:hidden text-pf-navy relative z-[60]"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        data-testid="mobile-menu-toggle"
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            <div
                className={`md:hidden fixed inset-0 z-40 bg-pf-navy/40 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ transition: 'opacity 0.25s ease' }}
                onClick={() => setMobileOpen(false)}
                aria-hidden={!mobileOpen}
            />
            <div
                className={`md:hidden fixed top-0 right-0 z-50 h-[100dvh] w-[min(20rem,86vw)] bg-white shadow-2xl flex flex-col ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ transition: 'transform 0.3s ease' }}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
            >
                <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
                    <span className="text-base font-bold font-outfit text-pf-navy">Menu</span>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="text-pf-navy"
                        aria-label="Close menu"
                    >
                        <X size={22} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => goToSection(link.id)}
                            className="block w-full text-left text-sm font-medium text-slate-700 hover:text-pf-navy font-jakarta py-3.5 border-b border-slate-100"
                            data-testid={`mobile-nav-${link.id}`}
                        >
                            {link.label}
                        </button>
                    ))}

                    <p className="text-[11px] font-semibold font-jakarta uppercase tracking-widest text-pf-sky mt-6 mb-3">
                        Call us
                    </p>
                    {PHONES.map((phone) => (
                        <a
                            key={phone.href}
                            href={phone.href}
                            className="flex items-center gap-3 text-sm font-medium text-pf-navy font-jakarta py-2.5"
                        >
                            <span className="w-8 h-8 rounded-full bg-pf-sky/10 flex items-center justify-center shrink-0">
                                <Phone size={14} className="text-pf-sky" />
                            </span>
                            {phone.label}
                        </a>
                    ))}
                </div>
                <div className="p-5 border-t border-slate-100 space-y-2.5">
                    {user ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileOpen(false);
                                    navigate('/subscription');
                                }}
                                className="w-full border border-slate-200 text-pf-navy py-3 rounded-lg text-sm font-semibold font-jakarta"
                                data-testid="mobile-subscription-btn"
                            >
                                Subscription
                            </button>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="w-full border border-slate-200 text-pf-navy py-3 rounded-lg text-sm font-semibold font-jakarta"
                                data-testid="mobile-sign-out-btn"
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={openLogin}
                            className="w-full border border-pf-navy text-pf-navy py-3 rounded-lg text-sm font-semibold font-jakarta"
                            data-testid="mobile-login-btn"
                        >
                            Login
                        </button>
                    )}
                    <button
                        onClick={() => goToSection('pricing')}
                        className="w-full bg-pf-navy text-white py-3 rounded-lg text-sm font-semibold font-jakarta"
                        data-testid="mobile-start-free-btn"
                    >
                        Start Free Trial
                    </button>
                </div>
            </div>
            <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
        </header>
    );
};

export default Navbar;
