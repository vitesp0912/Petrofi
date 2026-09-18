import React from 'react';

export const PhoneFrame = ({ title, image, alt, children, caption }) => (
    <figure className="mx-auto w-[220px] sm:w-56 flex-shrink-0">
        <div className="w-full aspect-[9/19.5] bg-slate-100 rounded-[28px] border-[3px] border-slate-200 shadow-[0_16px_40px_rgba(13,27,62,0.12)] overflow-hidden relative">
            {image ? (
                <img
                    src={image}
                    alt={alt || title}
                    className="w-full h-full object-contain object-top bg-slate-100"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full">{children}</div>
            )}
        </div>
        {(caption || title) && (
            <figcaption className="text-center mt-3">
                <p className="text-sm font-semibold font-outfit text-pf-navy">{title}</p>
                {caption && <p className="text-xs text-slate-500 font-jakarta mt-1">{caption}</p>}
            </figcaption>
        )}
    </figure>
);

const StatusBar = () => (
    <div className="flex items-center justify-between px-4 pt-2 pb-1 text-[9px] text-slate-500 font-jakarta">
        <span>9:22</span>
        <span className="flex gap-1">●●●●</span>
    </div>
);

const BottomNav = ({ active = 'Entries' }) => {
    const items = ['Home', 'Entries', 'Reports', 'Settings'];
    return (
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-100 flex justify-around py-2">
            {items.map((item) => (
                <span
                    key={item}
                    className={`text-[8px] font-jakarta ${item === active ? 'text-pf-navy font-semibold' : 'text-slate-400'}`}
                >
                    {item}
                </span>
            ))}
        </div>
    );
};

export const InventoryMockScreen = () => (
    <div className="h-full bg-[#F4F6FA] relative text-left">
        <StatusBar />
        <p className="text-center text-[13px] font-bold font-outfit text-pf-navy mb-2">Inventory</p>
        <div className="px-3 space-y-2">
            <div className="bg-pf-navy text-white rounded-xl p-3">
                <p className="text-[8px] text-white/70 font-jakarta">Non-fuel stock</p>
                <p className="text-sm font-bold font-outfit">Lubricants & oils</p>
            </div>
            {[
                { name: 'Engine oils', sub: 'In stock · sold today' },
                { name: 'Lubricants', sub: 'Movement recorded' },
                { name: 'Other products', sub: 'Sales tracked' },
            ].map((row) => (
                <div key={row.name} className="bg-white rounded-xl p-3 border border-slate-100">
                    <p className="text-[11px] font-semibold font-outfit text-pf-navy">{row.name}</p>
                    <p className="text-[9px] text-slate-500 font-jakarta">{row.sub}</p>
                </div>
            ))}
        </div>
        <BottomNav />
    </div>
);

export const TankMockScreen = () => (
    <div className="h-full bg-[#F4F6FA] relative text-left">
        <StatusBar />
        <p className="text-center text-[13px] font-bold font-outfit text-pf-navy mb-2">Tank Stock</p>
        <div className="px-3 space-y-2">
            {[
                { name: 'Tank 1 · Petrol', fill: '72%', color: '#F59E0B' },
                { name: 'Tank 2 · Diesel', fill: '54%', color: '#38B6FF' },
                { name: 'Tank 3 · Speed', fill: '31%', color: '#EF4444' },
            ].map((tank) => (
                <div key={tank.name} className="bg-white rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] font-semibold font-outfit text-pf-navy">{tank.name}</p>
                        <p className="text-[10px] font-jakarta text-slate-500">{tank.fill}</p>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: tank.fill, backgroundColor: tank.color }} />
                    </div>
                </div>
            ))}
            <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-[9px] text-slate-500 font-jakarta">Tank-related data, recorded with the rest of the pump.</p>
            </div>
        </div>
        <BottomNav />
    </div>
);

export const ReportSnippet = ({ title, rows, accent = '#0D1B3E' }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full">
        <div className="px-4 py-3 text-white" style={{ backgroundColor: accent }}>
            <p className="text-xs font-jakarta opacity-80">Report</p>
            <p className="text-sm font-bold font-outfit">{title}</p>
        </div>
        <div className="p-4 space-y-2.5">
            {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-jakarta">{row.label}</span>
                    <span className="text-xs font-semibold font-outfit text-pf-navy">{row.value}</span>
                </div>
            ))}
        </div>
    </div>
);
