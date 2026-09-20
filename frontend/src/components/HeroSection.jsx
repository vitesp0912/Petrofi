import React from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { scrollToId } from '../lib/utils';

const HeroSection = () => {
    return (
        <section
            id="hero"
            data-testid="hero-section"
            className="relative min-h-[100svh] flex items-center pt-16 pb-10 lg:pb-12 overflow-hidden"
        >
            <img
                src="/PETROFIHERO.webp"
                alt="PetroFI on phone and laptop at a petrol pump, showing sales, cash, expenses and tank stock"
                className="absolute inset-0 w-full h-full object-cover object-center lg:object-[72%_center]"
            />
            <div
                className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/25 lg:via-white/80 lg:to-transparent pointer-events-none"
                aria-hidden
            />
            <div
                className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/30 lg:from-white/20 pointer-events-none"
                aria-hidden
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-pf-sky/10 text-pf-sky text-xs font-semibold px-4 py-2 rounded-full font-jakarta mb-3 lg:mb-4 border border-pf-sky/20">
                        <span className="w-1.5 h-1.5 bg-pf-sky rounded-full animate-pulse-dot" />
                        Trusted by 500+ Petrol Pump Owners
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-outfit text-pf-navy leading-[1.15] mb-3 lg:mb-4">
                        Best Petrol Pump Software in India.{' '}
                        <span className="gradient-text">One app, full control.</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 font-jakarta leading-relaxed mb-4 lg:mb-5 max-w-xl">
                        PetroFI is petrol pump management software that tracks sales, staff shifts, cash reconciliation,
                        and credit, all in one platform. The petrol pump software trusted by 500+ owners in India.
                    </p>

                    <div className="inline-flex flex-col sm:flex-row gap-3 items-stretch mx-auto lg:mx-0">
                        <button
                            onClick={() => scrollToId('pricing')}
                            data-testid="hero-trial-btn"
                            className="flex items-center justify-center gap-1.5 bg-pf-navy text-white px-5 py-2.5 rounded-full font-semibold font-jakarta text-sm hover:bg-pf-navy/90 shadow-lg whitespace-nowrap"
                            style={{ transition: 'background-color 0.2s ease, box-shadow 0.2s ease' }}
                        >
                            Start Your Free 30-Day Trial <ArrowRight size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToId('download')}
                            data-testid="hero-download-btn"
                            className="flex items-center justify-center gap-1.5 border border-slate-200 text-pf-navy px-5 py-2.5 rounded-full font-semibold font-jakarta text-sm hover:border-pf-sky hover:text-pf-sky bg-white whitespace-nowrap"
                            style={{ transition: 'border-color 0.2s ease, color 0.2s ease' }}
                        >
                            <Download size={15} /> Download App
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
