import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Smartphone, DollarSign, Minus, BarChart2, Activity } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const WEEKLY_DATA = [
    { day: 'Mon', sales: 185000, digital: 62000 },
    { day: 'Tue', sales: 210000, digital: 78000 },
    { day: 'Wed', sales: 175000, digital: 55000 },
    { day: 'Thu', sales: 245000, digital: 93000 },
    { day: 'Fri', sales: 230000, digital: 85000 },
    { day: 'Sat', sales: 290000, digital: 110000 },
    { day: 'Sun', sales: 198000, digital: 70000 },
];

const METRICS = [
    { icon: TrendingUp, label: "Today's Sales", value: '₹2,45,800', sub: '↑ 12%', subColor: 'text-green-400' },
    { icon: Smartphone, label: 'Digital Payments', value: '₹63,800', sub: 'UPI + Card', subColor: 'text-slate-400' },
    { icon: DollarSign, label: 'Cash Collected', value: '₹1,82,000', sub: 'Verified', subColor: 'text-green-400' },
    { icon: Minus, label: 'Expenses', value: '₹12,400', sub: 'Operational', subColor: 'text-slate-400' },
    { icon: BarChart2, label: 'Profit Today', value: '₹18,500', sub: '↑ 8%', subColor: 'text-green-400' },
    { icon: Activity, label: 'Active Shifts', value: '2', sub: 'of 3 shifts', subColor: 'text-slate-400' },
];

const formatINR = (val) => `₹${(val / 1000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-xs font-jakarta">
                <p className="font-semibold text-pf-navy mb-1">{label}</p>
                <p className="text-pf-sky">Sales: ₹{payload[0]?.value?.toLocaleString('en-IN')}</p>
                <p className="text-blue-400">Digital: ₹{payload[1]?.value?.toLocaleString('en-IN')}</p>
            </div>
        );
    }
    return null;
};

const DashboardSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section id="dashboard" data-testid="dashboard-section" className="py-24 bg-pf-navy overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
                    <div className="text-center mb-14">
                        <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">Live Dashboard</p>
                        <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-white leading-tight mb-4">
                            Your Entire Petrol Pump — In One Dashboard
                        </h2>
                        <p className="text-slate-400 font-jakarta text-base max-w-xl mx-auto">
                            Get a complete overview of pump performance from anywhere. All numbers update in real time.
                        </p>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {METRICS.map(({ icon: Icon, label, value, sub, subColor }, i) => (
                            <div
                                key={label}
                                data-testid={`dashboard-metric-${i}`}
                                className={`bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm fade-up ${isVisible ? 'visible' : ''} delay-${(i % 3 + 1) * 100}`}
                            >
                                <Icon size={16} className="text-pf-sky mb-3" />
                                <p className="text-[11px] text-slate-400 font-jakarta mb-1">{label}</p>
                                <p className="text-lg font-bold text-white font-outfit">{value}</p>
                                <p className={`text-xs font-jakarta ${subColor}`}>{sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm fade-up ${isVisible ? 'visible' : ''} delay-300`}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-white font-semibold font-outfit">Weekly Sales Overview</p>
                                <p className="text-slate-400 text-xs font-jakarta mt-0.5">Total + Digital breakdown</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-jakarta">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-pf-sky rounded-full block" />Total Sales</span>
                                <span className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-1.5 bg-blue-400 rounded-full block" />Digital</span>
                            </div>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={WEEKLY_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#38B6FF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#38B6FF" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="digitalGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={formatINR} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="sales" stroke="#38B6FF" strokeWidth={2} fill="url(#salesGrad)" />
                                    <Area type="monotone" dataKey="digital" stroke="#60A5FA" strokeWidth={2} fill="url(#digitalGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardSection;
