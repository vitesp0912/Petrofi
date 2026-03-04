import React from 'react';
import { BookOpen, AlertTriangle, Users, CreditCard } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const PROBLEMS = [
    {
        icon: BookOpen,
        title: 'Manual Registers & Paperwork',
        desc: 'Hours wasted maintaining paper records for every sale, shift and reconciliation. Prone to errors and hard to verify.',
        color: 'text-amber-600 bg-amber-50',
    },
    {
        icon: AlertTriangle,
        title: 'Cash Mismatch at Shift End',
        desc: 'No clear system to verify whether cash collected matches actual sales. Discrepancies go undetected until it\'s too late.',
        color: 'text-red-600 bg-red-50',
    },
    {
        icon: Users,
        title: 'Staff Accountability Gaps',
        desc: 'Impossible to trace which operator or shift caused a discrepancy. No visibility into who is responsible for what.',
        color: 'text-orange-600 bg-orange-50',
    },
    {
        icon: CreditCard,
        title: 'Credit Customer Chaos',
        desc: 'Tracking udhar customers manually leads to forgotten payments, disputes, and revenue loss. No organized ledger.',
        color: 'text-rose-600 bg-rose-50',
    },
];

const ProblemSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="problem" aria-labelledby="problem-heading" data-testid="problem-section" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">The Problem</p>
                    <h2 id="problem-heading" className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy max-w-2xl leading-tight mb-4">
                        Petrol Pump Operations Shouldn't Depend on Registers and Guesswork
                    </h2>
                    <p className="text-slate-500 font-jakarta text-base max-w-xl mb-14">
                        Every day, pump owners lose money and time to preventable inefficiencies. The right petrol pump management software was built to fix exactly these problems. That’s PetroFI.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PROBLEMS.map(({ icon: Icon, title, desc, color }, i) => (
                            <div
                                key={title}
                                data-testid={`problem-card-${i}`}
                                className={`module-card bg-white rounded-2xl p-6 border border-slate-100 fade-up ${isVisible ? 'visible' : ''} delay-${(i + 1) * 100}`}
                            >
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                                    <Icon size={20} />
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

export default ProblemSection;
