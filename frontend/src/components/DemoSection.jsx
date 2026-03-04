import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const API_SEND_DEMO = '/api/send-demo-mail';

const FEATURES = [
    'Live walkthrough of all features',
    'Setup assistance for your pump',
    'No commitment required',
    'Free for 30 days',
];

const DemoSection = ({ id }) => {
    const { ref, isVisible } = useScrollAnimation();
    const [form, setForm] = useState({ name: '', pump_name: '', city: '', phone: '', email: '' });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(API_SEND_DEMO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = res.ok ? await res.json().catch(() => ({})) : null;
            if (res.ok && data && data.ok !== false) {
                setStatus('success');
                setForm({ name: '', pump_name: '', city: '', phone: '', email: '' });
                return;
            }
            setStatus('error');
        } catch {
            setStatus('error');
        }
    };

    return (
        <section id={id || 'demo'} aria-labelledby="demo-heading"
            data-testid="demo-section" className="py-24 bg-pf-navy relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pf-sky/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''} grid grid-cols-1 lg:grid-cols-2 gap-16 items-start`}>
                    {/* Left */}
                    <div>
                        <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">Request Demo</p>
                        <h2 id="demo-heading" className="text-3xl sm:text-4xl font-bold font-outfit text-white leading-tight mb-5">
                            See PetroFi Running on a Real Petrol Pump
                        </h2>
                        <p className="text-slate-400 font-jakarta text-base leading-relaxed mb-8">
                            Book a personalized demo with our team. We'll show you exactly how PetroFi works
                            for a pump like yours — live, not a recording.
                        </p>
                        <div className="space-y-3 mb-8">
                            {FEATURES.map((f) => (
                                <div key={f} className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-pf-sky flex-shrink-0" />
                                    <span className="text-sm text-slate-300 font-jakarta">{f}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <a href="tel:+917398621812" className="flex items-center gap-3 text-slate-300 hover:text-white font-jakarta text-sm" style={{ transition: 'color 0.2s ease' }}>
                                <Phone size={14} className="text-pf-sky" /> +91 73986 21812
                            </a>
                            <a href="tel:+918700117495" className="flex items-center gap-3 text-slate-300 hover:text-white font-jakarta text-sm" style={{ transition: 'color 0.2s ease' }}>
                                <Phone size={14} className="text-pf-sky" /> +91 87001 17495
                            </a>
                            <a href="mailto:petrofibusiness@gmail.com" className="flex items-center gap-3 text-slate-300 hover:text-white font-jakarta text-sm" style={{ transition: 'color 0.2s ease' }}>
                                <Mail size={14} className="text-pf-sky" /> petrofibusiness@gmail.com
                            </a>
                            <div className="flex items-center gap-3 text-slate-400 font-jakarta text-sm">
                                <MapPin size={14} className="text-pf-sky" /> Available across India
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="bg-white rounded-2xl p-8 shadow-2xl">
                        {status === 'success' ? (
                            <div className="text-center py-8" data-testid="demo-success-msg">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={28} className="text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold font-outfit text-pf-navy mb-2">Request received!</h3>
                                <p className="text-slate-500 font-jakarta text-sm">
                                    We&apos;ve received your demo request and will get in touch shortly.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-5 text-pf-sky text-sm font-jakarta font-medium hover:underline"
                                >
                                    Submit another request
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} data-testid="demo-form" className="space-y-4">
                                <h3 className="text-xl font-bold font-outfit text-pf-navy mb-6">Book Your Free Demo</h3>
                                {[
                                    { name: 'name', label: 'Full Name', placeholder: 'Rajesh Kumar', type: 'text' },
                                    { name: 'pump_name', label: 'Pump Name', placeholder: 'Sharma Fuel Station', type: 'text' },
                                    { name: 'city', label: 'City', placeholder: 'Jaipur', type: 'text' },
                                    { name: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
                                    { name: 'email', label: 'Email Address', placeholder: 'you@example.com', type: 'email' },
                                ].map(({ name, label, placeholder, type }) => (
                                    <div key={name}>
                                        <label className="block text-xs font-semibold text-pf-navy font-jakarta mb-1.5">{label}</label>
                                        <input
                                            type={type}
                                            name={name}
                                            value={form[name]}
                                            onChange={handleChange}
                                            placeholder={placeholder}
                                            required
                                            data-testid={`demo-input-${name}`}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta text-pf-navy placeholder-slate-400 focus:outline-none focus:border-pf-sky bg-slate-50"
                                            style={{ transition: 'border-color 0.2s ease' }}
                                        />
                                    </div>
                                ))}
                                {status === 'error' && (
                                    <p className="text-red-500 text-xs font-jakarta" data-testid="demo-error-msg">
                                        Could not send your request. Please try again or contact us at +91 73986 21812 / petrofibusiness@gmail.com.
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    data-testid="demo-submit-btn"
                                    className="w-full bg-pf-navy text-white py-3 rounded-lg text-sm font-bold font-jakarta flex items-center justify-center gap-2 hover:bg-pf-navy/90 disabled:opacity-60 mt-2 shadow-sm"
                                    style={{ transition: 'background-color 0.2s ease' }}
                                >
                                    {status === 'loading' ? 'Submitting...' : <>Request Demo <ArrowRight size={16} /></>}
                                </button>
                                <p className="text-center text-xs text-slate-400 font-jakarta">
                                    No spam. No commitment. Just a live demo.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoSection;
