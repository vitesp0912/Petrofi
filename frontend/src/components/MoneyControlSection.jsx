import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const FLOW = [
    {
        title: 'Sales',
        items: ['Fuel sold at the nozzle'],
        tone: 'navy',
    },
    {
        title: 'Cash / UPI / Card',
        items: ['How the money came in'],
        tone: 'sky',
    },
    {
        title: 'Expenses / Credit / Inventory / Other',
        items: ['Money going out, or still owed'],
        tone: 'white',
    },
    {
        title: 'Cash + Bank Balances',
        items: ['Where the money stands now'],
        tone: 'sky',
    },
    {
        title: 'Complete Pump Picture',
        items: ['Every rupee, in one place'],
        tone: 'navy',
    },
];

const MoneyControlSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section
            id="money"
            aria-labelledby="money-heading"
            data-testid="money-control-section"
            className="py-20 md:py-24 bg-slate-50 scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} text-center mb-12 md:mb-16`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                        Money control
                    </p>
                    <h2 id="money-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-pf-navy leading-tight">
                        WHERE IS YOUR MONEY?
                    </h2>
                    <p className="text-slate-500 font-jakarta text-base mt-3 max-w-lg mx-auto">
                        See cash, bank, credit and expenses in one pump picture. Not six notebooks.
                    </p>
                </div>

                <div className={`fade-up ${isVisible ? 'visible' : ''} delay-200`}>
                    <div className="hidden lg:flex items-stretch justify-center gap-0">
                        {FLOW.map((step, i) => (
                            <React.Fragment key={step.title}>
                                <div
                                    className={`relative w-[150px] lg:w-[170px] rounded-2xl p-4 lg:p-5 border flex flex-col ${
                                        step.tone === 'navy'
                                            ? 'bg-pf-navy text-white border-pf-navy'
                                            : step.tone === 'sky'
                                              ? 'bg-pf-sky text-white border-pf-sky'
                                              : 'bg-white text-pf-navy border-slate-200'
                                    }`}
                                >
                                    <p className="text-[11px] font-jakarta uppercase tracking-wider opacity-70 mb-1">
                                        {String(i + 1).padStart(2, '0')}
                                    </p>
                                    <h3 className="text-sm font-bold font-outfit leading-snug mb-2">{step.title}</h3>
                                    <ul className="space-y-1 mt-auto">
                                        {step.items.map((item) => (
                                            <li key={item} className="text-[11px] font-jakarta leading-snug opacity-90">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {i < FLOW.length - 1 && (
                                    <div className="flex items-center px-1 lg:px-2" aria-hidden>
                                        <div className="money-flow-arrow" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="lg:hidden space-y-0 max-w-sm mx-auto">
                        {FLOW.map((step, i) => (
                            <React.Fragment key={step.title}>
                                <div
                                    className={`rounded-2xl p-4 border ${
                                        step.tone === 'navy'
                                            ? 'bg-pf-navy text-white border-pf-navy'
                                            : step.tone === 'sky'
                                              ? 'bg-pf-sky text-white border-pf-sky'
                                              : 'bg-white text-pf-navy border-slate-200'
                                    }`}
                                >
                                    <p className="text-[10px] font-jakarta uppercase tracking-wider opacity-70 mb-1">
                                        {String(i + 1).padStart(2, '0')}
                                    </p>
                                    <h3 className="text-base font-bold font-outfit">{step.title}</h3>
                                    <p className="text-xs font-jakarta mt-1 opacity-90">{step.items.join(' · ')}</p>
                                </div>
                                {i < FLOW.length - 1 && (
                                    <div className="flex justify-center py-1" aria-hidden>
                                        <div className="money-flow-arrow-down" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MoneyControlSection;
