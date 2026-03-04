import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Screenshots', id: 'screenshots' },
    { label: 'Request Demo', id: 'demo' },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
    };

    return (
        <header
            data-testid="navbar"
            className={`fixed top-0 left-0 right-0 z-50 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'}`}
            style={{ transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease' }}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img
                        src="https://customer-assets.emergentagent.com/job_shift-clarity/artifacts/zbnh3pqn_app_icon.png"
                        alt="PetroFI Logo"
                        className="w-9 h-9 object-contain"
                    />
                    <span className="text-xl font-bold text-pf-navy font-outfit">PetroFI</span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-7">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => scrollTo(link.id)}
                            className="text-sm font-medium text-slate-600 hover:text-pf-navy font-jakarta"
                            style={{ transition: 'color 0.2s ease' }}
                            data-testid={`nav-link-${link.id}`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="hidden md:block">
                    <button
                        onClick={() => scrollTo('demo')}
                        data-testid="nav-book-demo-btn"
                        className="bg-pf-sky text-white px-5 py-2 rounded-lg text-sm font-semibold font-jakarta hover:bg-[#2aa5f0] shadow-sm"
                        style={{ transition: 'background-color 0.2s ease, box-shadow 0.2s ease' }}
                    >
                        Book Demo
                    </button>
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden text-pf-navy"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    data-testid="mobile-menu-toggle"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => scrollTo(link.id)}
                            className="block w-full text-left text-sm font-medium text-slate-700 hover:text-pf-navy font-jakarta py-3 border-b border-slate-50"
                            data-testid={`mobile-nav-${link.id}`}
                        >
                            {link.label}
                        </button>
                    ))}
                    <button
                        onClick={() => scrollTo('demo')}
                        className="w-full bg-pf-sky text-white py-2.5 rounded-lg text-sm font-semibold font-jakarta mt-2"
                        data-testid="mobile-book-demo-btn"
                    >
                        Book Demo
                    </button>
                </div>
            )}
        </header>
    );
};

export default Navbar;
