import React from 'react';
import { Eye, Keyboard, LayoutList } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const STEPS = [
    {
        n: '01',
        icon: Keyboard,
        title: 'RECORD',
        desc: 'Enter meter readings, sales, expenses and cash. If staff can write a number, they can use PetroFI.',
    },
    {
        n: '02',
        icon: LayoutList,
        title: 'REVIEW',
        desc: 'PetroFI puts shifts, udhar, stock and payments in one place.',
    },
    {
        n: '03',
        icon: Eye,
        title: 'REPORT',
        desc: 'Open your petrol pump reports. See sales, cash and balances. Know where every rupee stands.',
    },
];

const SimpleSection = ({ id }) => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section
            id={id || 'how-it-works'}
            aria-labelledby="simple-heading"
            data-testid="simple-section"
            className="py-20 md:py-24 bg-white scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} text-center mb-14`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                        How it works
                    </p>
                    <h2 id="simple-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-pf-navy leading-tight">
                        NO TECHNICAL KNOWLEDGE REQUIRED.
                    </h2>
                    <p className="text-slate-500 font-jakarta text-base mt-4 max-w-xl mx-auto">
                        If your team can read a meter and enter a number, they can use PetroFI.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
                    <div
                        className="hidden md:block absolute top-8 left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] h-px bg-pf-sky"
                        aria-hidden
                    >
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-t-2 border-pf-sky rotate-45" />
                    </div>
                    {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
                        <div
                            key={title}
                            data-testid={`simple-step-${i}`}
                            className={`relative text-center fade-up ${isVisible ? 'visible' : ''} delay-${(i + 1) * 100}`}
                        >
                            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white border border-slate-200 flex items-center justify-center relative z-10">
                                <Icon size={24} className="text-pf-sky" strokeWidth={1.5} />
                            </div>
                            <p className="text-xs font-jakarta font-semibold text-pf-sky tracking-widest mb-2">{n}</p>
                            <h3 className="text-xl font-bold font-outfit text-pf-navy mb-2">{title}</h3>
                            <p className="text-sm text-slate-500 font-jakarta leading-relaxed max-w-[240px] mx-auto">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SimpleSection;
