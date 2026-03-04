import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const BENEFITS = [
    { title: 'Full visibility into pump operations', desc: 'See every sale, expense, and shift detail — anytime, from anywhere.' },
    { title: 'Elimination of manual record keeping', desc: 'Replace registers and spreadsheets with instant digital records.' },
    { title: 'Better staff accountability', desc: 'Know exactly which operator was on shift and what was recorded.' },
    { title: 'Clear cash reconciliation', desc: 'Match expected and collected cash automatically at every shift end.' },
    { title: 'Organized credit tracking', desc: 'Never lose track of udhar customers or outstanding payments.' },
    { title: 'Instant reports for business decisions', desc: 'Generate daily, weekly, or monthly reports in seconds.' },
];

const BenefitsSection = ({ id }) => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id={id || 'benefits'} data-testid="benefits-section" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}>
                    {/* Left */}
                    <div>
                        <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">Why PetroFi</p>
                        <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy leading-tight mb-5">
                            What PetroFi Changes for Petrol Pump Owners
                        </h2>
                        <p className="text-slate-500 font-jakarta text-base leading-relaxed mb-8">
                            From day one, PetroFi gives you a level of operational control you never had before.
                            These are the outcomes pump owners consistently report after switching.
                        </p>
                        <div className="bg-pf-navy/5 rounded-2xl p-5 border border-pf-navy/10">
                            <p className="text-pf-navy font-outfit font-bold text-lg mb-1">500+</p>
                            <p className="text-slate-500 font-jakarta text-sm">Petrol pumps managed on PetroFi across India</p>
                        </div>
                    </div>

                    {/* Right: Benefits list */}
                    <div className="space-y-4">
                        {BENEFITS.map(({ title, desc }, i) => (
                            <div
                                key={title}
                                data-testid={`benefit-item-${i}`}
                                className={`flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 fade-up ${isVisible ? 'visible' : ''} delay-${(i % 4 + 1) * 100}`}
                                style={{ transition: 'background-color 0.2s ease' }}
                            >
                                <CheckCircle2 size={20} className="text-pf-sky mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold font-outfit text-pf-navy">{title}</p>
                                    <p className="text-sm text-slate-500 font-jakarta mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
