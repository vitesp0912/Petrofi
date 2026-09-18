import React from 'react';
import { Banknote, Fuel, Landmark, Receipt, Users, Wallet } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ORBIT_RADIUS = 32.8125; // 210 / 640 — same circle, any screen size

const ORBIT_ITEMS = [
    { icon: Wallet, label: 'Cash in Hand', angle: -90 },
    { icon: Landmark, label: 'Company Account', angle: -30 },
    { icon: Banknote, label: 'Current Account', angle: 30 },
    { icon: Users, label: 'Credit Outstanding', angle: 90 },
    { icon: Receipt, label: 'Expenses', angle: 150 },
    { icon: Fuel, label: 'Fuel Sales', angle: 210 },
];

const ProblemSection = () => {
    const { ref, isVisible } = useScrollAnimation(0.2);

    return (
        <section
            id="problem"
            aria-labelledby="problem-heading"
            data-testid="problem-section"
            className="pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 md:pb-8 bg-slate-50 scroll-mt-20 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-6`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                        The real question
                    </p>
                    <h2 id="problem-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-pf-navy leading-tight mb-4">
                        WHERE DOES THE MONEY GO?
                    </h2>
                    <p className="text-slate-500 font-jakarta text-base max-w-xl mx-auto">
                        PetroFI helps you keep track of where every rupee came from, where it went, and where it stands.
                    </p>
                </div>

                <div className="relative mx-auto w-full max-w-[640px] aspect-square">
                    <div className="absolute inset-0 rupee-orbit">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 640" aria-hidden>
                            <circle cx="320" cy="320" r="210" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="6 8" />
                            {ORBIT_ITEMS.map((item) => {
                                const rad = (item.angle * Math.PI) / 180;
                                const x = 320 + Math.cos(rad) * 210;
                                const y = 320 + Math.sin(rad) * 210;
                                return (
                                    <line
                                        key={item.label}
                                        x1="320"
                                        y1="320"
                                        x2={x}
                                        y2={y}
                                        stroke="#38B6FF"
                                        strokeWidth="1.5"
                                        strokeOpacity="0.45"
                                    />
                                );
                            })}
                        </svg>

                        {ORBIT_ITEMS.map((item) => {
                            const rad = (item.angle * Math.PI) / 180;
                            const left = 50 + Math.cos(rad) * ORBIT_RADIUS;
                            const top = 50 + Math.sin(rad) * ORBIT_RADIUS;
                            return (
                                <div
                                    key={item.label}
                                    className="absolute"
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    <div className="rupee-orbit-card module-card w-[4.85rem] sm:w-[7.5rem] lg:w-[168px] bg-pf-navy rounded-xl sm:rounded-2xl border border-white/10 shadow-sm px-1.5 py-1.5 sm:px-3 sm:py-3 text-center">
                                        <item.icon size={14} className="text-pf-sky mx-auto mb-0.5 sm:mb-1.5 sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
                                        <p className="text-[9px] sm:text-xs lg:text-sm font-bold font-outfit text-white leading-tight">
                                            {item.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-36 lg:h-36 rounded-full bg-pf-sky text-white flex flex-col items-center justify-center shadow-[0_12px_36px_rgba(56,182,255,0.55)] rupee-pulse">
                            <span className="text-2xl sm:text-4xl lg:text-5xl font-bold font-outfit leading-none">₹</span>
                            <span className="text-[7px] sm:text-[9px] lg:text-[10px] font-jakarta uppercase tracking-widest mt-0.5 sm:mt-1 text-white/90">
                                Every rupee
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
