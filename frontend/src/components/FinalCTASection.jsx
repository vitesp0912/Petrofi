import React from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const FinalCTASection = () => {
    const { ref, isVisible } = useScrollAnimation();

    const scrollToDemo = () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });

    return (
        <section data-testid="final-cta-section" className="py-24 bg-pf-navy relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pf-sky/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-white leading-tight mb-5">
                        Stop Managing Your Petrol Pump With Registers.
                        <br />
                        <span className="text-pf-sky">Start Running It With Real Data.</span>
                    </h2>
                    <p className="text-slate-400 font-jakarta text-base mb-10 max-w-xl mx-auto">
                        Join 500+ pump owners who replaced guesswork with clarity. Your first 30 days are free.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={scrollToDemo}
                            data-testid="final-cta-demo-btn"
                            className="flex items-center justify-center gap-2 bg-pf-sky text-white px-8 py-4 rounded-xl font-bold font-jakarta text-base hover:bg-[#2aa5f0] shadow-xl"
                            style={{ transition: 'background-color 0.2s ease' }}
                        >
                            Book Demo <ArrowRight size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
                            data-testid="final-cta-download-btn"
                            className="flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold font-jakarta text-base hover:border-white hover:bg-white/5"
                            style={{ transition: 'border-color 0.2s ease, background-color 0.2s ease' }}
                        >
                            <Download size={18} /> Download App
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FinalCTASection;
