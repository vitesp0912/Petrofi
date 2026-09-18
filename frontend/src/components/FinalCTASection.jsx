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
                        KNOW WHERE EVERY RUPEE STANDS.
                    </h2>
                    <p className="text-slate-400 font-jakarta text-base mb-10 max-w-xl mx-auto">
                        Run your petrol pump with numbers you can actually see.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => scrollToId('download')}
                            data-testid="final-cta-trial-btn"
                            className="flex items-center justify-center gap-2 bg-pf-sky text-white px-8 py-4 rounded-xl font-bold font-jakarta text-base hover:bg-[#2aa5f0] shadow-xl"
                            style={{ transition: 'background-color 0.2s ease' }}
                        >
                            START YOUR FREE 30-DAY TRIAL <ArrowRight size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToId('demo')}
                            data-testid="final-cta-demo-btn"
                            className="flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold font-jakarta text-base hover:border-white hover:bg-white/5"
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
