import React, { useEffect, useRef } from 'react';

const ReportsSection = () => {
    const sectionRef = useRef(null);
    const shotRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const shot = shotRef.current;
        if (!section || !shot) return undefined;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobile = window.matchMedia('(max-width: 767px)');

        const pinShot = () => {
            shot.style.transform = 'none';
            shot.style.opacity = '1';
        };

        if (reduced) {
            pinShot();
            return undefined;
        }

        let frame = 0;
        const update = () => {
            if (mobile.matches) {
                pinShot();
                return;
            }
            const rect = section.getBoundingClientRect();
            const span = window.innerHeight + rect.height;
            const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / span));
            const nx = (0.5 - progress) * 2;
            shot.style.transform = `translate3d(${nx * 70}vw, 0, 0) rotateY(${nx * 36}deg) scale(${0.88 + (1 - Math.abs(nx)) * 0.12})`;
            shot.style.opacity = String(0.45 + (1 - Math.abs(nx)) * 0.55);
        };

        const onScroll = () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                update();
            });
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <section
            id="reports"
            ref={sectionRef}
            aria-labelledby="reports-heading"
            data-testid="reports-section"
            className="py-20 md:py-24 bg-white scroll-mt-20 overflow-x-clip"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">
                    Reports
                </p>
                <h2
                    id="reports-heading"
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-pf-navy leading-tight max-w-3xl mb-4"
                >
                    DON&apos;T JUST RECORD IT. REPORT IT.
                </h2>
                <p className="text-slate-500 font-jakarta text-base max-w-2xl mb-12">
                    Sales report. Credit report. Inventory sales report. Tank report. Cash and bank book. Combined report.
                </p>

                <div className="report-3d-stage flex justify-center">
                    <div ref={shotRef} className="report-3d-shot">
                        <img
                            src="/report.webp"
                            alt="PetroFI reports screen with sales summary and report filters"
                            className="h-[56vh] sm:h-[64vh] lg:h-[70vh] w-auto max-w-none block"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReportsSection;
