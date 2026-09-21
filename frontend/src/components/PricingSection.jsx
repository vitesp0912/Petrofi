import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCountUp } from '../hooks/useCountUp';
import { scrollToId } from '../lib/utils';
import RegisterPumpDialog from './RegisterPumpDialog';

const POINTS = [
    'Download the app',
    'Register on the app',
    'We will take it from there',
];

const PricingSection = () => {
    const { ref, isVisible } = useScrollAnimation();
    const countRef = useRef(null);
    const [inView, setInView] = useState(false);
    const [trialOpen, setTrialOpen] = useState(false);
    const days = useCountUp(30, { duration: 1200, enabled: inView });

    useEffect(() => {
        const el = countRef.current;
        if (!el) return undefined;
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0.35 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            id="pricing"
            aria-labelledby="pricing-heading"
            data-testid="pricing-section"
            className="py-20 md:py-24 bg-white scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} max-w-2xl mx-auto`}>
                    <div className="text-center mb-10">
                        <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                            Pricing
                        </p>
                        <h2 id="pricing-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-pf-navy leading-tight">
                            TRY PETROFI FREE FOR 30 DAYS.
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10 text-center">
                        <p ref={countRef} className="text-6xl font-bold font-outfit text-pf-navy leading-none mb-2">{days}</p>
                        <p className="text-sm font-semibold font-jakarta text-pf-sky uppercase tracking-widest mb-6">
                            Days free
                        </p>
                        <p className="text-slate-600 font-jakarta text-sm mb-6">
                            Start on your pump. No complicated setup.
                        </p>
                        <div className="flex justify-center mb-8">
                            <ol className="space-y-2.5">
                                {POINTS.map((p, i) => (
                                    <li key={p} className="flex items-center gap-2.5 text-sm font-jakarta text-slate-600">
                                        <span className="w-6 h-6 rounded-full bg-pf-sky text-white text-[11px] font-bold font-outfit flex items-center justify-center shrink-0">
                                            {i + 1}
                                        </span>
                                        {p}
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => setTrialOpen(true)}
                                data-testid="pricing-start-free-btn"
                                className="inline-flex items-center justify-center gap-2 bg-pf-navy text-white px-7 py-3 rounded-full font-semibold font-jakarta text-sm hover:bg-pf-navy/90 shadow-lg"
                                style={{ transition: 'background-color 0.2s ease' }}
                            >
                                START FREE <ArrowRight size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToId('demo')}
                                data-testid="pricing-demo-btn"
                                className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white text-pf-navy px-7 py-3 rounded-full font-semibold font-jakarta text-sm hover:border-pf-sky hover:text-pf-sky"
                                style={{ transition: 'border-color 0.2s ease, color 0.2s ease' }}
                            >
                                BOOK A DEMO <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <RegisterPumpDialog
                open={trialOpen}
                onOpenChange={setTrialOpen}
                source="pricing"
                variant="account"
            />
        </section>
    );
};

export default PricingSection;
