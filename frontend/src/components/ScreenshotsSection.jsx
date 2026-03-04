import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './ui/carousel';

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

const PHONE_WIDTH_MOBILE = '250px';   // single phone width on mobile
const PHONE_WIDTH_DESKTOP = 'w-52 md:w-56 lg:w-60';

const PhoneFrame = ({ title, image, isMobile }) => (
    <div className={`mx-auto flex-shrink-0 ${isMobile ? 'w-[250px]' : PHONE_WIDTH_DESKTOP}`}>
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

                {/* Desktop: centered carousel with absolute arrows */}
                <div className="relative hidden sm:flex items-center justify-center gap-2 px-4 max-w-2xl sm:max-w-[650px] mx-auto">
                    <Carousel
                        opts={{ align: 'center', loop: true }}
                        className="w-full flex-1 min-w-0"
                    >
                        <CarouselContent className="-ml-0">
                            {SCREENS.map((screen) => (
                                <CarouselItem key={screen.title} className="pl-0 basis-full">
                                    <PhoneFrame title={screen.title} image={screen.image} isMobile={false} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-0 lg:-left-1 h-12 w-12 rounded-full bg-white border-2 border-slate-200 shadow-md hover:bg-slate-50" />
                        <CarouselNext className="absolute right-0 lg:-right-1 h-12 w-12 rounded-full bg-white border-2 border-slate-200 shadow-md hover:bg-slate-50" />
                    </Carousel>
                </div>

                {/* Mobile: structured row [Arrow | Carousel viewport | Arrow], centered */}
                <div className="sm:hidden flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3">
                        <Carousel
                            opts={{ align: 'center', loop: true }}
                            className="flex items-center gap-3"
                        >
                            <CarouselPrevious className="static h-11 w-11 shrink-0 rounded-full bg-white border-2 border-slate-200 shadow-md hover:bg-slate-50" />
                            <div className="w-[250px] shrink-0 overflow-hidden">
                                <CarouselContent className="-ml-0">
                                    {SCREENS.map((screen) => (
                                        <CarouselItem key={screen.title} className="pl-0 basis-full min-w-0">
                                            <PhoneFrame title={screen.title} image={screen.image} isMobile />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </div>
                            <CarouselNext className="static h-11 w-11 shrink-0 rounded-full bg-white border-2 border-slate-200 shadow-md hover:bg-slate-50" />
                        </Carousel>
                    </div>
                    <p className="text-center text-xs text-slate-400 font-jakarta mt-7">Swipe or use arrows</p>
                </div>

                <p className="hidden sm:block text-center text-xs text-slate-400 font-jakarta mt-8">Use arrows or swipe to see more screens</p>
            </div>
        </section>
    );
};

export default ScreenshotsSection;
