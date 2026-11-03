import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { useVisualKeyboard } from './hooks/useVisualKeyboard';
import HomePage from './pages/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import PaymentsPanel from './components/account/PaymentsPanel';
import PlansPanel from './components/account/PlansPanel';
import ProfilePanel from './components/account/ProfilePanel';
import SubscriptionPage from './pages/SubscriptionPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import { installGlobalErrorHandlers, setErrorLogContext } from './lib/errorLog';

function ErrorLogBootstrap() {
    const { user } = useAuth();

    useEffect(() => {
        installGlobalErrorHandlers();
    }, []);

    useEffect(() => {
        setErrorLogContext(() => ({
            userId: user?.id || null,
        }));
    }, [user]);

    return null;
}

function App() {
    useVisualKeyboard();

    return (
        <BrowserRouter>
            <AuthProvider>
                <ErrorLogBootstrap />
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
                        <Route path="/refund-policy" element={<RefundPolicyPage />} />
                    </Routes>
                    <Analytics />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
