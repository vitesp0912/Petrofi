import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import PaymentsPanel from './components/account/PaymentsPanel';
import PlansPanel from './components/account/PlansPanel';
import ProfilePanel from './components/account/ProfilePanel';
import SubscriptionPage from './pages/SubscriptionPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="font-jakarta bg-pf-deep text-white min-h-screen">
                    <ScrollToTop />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/subscription" element={<SubscriptionPage />}>
                            <Route index element={<ProfilePanel />} />
                            <Route path="payments" element={<PaymentsPanel />} />
                            <Route path="plans" element={<PlansPanel />} />
                        </Route>
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                    </Routes>
                    <Analytics />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
