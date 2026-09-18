import React from 'react';
import {
    CreditCard,
    Droplets,
    FileText,
    Fuel,
    Landmark,
    Package,
    Receipt,
    Repeat,
    Timer,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const GROUPS = [
    {
        icon: Fuel,
        title: 'Sales',
        items: ['Fuel sales', 'Nozzle-level', 'Shift-wise', 'Cash', 'UPI', 'Card'],
    },
    {
        icon: Timer,
        title: 'Shift Management',
        items: ['Open / close shift', 'Operator tracking', 'Mismatch alerts', 'Cash collect'],
    },
    {
        icon: Wallet,
        title: 'Cash',
        items: ['Cash in hand', 'Shift collection', 'Reconciliation'],
    },
    {
        icon: Landmark,
        title: 'Bank',
        items: ['Company account', 'Current account', 'Balances'],
    },
    {
        icon: Users,
        title: 'Credit',
        items: ['Customer ledger', 'Outstanding', 'Payment history', 'Udhar'],
    },
    {
        icon: Receipt,
        title: 'Expenses',
        items: ['Daily expenses', 'Operational costs'],
    },
    {
        icon: Package,
        title: 'Inventory',
        items: ['Lubricants', 'Engine oils', 'Stock movement', 'Inventory sales'],
    },
    {
        icon: Droplets,
        title: 'Tanks',
        items: ['Tank stock', 'Fuel types', 'Tank reports'],
    },
    {
        icon: FileText,
        title: 'Reports',
        items: ['Combined', 'Credit', 'Inventory sales', 'Tank', 'Cash & Bank', 'Sales'],
    },
    {
        icon: UserCog,
        title: 'Staff',
        items: ['Operators', 'Shifts', 'Accountability'],
    },
    {
        icon: CreditCard,
        title: 'Payments',
        items: ['Cash', 'UPI', 'Cards', 'Bank'],
    },
    {
        icon: Repeat,
        title: 'Other Transactions',
        items: ['Charges', 'Interest', 'Transport', 'Other money movement'],
    },
];

const ModulesSection = ({ id }) => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section
            id={id || 'features'}
            aria-labelledby="features-heading"
            data-testid="modules-section"
            className="py-20 md:py-24 bg-slate-50 scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} mb-10`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                        Inside PetroFI
                    </p>
                    <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy leading-tight max-w-2xl">
                        A complete petrol pump system. Not just sales.
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                    {GROUPS.map((group, i) => {
                        const Icon = group.icon;
                        return (
                            <div
                                key={group.title}
                                className={`bg-white p-6 fade-up ${isVisible ? 'visible' : ''} delay-${(i % 3 + 1) * 100}`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 rounded-lg bg-pf-sky/10 flex items-center justify-center flex-shrink-0">
                                        <Icon size={16} className="text-pf-sky" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-base font-bold font-outfit text-pf-navy">{group.title}</h3>
                                </div>
                                <ul className="space-y-2">
                                    {group.items.map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-sm text-slate-600 font-jakarta">
                                            <span className="mt-2 w-1 h-1 rounded-full bg-pf-sky flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ModulesSection;
