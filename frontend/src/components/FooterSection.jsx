import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ExternalLink } from 'lucide-react';

const LINKS = {
    Product: [
        { label: 'Features', hash: 'features' },
        { label: 'Dashboard', hash: 'features' },
        { label: 'Reports', hash: 'features' },
        { label: 'Mobile App', hash: 'download' },
    ],
    Company: [
        { label: 'About PetroFI', to: '/' },
        { label: 'Contact', hash: 'demo' },
        { label: 'Blog' },
        { label: 'Careers' },
    ],
    Support: [
        { label: 'Help Center' },
        { label: 'Book Demo', hash: 'demo' },
        { label: 'WhatsApp Support' },
        { label: 'Training' },
    ],
    Legal: [
        { label: 'Privacy Policy', to: '/privacy-policy' },
        { label: 'Terms of Service', to: '/terms-of-service' },
        { label: 'Refund Policy' },
        { label: 'Security' },
    ],
};

const FooterSection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    const goToHash = (hash) => {
        if (isHome) {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        navigate('/', { state: { scrollTo: hash } });
    };

    return (
        <footer data-testid="footer-section" className="bg-pf-navy border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img
                                src="https://customer-assets.emergentagent.com/job_shift-clarity/artifacts/zbnh3pqn_app_icon.png"
                                alt="PetroFI"
                                className="w-9 h-9 object-contain"
                            />
                            <span className="text-xl font-bold text-white font-outfit">PetroFI</span>
                        </Link>
                        <p className="text-slate-400 font-jakarta text-sm leading-relaxed max-w-xs mb-6">
                            Petrol pump management software and operations platform for petrol pump owners and managers in India.
                        </p>
                        <a
                            href="mailto:petrofibusiness@gmail.com"
                            className="flex items-center gap-2 text-pf-sky text-sm font-jakarta hover:text-white"
                            style={{ transition: 'color 0.2s ease' }}
                            data-testid="footer-email-link"
                        >
                            <Mail size={14} /> petrofibusiness@gmail.com
                        </a>
                    </div>

                    {Object.entries(LINKS).map(([category, items]) => (
                        <div key={category}>
                            <p className="text-white font-semibold font-outfit text-sm mb-4">{category}</p>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <FooterLink
                                            item={item}
                                            onHash={goToHash}
                                            testId={`footer-link-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-xs font-jakarta text-center sm:text-left">
                        © {new Date().getFullYear()} PetroFI. All rights reserved. Built for Indian Petrol Pump Owners.
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://apps.apple.com/in/app/petrofi/id6758732447"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-pf-sky text-xs font-jakarta flex items-center gap-1"
                            style={{ transition: 'color 0.2s ease' }}
                            data-testid="footer-appstore-link"
                        >
                            App Store <ExternalLink size={10} />
                        </a>
                        <a
                            href="https://play.google.com/store/apps/details?id=com.petrofi.app&hl=en_IN"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-pf-sky text-xs font-jakarta flex items-center gap-1"
                            style={{ transition: 'color 0.2s ease' }}
                            data-testid="footer-playstore-link"
                        >
                            Google Play <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
                <p className="text-center text-slate-500 text-xs font-jakarta mt-4">
                    Powered by{' '}
                    <a
                        href="https://vitespace.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pf-sky hover:text-white font-semibold"
                        style={{ transition: 'color 0.2s ease' }}
                    >
                        Vitespace
                    </a>
                </p>
            </div>
        </footer>
    );
};

const linkClass =
    'text-slate-400 hover:text-white text-sm font-jakarta text-left';

const FooterLink = ({ item, onHash, testId }) => {
    const style = { transition: 'color 0.2s ease' };

    if (item.to) {
        return (
            <Link to={item.to} className={`${linkClass} block`} style={style} data-testid={testId}>
                {item.label}
            </Link>
        );
    }

    if (item.href) {
        return (
            <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} block`}
                style={style}
                data-testid={testId}
            >
                {item.label}
            </a>
        );
    }

    if (item.hash) {
        return (
            <button
                type="button"
                onClick={() => onHash(item.hash)}
                className={linkClass}
                style={style}
                data-testid={testId}
            >
                {item.label}
            </button>
        );
    }

    return (
        <span className="text-slate-500 text-sm font-jakarta" data-testid={testId}>
            {item.label}
        </span>
    );
};

export default FooterSection;
