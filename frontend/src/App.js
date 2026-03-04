import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import ModulesSection from './components/ModulesSection';
import DashboardSection from './components/DashboardSection';
import BenefitsSection from './components/BenefitsSection';
import OwnerManagerSection from './components/OwnerManagerSection';
import ScreenshotsSection from './components/ScreenshotsSection';
import TestimonialsSection from './components/TestimonialsSection';
import DemoSection from './components/DemoSection';
import DownloadSection from './components/DownloadSection';
import FinalCTASection from './components/FinalCTASection';
import FooterSection from './components/FooterSection';

function App() {
    return (
        <div className="font-jakarta">
            <Navbar />
            <main>
                <HeroSection />
                <ProblemSection />
                <SolutionSection />
                <ScreenshotsSection id="screenshots" />
                <ModulesSection id="features" />
                <DownloadSection />
                {/* <DashboardSection /> — kept as component, hidden for now */}
                <BenefitsSection id="how-it-works" />
                <OwnerManagerSection />
                <TestimonialsSection />
                <FinalCTASection />
                <DemoSection id="demo" />
            </main>
            <FooterSection />
            <Analytics />
        </div>
    );
}

export default App;
