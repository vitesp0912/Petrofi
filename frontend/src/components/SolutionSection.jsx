import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const POINTS = [
    'Every sale, shift and expense recorded digitally in real time',
    'Instant cash reconciliation — no more end-of-day confusion',
    'Full visibility into which operator did what, and when',
    'Credit customers tracked centrally with outstanding amounts',
    'Reports generated in seconds, not hours',
];

const SolutionSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    const scrollToDemo = () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });

    return (
        <section id="how-it-works" data-testid="solution-section" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}>
                    {/* Left */}
                    <div>
                        <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">The Solution</p>
                        <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy leading-tight mb-5">
                            PetroFi Turns Your Petrol Pump Into a{' '}
                            <span className="gradient-text">Digitally Controlled</span> Operation
                        </h2>
                        <p className="text-slate-500 font-jakarta text-base leading-relaxed mb-8">
                            PetroFi is a petrol pump management system that replaces registers and spreadsheets.
                            Every sale, shift, expense and reconciliation is tracked in real time —
                            accessible from your phone, anywhere.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {POINTS.map((point) => (
                                <li key={point} className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-pf-sky mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 font-jakarta">{point}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-center lg:justify-start">
                            <button
                                onClick={scrollToDemo}
                                data-testid="solution-cta-btn"
                                className="inline-flex items-center gap-2 bg-pf-sky text-white px-6 py-3 rounded-lg font-semibold font-jakarta text-sm hover:bg-[#2aa5f0]"
                                style={{ transition: 'background-color 0.2s ease' }}
                            >
                                See PetroFi in Action <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="relative">
                        {/* Mobile app image — above PetroFi Platform card on mobile only; slides in from right */}
                        <div className="flex lg:hidden justify-center mb-6 phone-slide-in-wrap">
                            <div className="phone-slide-in w-full max-w-[260px] flex justify-center">
                                <img
                                    src="/mobile.png"
                                    alt="PetroFi mobile app"
                                    className="w-full animate-float object-contain"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                            {/* Central label */}
                            <div className="text-center mb-6">
                                <div className="inline-block bg-pf-navy rounded-2xl px-6 py-3 text-white font-outfit font-bold text-lg shadow-lg">
                                    PetroFi Platform
                                </div>
                            </div>
                            {/* Flow lines */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { from: 'Manual Registers', to: 'Digital Records', arrow: true },
                                    { from: 'Cash Confusion', to: 'Live Reconciliation', arrow: true },
                                    { from: 'No Accountability', to: 'Shift Reports', arrow: true },
                                    { from: 'Udhar Chaos', to: 'Credit Ledger', arrow: true },
                                ].map(({ from, to }) => (
                                    <div key={from} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                                        <p className="text-xs text-red-500 font-jakarta line-through mb-1">{from}</p>
                                        <div className="flex items-center gap-1 text-green-500 mb-1">
                                            <ArrowRight size={12} />
                                        </div>
                                        <p className="text-sm text-green-700 font-semibold font-outfit">{to}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 bg-pf-sky/10 rounded-xl p-3 text-center border border-pf-sky/20">
                                <p className="text-xs text-pf-sky font-semibold font-jakarta">Everything visible instantly — from anywhere</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
