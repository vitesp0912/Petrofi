import React from 'react';
import { Smartphone } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const DownloadSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="download" data-testid="download-section" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} flex flex-col items-center text-center`}>
                    <div className="w-14 h-14 bg-pf-sky/10 rounded-2xl flex items-center justify-center mb-6">
                        <Smartphone size={28} className="text-pf-sky" />
                    </div>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">Download Now</p>
                    <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy leading-tight mb-4">
                        Start Managing Your Petrol Pump Digitally
                    </h2>
                    <p className="text-slate-500 font-jakarta text-base max-w-md mb-10">
                        Available on iOS and Android. Download the PetroFi app and get started in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* App Store */}
                        <a
                            href="https://apps.apple.com/in/app/petrofi/id6758732447"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="appstore-btn"
                            className="flex items-center gap-3 bg-pf-navy text-white px-6 py-4 rounded-xl hover:bg-pf-navy/90 shadow-lg group"
                            style={{ transition: 'background-color 0.2s ease, box-shadow 0.2s ease' }}
                        >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white flex-shrink-0">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-[10px] opacity-80 font-jakarta">Download on the</p>
                                <p className="text-base font-bold font-outfit leading-tight">App Store</p>
                            </div>
                        </a>

                        {/* Google Play */}
                        <a
                            href="https://play.google.com/store/apps/details?id=com.petrofi.app&hl=en_IN"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="playstore-btn"
                            className="flex items-center gap-3 border-2 border-pf-navy text-pf-navy px-6 py-4 rounded-xl hover:bg-pf-navy hover:text-white shadow-sm group"
                            style={{ transition: 'background-color 0.2s ease, color 0.2s ease' }}
                        >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0 fill-current">
                                <path d="M3.18 23.75c.37.21.8.23 1.19.08L15.54 12 12 8.46 3.18 23.75zM20.46 10.5l-2.91-1.67-3.96 3.5 3.96 3.5 2.95-1.69c.84-.48.84-1.66-.04-2.14zM1.22.59C1.08.93 1 1.29 1 1.68v20.62c0 .39.08.76.22 1.1L12.46 12 1.22.59zM15.54 12L4.37.33C3.98.18 3.55.2 3.18.41L15.54 12z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-[10px] opacity-60 font-jakarta group-hover:opacity-80">Get it on</p>
                                <p className="text-base font-bold font-outfit leading-tight">Google Play</p>
                            </div>
                        </a>
                    </div>

                    <p className="text-xs text-slate-400 font-jakarta mt-6">
                        Free to download · Trusted by 500+ pump owners
                    </p>
                </div>
            </div>
        </section>
    );
};

export default DownloadSection;
