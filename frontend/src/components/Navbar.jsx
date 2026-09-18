import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { label: 'Features', id: 'tracks' },
    { label: 'How it Works', id: 'how-it-works' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Download', id: 'download' },
];

const Navbar = ({ forceSolid = false }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';
    const solid = forceSolid || !isHome || scrolled;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

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

                <div className="justify-self-end flex items-center gap-3">
                    <button
                        onClick={() => goToSection('demo')}
                        data-testid="nav-book-demo-btn"
                        className="hidden md:inline-flex text-sm font-medium text-slate-600 hover:text-pf-navy font-jakarta"
                        style={{ transition: 'color 0.2s ease' }}
                    >
                        Book a Demo
                    </button>
                    <button
                        onClick={() => goToSection('pricing')}
                        data-testid="nav-start-free-btn"
                        className="hidden md:inline-flex bg-pf-navy text-white px-5 py-2 rounded-lg text-sm font-semibold font-jakarta hover:bg-pf-navy/90 shadow-sm"
                        style={{ transition: 'background-color 0.2s ease, box-shadow 0.2s ease' }}
                    >
                        Start Free Trial
                    </button>
                    <button
                        className="md:hidden text-pf-navy"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        data-testid="mobile-menu-toggle"
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => goToSection(link.id)}
                            className="block w-full text-left text-sm font-medium text-slate-700 hover:text-pf-navy font-jakarta py-3 border-b border-slate-50"
                            data-testid={`mobile-nav-${link.id}`}
                        >
                            {link.label}
                        </button>
                    ))}
                    <button
                        onClick={() => goToSection('demo')}
                        className="block w-full text-left text-sm font-medium text-slate-700 hover:text-pf-navy font-jakarta py-3 border-b border-slate-50"
                        data-testid="mobile-nav-demo"
                    >
                        Book a Demo
                    </button>
                    <button
                        onClick={() => goToSection('pricing')}
                        className="w-full bg-pf-navy text-white py-2.5 rounded-lg text-sm font-semibold font-jakarta mt-2"
                        data-testid="mobile-start-free-btn"
                    >
                        Start Free Trial
                    </button>
                </div>
            )}
        </header>
    );
};

export default Navbar;
