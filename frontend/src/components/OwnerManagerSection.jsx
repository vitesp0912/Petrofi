import React, { useState } from 'react';
import { Building2, UserCog } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const OWNER_ITEMS = [
    { title: 'Monitor pump performance remotely', desc: 'Check real-time sales and operational status from your phone — no need to be at the pump.' },
    { title: 'Track profit and expenses accurately', desc: 'See net profit after all expenses. Know exactly how much your pump made today.' },
    { title: 'View reports for any time period', desc: 'Daily, weekly, monthly — generate any report instantly for better financial decisions.' },
    { title: 'Identify cash mismatches instantly', desc: 'Get alerted when collected cash doesn\'t match expected sales figures.' },
];

const MANAGER_ITEMS = [
    { title: 'Run shift operations smoothly', desc: 'Open and close shifts digitally. No manual registers. No paperwork at end of shift.' },
    { title: 'Record sales quickly and accurately', desc: 'Enter nozzle readings, cash, and digital payments in seconds — not minutes.' },
    { title: 'Maintain accurate daily records', desc: 'Every transaction logged with timestamp, operator name, and payment method.' },
    { title: 'Submit cash reconciliation digitally', desc: 'Submit shift cash summary digitally. No more disputes about what was collected.' },
];

const OwnerManagerSection = () => {
    const { ref, isVisible } = useScrollAnimation();
    const [active, setActive] = useState('owner');

    const items = active === 'owner' ? OWNER_ITEMS : MANAGER_ITEMS;

    return (
        <section data-testid="owner-manager-section" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">For Everyone</p>
                    <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy leading-tight mb-10">
                        Designed for Owners & Managers
                    </h2>

                    {/* Toggle */}
                    <div className="flex items-center gap-2 mb-10 bg-white rounded-xl p-1.5 w-fit border border-slate-100 shadow-sm">
                        <button
                            onClick={() => setActive('owner')}
                            data-testid="owner-tab-btn"
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold font-jakarta ${active === 'owner' ? 'bg-pf-navy text-white shadow-sm' : 'text-slate-500 hover:text-pf-navy'}`}
                            style={{ transition: 'background-color 0.2s ease, color 0.2s ease' }}
                        >
                            <Building2 size={15} /> For Owners
                        </button>
                        <button
                            onClick={() => setActive('manager')}
                            data-testid="manager-tab-btn"
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold font-jakarta ${active === 'manager' ? 'bg-pf-navy text-white shadow-sm' : 'text-slate-500 hover:text-pf-navy'}`}
                            style={{ transition: 'background-color 0.2s ease, color 0.2s ease' }}
                        >
                            <UserCog size={15} /> For Managers
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {items.map(({ title, desc }, i) => (
                            <div
                                key={title}
                                data-testid={`persona-card-${i}`}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                            >
                                <div className="w-8 h-8 bg-pf-sky/10 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-pf-sky font-bold font-outfit text-sm">{i + 1}</span>
                                </div>
                                <h3 className="text-base font-bold font-outfit text-pf-navy mb-2">{title}</h3>
                                <p className="text-sm text-slate-500 font-jakarta leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OwnerManagerSection;
