import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { scrollToId } from '../lib/utils';

const FinalCTASection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section data-testid="final-cta-section" className="py-20 md:py-24 bg-pf-navy relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pf-sky/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-white leading-tight mb-4">
                        Stop Managing Your Petrol Pump With Registers.
                        <span className="block">Start Running It With Real Data.</span>
                    </h2>
                    <p className="text-slate-400 font-jakarta text-base mb-10 max-w-xl mx-auto">
                        Run your petrol pump with numbers you can actually see.
                    </p>
                    <div className="inline-flex flex-col sm:flex-row gap-3 items-stretch mx-auto">
                        <button
                            onClick={() => scrollToId('download')}
                            data-testid="final-cta-trial-btn"
                            className="flex items-center justify-center gap-1.5 bg-pf-sky text-white px-5 py-2.5 rounded-full font-semibold font-jakarta text-sm hover:bg-[#2aa5f0] shadow-lg whitespace-nowrap"
                            style={{ transition: 'background-color 0.2s ease' }}
                        >
                            START YOUR FREE 30-DAY TRIAL <ArrowRight size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToId('demo')}
                            data-testid="final-cta-demo-btn"
                            className="flex items-center justify-center gap-1.5 border-2 border-white/30 text-white px-5 py-2.5 rounded-full font-semibold font-jakarta text-sm hover:border-white hover:bg-white/5 whitespace-nowrap"
                            style={{ transition: 'border-color 0.2s ease, background-color 0.2s ease' }}
                        >
                            BOOK A DEMO
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FinalCTASection;
