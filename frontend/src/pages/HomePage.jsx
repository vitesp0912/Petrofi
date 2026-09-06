import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import SolutionSection from '../components/SolutionSection';
import ModulesSection from '../components/ModulesSection';
import BenefitsSection from '../components/BenefitsSection';
import OwnerManagerSection from '../components/OwnerManagerSection';
import ScreenshotsSection from '../components/ScreenshotsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import DemoSection from '../components/DemoSection';
import DownloadSection from '../components/DownloadSection';
import FinalCTASection from '../components/FinalCTASection';
import FooterSection from '../components/FooterSection';

function HomePage() {
    const location = useLocation();

    usePageMeta({
        title: 'Best Petrol Pump Software in India. Free Download | PetroFI',
        description:
            'Petrol pump management software for India. Free download on iOS & Android. Track sales, cash reconciliation, shifts and credit. One petrol pump software trusted by 500+ owners.',
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
                <ProblemSection />
                <SolutionSection />
                <ScreenshotsSection id="screenshots" />
                <ModulesSection id="features" />
                <DownloadSection />
                <BenefitsSection id="how-it-works" />
                <OwnerManagerSection />
                <TestimonialsSection />
                <FinalCTASection />
                <DemoSection id="demo" />
            </main>
            <FooterSection />
        </>
    );
}

export default HomePage;
