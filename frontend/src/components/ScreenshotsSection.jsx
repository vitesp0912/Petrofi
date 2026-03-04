import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Screenshot source: 5.78" device → frame uses aspect ratio 9:19.5 to match.
// All images from frontend/public — order: Dashboard → Meter Reading → Expenses → Credit Ledger → Shift → Report → Cash.
const SCREENS = [
    { title: 'Dashboard', image: '/screen-dashboard.PNG' },
    { title: 'Meter Reading', image: '/Meter_Reading%20screen.PNG' },
    { title: 'Expenses', image: '/Expenses.PNG' },
    { title: 'Credit Ledger', image: '/Credit_ledger.PNG' },
    { title: 'Shift Management', image: '/Shift%20Management.PNG' },
    { title: 'Reports', image: '/screen-reports.PNG' },
    { title: 'Cash Reconciliation', image: '/Cash_reconciliation.jpeg' },
];

const PhoneFrame = ({ title, image, delay, isVisible }) => (
    <div className={`flex-shrink-0 w-28 sm:w-32 md:w-36 fade-up ${isVisible ? 'visible' : ''} ${delay}`}>
        <div className="w-full aspect-[9/19.5] bg-slate-900 rounded-[20px] border-[3px] border-slate-200 shadow-xl overflow-hidden relative flex items-center justify-center">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-contain"
                loading="lazy"
            />
        </div>
        <p className="text-center text-xs text-slate-500 font-jakarta mt-2">{title}</p>
    </div>
);

const ScreenshotsSection = ({ id }) => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id={id || 'screenshots'} data-testid="screenshots-section" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">App Preview</p>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                        <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy leading-tight max-w-md">
                            Inside the PetroFi App
                        </h2>
                        <p className="text-sm text-slate-500 font-jakarta max-w-xs">
                            Every screen designed for pump owners and managers — fast, simple, and accurate.
                        </p>
                    </div>
                </div>
                {/* Scrollable row */}
                <div className="flex gap-8 overflow-x-auto pb-4 screenshots-scroll">
                    {SCREENS.map((screen, i) => (
                        <PhoneFrame
                            key={screen.title}
                            {...screen}
                            delay={`delay-${(i % 4 + 1) * 100}`}
                            isVisible={isVisible}
                        />
                    ))}
                </div>
                <p className="text-center text-xs text-slate-400 font-jakarta mt-6">Swipe to see more screens →</p>
            </div>
        </section>
    );
};

export default ScreenshotsSection;
