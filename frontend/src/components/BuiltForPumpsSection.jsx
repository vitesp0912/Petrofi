import React from 'react';
import {
    Banknote,
    CreditCard,
    Droplets,
    Flame,
    Fuel,
    Gauge,
    Landmark,
    Smartphone,
    Timer,
    Users,
    Wallet,
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const PARTS = [
    { icon: Fuel, label: 'Nozzles' },
    { icon: Gauge, label: 'Meter Readings' },
    { icon: Timer, label: 'Shifts' },
    { icon: Droplets, label: 'Tanks' },
    { icon: Flame, label: 'Fuel Types' },
    { icon: Users, label: 'Udhar Customers' },
    { icon: Wallet, label: 'Cash in Hand' },
    { icon: Smartphone, label: 'UPI Sales' },
    { icon: CreditCard, label: 'Card Sales' },
    { icon: Landmark, label: 'Bank Accounts' },
];

const BuiltForPumpsSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section
            id="built-for"
            aria-labelledby="built-for-heading"
            data-testid="built-for-pumps-section"
            className="py-20 md:py-24 bg-pf-navy relative overflow-hidden scroll-mt-20"
        >
            <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} text-center mb-12`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                        Built for petrol pumps
                    </p>
                    <h2 id="built-for-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-white leading-tight max-w-3xl mx-auto">
                        BUILT AROUND HOW YOUR PUMP ACTUALLY WORKS.
                    </h2>
                    <p className="text-slate-400 font-jakarta text-sm mt-4 max-w-md mx-auto">
                        This is not accounting software. It is built for nozzles, shifts, tanks and how money moves at a pump.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
                    {PARTS.map(({ icon: Icon, label }, i) => (
                        <div
                            key={label}
                            className={`bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-center fade-up ${isVisible ? 'visible' : ''} delay-${(i % 5 + 1) * 100}`}
                        >
                            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-pf-sky/15 flex items-center justify-center">
                                <Icon size={18} className="text-pf-sky" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-semibold font-outfit text-white">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BuiltForPumpsSection;
