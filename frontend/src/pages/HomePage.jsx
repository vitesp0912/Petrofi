import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import TracksSection from '../components/TracksSection';
import ScreenshotsSection from '../components/ScreenshotsSection';
import ReportsSection from '../components/ReportsSection';
// import MoneyControlSection from '../components/MoneyControlSection';
import BuiltForPumpsSection from '../components/BuiltForPumpsSection';
import SimpleSection from '../components/SimpleSection';
import PricingSection from '../components/PricingSection';
import DownloadSection from '../components/DownloadSection';
import FinalCTASection from '../components/FinalCTASection';
import DemoSection from '../components/DemoSection';
import FooterSection from '../components/FooterSection';

function HomePage() {
    const location = useLocation();

    usePageMeta({
        title: 'Best Petrol Pump Software in India. Free Download | PetroFI',
        description:
            'Petrol pump management software for India. Track fuel sales, credit customers, expenses, inventory, tanks, cash and bank. Get the reports you need. Free 30-day trial on iOS and Android.',
        canonical: 'https://www.petrofi.in/',
    });

    useEffect(() => {
        const id = location.state?.scrollTo || location.hash.replace('#', '');
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        const timer = window.setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
        return () => window.clearTimeout(timer);
    }, [location.hash, location.state]);

    return (
        <>
            <Navbar />
            <main id="main-content" aria-label="Main content">
                <HeroSection />
                <div className="bg-pf-navy text-white text-center py-3.5 px-4">
                    <p className="text-xs sm:text-sm font-semibold font-outfit tracking-[0.12em]">
                        EVERY SINGLE RUPEE IS TRACKED AT YOUR PETROL PUMP
                    </p>
                </div>
                <TracksSection />
                <ProblemSection />
                <SimpleSection id="how-it-works" />
                <ScreenshotsSection id="screenshots" />
                <ReportsSection />
                <BuiltForPumpsSection />
                <PricingSection />
                <DownloadSection />
                <FinalCTASection />
                <DemoSection id="demo" />
            </main>
            <FooterSection />
        </>
    );
}

export default HomePage;
