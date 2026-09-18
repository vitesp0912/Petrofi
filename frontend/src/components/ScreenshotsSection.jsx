import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import RegisterPumpDialog from './RegisterPumpDialog';

const UNLOCK_KEY = 'petrofi_pump_registered';

const SCREENS = [
    {
        title: 'Dashboard',
        image: '/dashboard.webp',
        caption: 'See today’s sales at a glance.',
        alt: 'PetroFI dashboard showing total fuel sales for a petrol pump',
    },
    {
        title: 'Meter Readings',
        image: '/entriesmeterreadings.webp',
        caption: 'Enter nozzle readings, shift by shift.',
        alt: 'PetroFI meter reading screen for nozzle-level fuel sales',
    },
    {
        title: 'Expenses',
        image: '/expenses.webp',
        caption: 'Log every rupee that goes out.',
        alt: 'PetroFI expenses screen for petrol pump operational costs',
    },
    {
        title: 'Udhar Ledger',
        image: '/udharledger.webp',
        caption: 'Udhar customers and outstanding, in one list.',
        alt: 'PetroFI udhar customer ledger with outstanding amounts',
    },
];

const ScreenshotsSection = ({ id }) => {
    const { ref, isVisible } = useScrollAnimation();
    const looped = [...SCREENS, ...SCREENS];
    const [unlocked, setUnlocked] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try {
            if (sessionStorage.getItem(UNLOCK_KEY) === '1') setUnlocked(true);
        } catch {
            /* ignore */
        }
    }, []);

    const handleSuccess = () => {
        setUnlocked(true);
        try {
            sessionStorage.setItem(UNLOCK_KEY, '1');
        } catch {
            /* ignore */
        }
    };

    return (
        <section
            id={id || 'screenshots'}
            aria-labelledby="screenshots-heading"
            data-testid="screenshots-section"
            className="py-20 md:py-24 bg-slate-50 overflow-hidden scroll-mt-20"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} mb-10`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                        Inside the app
                    </p>
                    <h2 id="screenshots-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-pf-navy leading-tight max-w-2xl">
                        YOUR ENTIRE PUMP. IN ONE APP.
                    </h2>
                </div>

                <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_8px_40px_rgba(13,27,62,0.06)]">
                    <div className={`screenshot-marquee-mask py-6 ${unlocked ? '' : 'screenshot-blurred'}`}>
                        <div className={`screenshot-marquee flex w-max items-end gap-5 px-4 ${unlocked ? '' : 'is-paused'}`}>
                            {looped.map((screen, i) => (
                                <figure key={`${screen.title}-${i}`} className="flex-shrink-0 m-0">
                                    <img
                                        src={screen.image}
                                        alt={screen.alt}
                                        className="h-[280px] sm:h-[360px] lg:h-[420px] w-auto max-w-none block"
                                        loading="lazy"
                                    />
                                    <figcaption className="text-center mt-3">
                                        <p className="text-sm font-semibold font-outfit text-pf-navy">{screen.title}</p>
                                        <p className="text-xs text-slate-500 font-jakarta mt-1">{screen.caption}</p>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>

                    {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 bg-pf-navy/45">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                data-testid="register-pump-cta"
                                className="group max-w-sm w-full bg-white border border-slate-100 shadow-[0_20px_60px_rgba(13,27,62,0.16)] rounded-2xl px-6 py-7 sm:px-8 sm:py-8 text-center hover:shadow-[0_24px_70px_rgba(13,27,62,0.2)]"
                                style={{ transition: 'box-shadow 0.2s ease' }}
                            >
                                <span className="w-11 h-11 mx-auto mb-4 rounded-full bg-pf-sky/10 flex items-center justify-center">
                                    <Lock size={18} className="text-pf-sky" strokeWidth={1.8} />
                                </span>
                                <span className="block text-xl sm:text-2xl font-bold font-outfit text-pf-navy leading-snug">
                                    Register your pump for{' '}
                                    <span className="text-pf-sky">free</span>
                                    {' '}to see the details
                                </span>
                                <span className="mt-5 inline-flex items-center justify-center gap-2 bg-pf-navy text-white px-5 py-3 rounded-xl text-sm font-semibold font-jakarta group-hover:bg-pf-navy/90">
                                    Register your pump
                                    <ArrowRight size={16} />
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <RegisterPumpDialog open={open} onOpenChange={setOpen} onSuccess={handleSuccess} />
        </section>
    );
};

export default ScreenshotsSection;
