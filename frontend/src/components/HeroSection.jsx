import React from 'react';
import { ArrowRight, Download, ShieldCheck, Zap, Eye } from 'lucide-react';

const TRUST_BADGES = [
    { icon: ShieldCheck, label: 'Built for Petrol Pump Owners' },
    { icon: Zap, label: 'Real-Time Visibility' },
    { icon: Eye, label: 'Operational Transparency' },
];

const HeroSection = () => {
    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <section
            id="hero"
            data-testid="hero-section"
            className="relative min-h-screen max-h-screen flex items-center pt-14 pb-8 lg:pt-16 lg:pb-10 bg-white overflow-hidden"
        >
            {/* Background dot pattern */}
            <div className="absolute inset-0 dot-pattern opacity-60 pointer-events-none" />
            {/* Gradient blob */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pf-sky/5 rounded-full blur-3xl pointer-events-none" />
            {/* Logo watermark — 10% opacity */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                    src="https://customer-assets.emergentagent.com/job_shift-clarity/artifacts/zbnh3pqn_app_icon.png"
                    alt=""
                    aria-hidden
                    className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 opacity-10 object-contain select-none"
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
                {/* Left content */}
                <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-pf-sky/10 text-pf-sky text-xs font-semibold px-4 py-2 rounded-full font-jakarta mb-3 lg:mb-4 border border-pf-sky/20">
                        <span className="w-1.5 h-1.5 bg-pf-sky rounded-full animate-pulse-dot" />
                        Trusted by 500+ Petrol Pump Owners
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-outfit text-pf-navy leading-[1.15] mb-3 lg:mb-4">
                        Best Petrol Pump Software in India.{' '}
                        <span className="gradient-text">One app, full control.</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 font-jakarta leading-relaxed mb-4 lg:mb-5 max-w-xl">
                        PetroFi is petrol pump management software that tracks sales, staff shifts, cash reconciliation,
                        and credit, all in one platform. The petrol pump software trusted by 500+ owners in India.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-3 mb-5 lg:mb-6">
                        <button
                            onClick={() => scrollTo('demo')}
                            data-testid="hero-book-demo-btn"
                            className="flex items-center gap-2 bg-pf-navy text-white px-6 py-3 rounded-lg font-semibold font-jakarta text-sm hover:bg-pf-navy/90 shadow-lg"
                            style={{ transition: 'background-color 0.2s ease, box-shadow 0.2s ease' }}
                        >
                            Book Live Demo <ArrowRight size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
                            data-testid="hero-download-btn"
                            className="flex items-center gap-2 border border-slate-200 text-pf-navy px-6 py-3 rounded-lg font-semibold font-jakarta text-sm hover:border-pf-sky hover:text-pf-sky bg-white"
                            style={{ transition: 'border-color 0.2s ease, color 0.2s ease' }}
                        >
                            <Download size={16} /> Download App
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-4">
                        {TRUST_BADGES.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-2">
                                <Icon size={14} className="text-pf-sky" />
                                <span className="text-xs text-slate-500 font-jakarta">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Mobile app image — desktop only; on mobile it appears in next section */}
                <div className="hidden lg:flex justify-center pl-4 lg:pl-6 pr-4 lg:pr-6 phone-slide-in-wrap">
                    <div className="phone-slide-in w-full max-w-[240px] lg:max-w-[260px] flex justify-center">
                        <img
                            src="/mobile.png"
                            alt="PetroFi mobile app"
                            className="w-full animate-float object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
