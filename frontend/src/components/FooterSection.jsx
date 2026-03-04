import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';

const LINKS = {
    Product: ['Features', 'Dashboard', 'Reports', 'Mobile App'],
    Company: ['About PetroFi', 'Contact', 'Blog', 'Careers'],
    Support: ['Help Center', 'Book Demo', 'WhatsApp Support', 'Training'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Security'],
};

const FooterSection = () => {
    const scrollToDemo = () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });

    return (
        <footer data-testid="footer-section" className="bg-pf-navy border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
                    {/* Brand col */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src="https://customer-assets.emergentagent.com/job_shift-clarity/artifacts/zbnh3pqn_app_icon.png"
                                alt="PetroFi"
                                className="w-9 h-9 object-contain"
                            />
                            <span className="text-xl font-bold text-white font-outfit">PetroFi</span>
                        </div>
                        <p className="text-slate-400 font-jakarta text-sm leading-relaxed max-w-xs mb-6">
                            The complete operations platform built specifically for petrol pump owners and managers in India.
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

                    {/* Link columns */}
                    {Object.entries(LINKS).map(([category, items]) => (
                        <div key={category}>
                            <p className="text-white font-semibold font-outfit text-sm mb-4">{category}</p>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item}>
                                        <button
                                            onClick={item === 'Book Demo' ? scrollToDemo : undefined}
                                            className="text-slate-400 hover:text-white text-sm font-jakarta text-left"
                                            style={{ transition: 'color 0.2s ease' }}
                                            data-testid={`footer-link-${item.replace(/\s+/g, '-').toLowerCase()}`}
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-xs font-jakarta">
                        © {new Date().getFullYear()} PetroFi. All rights reserved. Built for Indian Petrol Pump Owners.
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
            </div>
        </footer>
    );
};

export default FooterSection;
