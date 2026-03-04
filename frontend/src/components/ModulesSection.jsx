import React from 'react';
import { TrendingUp, DollarSign, Users, BarChart2, Wallet, FileText } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const MODULES = [
    {
        icon: TrendingUp,
        title: 'Sales Tracking',
        desc: 'Record and monitor sales across all payment methods — cash, UPI, and card — with complete nozzle-level visibility.',
        points: ['Nozzle-level sales tracking', 'Digital vs cash segregation', 'Shift-wise sales visibility'],
        accent: '#38B6FF',
        size: 'lg',
    },
    {
        icon: DollarSign,
        title: 'Cash Reconciliation',
        desc: 'Eliminate confusion between expected and actual cash at every shift closing.',
        points: ['Compare sales vs collected cash', 'Shift level cash submissions', 'Identify discrepancies instantly'],
        accent: '#0D1B3E',
        size: 'sm',
    },
    {
        icon: Wallet,
        title: 'Credit Customer Ledger',
        desc: 'Manage all udhar customers in one centralized place with outstanding tracking.',
        points: ['Customer-wise credit history', 'Outstanding balance tracking', 'Easy record keeping'],
        accent: '#38B6FF',
        size: 'sm',
    },
    {
        icon: Users,
        title: 'Staff & Shift Management',
        desc: 'Track who is operating which pump, and when. Full accountability across every shift.',
        points: ['Operator shift tracking', 'Manager-level oversight', 'Accountability across shifts'],
        accent: '#0D1B3E',
        size: 'lg',
    },
    {
        icon: BarChart2,
        title: 'Expense Tracking',
        desc: 'Understand real profitability by tracking all operational expenses against revenue.',
        points: ['Record pump expenses', 'Monitor operational spending', 'Accurate profit visibility'],
        accent: '#38B6FF',
        size: 'sm',
    },
    {
        icon: FileText,
        title: 'Reports & Data Exports',
        desc: 'Generate reports for any time period in seconds. Export to PDF or Excel for easy sharing.',
        points: ['Daily, weekly, monthly reports', 'PDF / Excel export', 'Share with accountants or partners'],
        accent: '#0D1B3E',
        size: 'sm',
    },
];

const ModuleCard = ({ icon: Icon, title, desc, points, accent, delay, isVisible }) => (
    <div
        data-testid={`module-card-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`module-card bg-white rounded-2xl p-6 border border-slate-100 shadow-sm fade-up ${isVisible ? 'visible' : ''} ${delay}`}
    >
        <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${accent}15` }}
        >
            <Icon size={20} style={{ color: accent }} />
        </div>
        <h3 className="text-base font-bold font-outfit text-pf-navy mb-2">{title}</h3>
        <p className="text-sm text-slate-500 font-jakarta leading-relaxed mb-4">{desc}</p>
        <ul className="space-y-1.5">
            {points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs text-slate-600 font-jakarta">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                    {p}
                </li>
            ))}
        </ul>
    </div>
);

const ModulesSection = ({ id }) => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id={id || 'features'} data-testid="modules-section" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">Core Modules</p>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy max-w-lg leading-tight">
                            Built for Every Part of Pump Operations
                        </h2>
                        <p className="text-slate-500 font-jakarta text-sm max-w-xs">
                            Six powerful modules that cover every workflow a petrol pump needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MODULES.map((mod, i) => (
                            <ModuleCard
                                key={mod.title}
                                {...mod}
                                delay={`delay-${(i % 3 + 1) * 100}`}
                                isVisible={isVisible}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ModulesSection;
