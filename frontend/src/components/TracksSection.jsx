import React from 'react';
import {
    ArrowRight,
    Banknote,
    CreditCard,
    Droplets,
    Fuel,
    Landmark,
    Layers,
    Package,
    Receipt,
    Users,
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { scrollToId } from '../lib/utils';

const TRACKS = [
    {
        icon: Fuel,
        title: 'Fuel Sales',
        desc: 'Nozzle-level sales, shift by shift.',
        details: 'Cash · UPI · Card',
    },
    {
        icon: Users,
        title: 'Credit Customers',
        desc: 'Udhar ledger, outstanding, full payment history.',
        details: 'Customer-wise',
    },
    {
        icon: Receipt,
        title: 'Expenses',
        desc: 'Daily pump costs, recorded as they happen.',
        details: 'Operations',
    },
    {
        icon: Package,
        title: 'Other Inventory',
        desc: 'Lubricants, engine oils, and non-fuel products.',
        details: 'Stock + sales',
    },
    {
        icon: Droplets,
        title: 'Tank Stock',
        desc: 'How much fuel is in each tank.',
        details: 'Fuel levels',
    },
    {
        icon: Banknote,
        title: 'Cash',
        desc: 'Cash in hand, collected against sales.',
        details: 'In-hand money',
    },
    {
        icon: Landmark,
        title: 'Bank Accounts',
        desc: 'Company and current account balances.',
        details: 'Where money sits',
    },
    {
        icon: CreditCard,
        title: 'Other Transactions',
        desc: 'Charges, interest, transport, and other money movement.',
        details: 'If money moved, log it',
    },
];

const TracksSection = () => {
    const { ref, isVisible } = useScrollAnimation(0.08);

    return (
        <section
            id="tracks"
            aria-labelledby="tracks-heading"
            data-testid="tracks-section"
            className="py-20 md:py-24 bg-white scroll-mt-20"
        >
            <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`fade-up ${isVisible ? 'visible' : ''} mb-12`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                        What PetroFI tracks
                    </p>
                    <h2 id="tracks-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-pf-navy leading-tight max-w-3xl">
                        EVERYTHING THAT MOVES AT YOUR PUMP.
                    </h2>
                    <p className="text-slate-500 font-jakarta text-base mt-4 max-w-xl">
                        If money moves at your pump, PetroFI can track it.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                    {TRACKS.map(({ icon: Icon, title, desc, details }, i) => (
                        <div
                            key={title}
                            className={`track-reveal ${isVisible ? 'is-in' : ''} h-full`}
                            style={{ animationDelay: `${i * 90}ms` }}
                        >
                            <article
                                data-testid={`track-card-${i}`}
                                className="module-card h-full flex flex-col bg-pf-navy rounded-2xl p-4 sm:p-5 border border-pf-navy"
                            >
                                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-4">
                                    <Icon size={20} className="text-pf-sky" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-extrabold font-outfit text-white mb-1">{title}</h3>
                                <p className="text-sm text-white/70 font-jakarta leading-snug">{desc}</p>
                                <p className="mt-auto pt-4 text-[11px] font-semibold font-jakarta text-pf-sky uppercase tracking-wide">
                                    {details}
                                </p>
                            </article>
                        </div>
                    ))}
                </div>

                <div
                    className={`track-reveal ${isVisible ? 'is-in' : ''} relative mt-8 overflow-hidden rounded-2xl border border-pf-sky/20 bg-gradient-to-r from-[#EAF6FF] via-[#F7FBFF] to-[#E8F4FF]`}
                    style={{ animationDelay: `${TRACKS.length * 90 + 80}ms` }}
                    data-testid="tracks-complete-view-strip"
                >
                    <svg
                        className="absolute -bottom-8 -right-10 w-[280px] h-[140px] text-pf-sky pointer-events-none"
                        viewBox="0 0 280 140"
                        fill="none"
                        aria-hidden
                    >
                        <path
                            d="M20 108c38-28 72-18 108-8 36 10 74 18 112-6 8-5 24-18 40-14"
                            stroke="currentColor"
                            strokeOpacity="0.16"
                            strokeWidth="18"
                            strokeLinecap="round"
                        />
                        <path
                            d="M0 92c48-22 86-8 124 4 40 12 78 8 132-18"
                            stroke="currentColor"
                            strokeOpacity="0.08"
                            strokeWidth="10"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-6 px-8 py-6 md:px-10 md:min-h-[100px]">
                        <div className="relative w-12 h-12 shrink-0 rounded-2xl bg-pf-sky/15 flex items-center justify-center">
                            <span className="absolute inset-0 rounded-2xl bg-pf-sky/25 blur-md" aria-hidden />
                            <Layers size={22} className="relative text-pf-sky" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                            <p className="text-[11px] font-medium font-jakarta uppercase tracking-[0.16em] text-pf-sky mb-1">
                                And much more
                            </p>
                            <p className="text-lg sm:text-xl font-semibold font-outfit text-pf-navy leading-snug">
                                A complete view of your pump, in one place.
                            </p>
                            <p className="text-sm font-jakarta text-slate-500 mt-1">
                                Sales, stock, expenses, customers, reports and more, all working together.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => scrollToId('problem')}
                            className="group shrink-0 inline-flex items-center justify-center gap-2 w-full md:w-auto bg-pf-navy text-white px-6 py-3 rounded-[13px] text-sm font-semibold font-jakarta hover:bg-pf-navy/90"
                            style={{ transition: 'background-color 0.2s ease' }}
                        >
                            See the Complete View
                            <ArrowRight
                                size={16}
                                className="transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TracksSection;
