import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp, Calendar, ChevronDown, ChevronRight, FileText, Shield } from 'lucide-react';
import Navbar from './Navbar';
import FooterSection from './FooterSection';

const LegalPageLayout = ({
    eyebrow,
    title,
    intro,
    version,
    effectiveDate,
    lastUpdated,
    controller,
    sections,
    related,
    children,
}) => {
    const [activeId, setActiveId] = useState(sections[0]?.id || '');
    const [showTop, setShowTop] = useState(false);
    const [tocOpen, setTocOpen] = useState(false);

    const toc = useMemo(
        () => sections.map(({ id, title: sectionTitle, number }) => ({ id, title: sectionTitle, number })),
        [sections],
    );

    useEffect(() => {
        const headings = sections
            .map(({ id }) => document.getElementById(id))
            .filter(Boolean);

        if (!headings.length) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
            },
            { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.25, 0.5] },
        );

        headings.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [sections]);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 480);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveId(id);
        setTocOpen(false);
        window.history.replaceState(null, '', `#${id}`);
    };

    const activeSection = toc.find((item) => item.id === activeId) || toc[0];

    return (
        <div className="font-jakarta bg-pf-deep text-white min-h-screen">
            <Navbar forceSolid />
            <main id="main-content" aria-label={title}>
                <header className="relative bg-pf-navy pt-24 pb-12 sm:pt-28 sm:pb-16 overflow-hidden">
                    <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-pf-sky/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pf-sky/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-jakarta text-slate-400 mb-6">
                            <Link to="/" className="hover:text-white" style={{ transition: 'color 0.2s ease' }}>
                                Home
                            </Link>
                            <ChevronRight size={12} className="text-slate-600" />
                            <span className="text-slate-500">Legal</span>
                            <ChevronRight size={12} className="text-slate-600" />
                            <span className="text-white">{title}</span>
                        </nav>

                        <div className="inline-flex items-center gap-2 bg-pf-sky/10 text-pf-sky text-xs font-semibold px-3 py-1.5 rounded-full font-jakarta mb-4 border border-pf-sky/20">
                            <FileText size={12} />
                            {eyebrow}
                        </div>

                        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-outfit text-white leading-tight max-w-3xl ${intro ? 'mb-4' : 'mb-8'}`}>
                            {title}
                        </h1>
                        {intro ? (
                            <p className="text-slate-300 font-jakarta text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
                                {intro}
                            </p>
                        ) : null}

                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <MetaChip label="Version" value={version} />
                            <MetaChip icon={Calendar} label="Effective" value={effectiveDate} />
                            <MetaChip icon={Calendar} label="Last updated" value={lastUpdated} />
                            {controller ? <MetaChip icon={Shield} label="Controller" value={controller} /> : null}
                        </div>
                    </div>
                </header>

                <div className="lg:hidden sticky top-16 z-30 bg-pf-deep/95 backdrop-blur-md border-b border-white/10">
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setTocOpen((open) => !open)}
                            aria-expanded={tocOpen}
                            aria-controls="mobile-legal-toc"
                            className="w-full flex items-center justify-between gap-3 py-3"
                        >
                            <span className="min-w-0 text-left">
                                <span className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 font-jakarta">
                                    On this page
                                </span>
                                <span className="block text-sm font-semibold font-outfit text-white truncate">
                                    {activeSection?.number}. {activeSection?.title}
                                </span>
                            </span>
                            <ChevronDown
                                size={18}
                                className={`text-white shrink-0 ${tocOpen ? 'rotate-180' : ''}`}
                                style={{ transition: 'transform 0.2s ease' }}
                            />
                        </button>
                        {tocOpen ? (
                            <nav
                                id="mobile-legal-toc"
                                aria-label="On this page"
                                className="absolute left-0 right-0 top-full bg-pf-navy border-b border-white/10 shadow-lg max-h-[min(60vh,420px)] overflow-y-auto"
                            >
                                <ol className="py-2 px-4 sm:px-6">
                                    {toc.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => scrollToSection(item.id)}
                                                className={`w-full text-left flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm font-jakarta ${
                                                    activeId === item.id
                                                        ? 'bg-pf-sky/10 text-white font-semibold'
                                                        : 'text-slate-400'
                                                }`}
                                                style={{ transition: 'background-color 0.2s ease, color 0.2s ease' }}
                                            >
                                                <span className={`tabular-nums shrink-0 ${activeId === item.id ? 'text-pf-sky' : 'text-slate-400'}`}>
                                                    {item.number}.
                                                </span>
                                                <span>{item.title}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        ) : null}
                    </div>
                </div>

                <div className="bg-pf-deep">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] gap-10 xl:gap-14 items-start">
                            <aside className="hidden lg:block sticky top-24 self-start">
                                <div className="bg-pf-card rounded-2xl border border-white/10 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-jakarta mb-4">
                                        On this page
                                    </p>
                                    <nav aria-label="Table of contents">
                                        <ol className="space-y-0.5">
                                            {toc.map((item) => (
                                                <li key={item.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => scrollToSection(item.id)}
                                                        className={`w-full text-left flex gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-jakarta leading-snug ${
                                                            activeId === item.id
                                                                ? 'bg-pf-sky/10 text-white font-semibold'
                                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                        style={{ transition: 'background-color 0.2s ease, color 0.2s ease' }}
                                                    >
                                                        <span className={`tabular-nums shrink-0 ${activeId === item.id ? 'text-pf-sky' : 'text-slate-400'}`}>
                                                            {item.number}
                                                        </span>
                                                        <span>{item.title}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ol>
                                    </nav>
                                </div>
                            </aside>

                            <div className="min-w-0">
                                <article className="bg-pf-card rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 lg:p-12 text-slate-200">
                                    {children}
                                </article>

                                {related ? (
                                    <div className="mt-6 sm:mt-8 bg-pf-navy rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                                        <div className="absolute inset-0 dot-pattern opacity-15 pointer-events-none" />
                                        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <p className="text-pf-sky text-xs font-semibold uppercase tracking-widest font-jakarta mb-2">
                                                    Related document
                                                </p>
                                                <p className="text-white font-outfit font-bold text-lg">{related.title}</p>
                                                <p className="text-slate-400 font-jakarta text-sm mt-1 max-w-md">{related.description}</p>
                                            </div>
                                            <Link
                                                to={related.to}
                                                className="inline-flex items-center justify-center gap-2 bg-pf-sky text-white px-5 py-2.5 rounded-lg text-sm font-semibold font-jakarta hover:bg-[#2aa5f0] shrink-0"
                                                style={{ transition: 'background-color 0.2s ease' }}
                                            >
                                                {related.cta} <ChevronRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 text-sm font-jakarta font-medium text-slate-500 hover:text-pf-navy"
                                        style={{ transition: 'color 0.2s ease' }}
                                    >
                                        <ArrowLeft size={14} /> Back to PetroFI
                                    </Link>
                                    <p className="text-xs text-slate-400 font-jakarta">
                                        Vitespace Private Limited · Product: PetroFI · {lastUpdated}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterSection />

            {showTop ? (
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-5 right-4 sm:bottom-8 sm:right-8 z-40 w-11 h-11 rounded-full bg-pf-navy text-white shadow-lg flex items-center justify-center hover:bg-pf-sky"
                    style={{ transition: 'background-color 0.2s ease' }}
                    aria-label="Back to top"
                >
                    <ArrowUp size={18} />
                </button>
            ) : null}
        </div>
    );
};

const MetaChip = ({ icon: Icon, label, value }) => (
    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
        {Icon ? <Icon size={12} className="text-pf-sky shrink-0" /> : null}
        <span className="text-[11px] sm:text-xs text-slate-400 font-jakarta">
            {label}: <span className="text-white font-medium">{value}</span>
        </span>
    </div>
);

export const LegalSection = ({ id, number, title, children }) => (
    <section id={id} className="scroll-mt-36 lg:scroll-mt-24 pb-10 mb-10 border-b border-slate-100 last:border-b-0 last:mb-0 last:pb-0">
        <div className="flex items-start gap-3 mb-4">
            <span className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-pf-sky/10 text-pf-sky text-xs font-bold font-outfit flex items-center justify-center">
                {number}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-outfit text-white leading-snug">{title}</h2>
        </div>
        <div className="lg:pl-11 space-y-4">{children}</div>
    </section>
);

export const LegalP = ({ children }) => (
    <p className="text-sm sm:text-[15px] text-slate-600 font-jakarta leading-relaxed">{children}</p>
);

export const LegalH3 = ({ children }) => (
    <h3 className="text-base sm:text-lg font-bold font-outfit text-white pt-2">{children}</h3>
);

export const LegalList = ({ items }) => (
    <ul className="space-y-2">
        {items.map((item) => (
            <li key={typeof item === 'string' ? item : item.key} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-slate-600 font-jakarta leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-pf-sky mt-2 shrink-0" />
                <span>{typeof item === 'string' ? item : item.content}</span>
            </li>
        ))}
    </ul>
);

export const LegalTable = ({ headers, rows }) => (
    <div className="overflow-x-auto -mx-1 sm:mx-0 rounded-xl border border-slate-200">
        <table className="w-full min-w-[520px] text-left text-sm font-jakarta">
            <thead>
                <tr className="bg-pf-navy text-white">
                    {headers.map((h) => (
                        <th key={h} className="px-4 py-3 font-outfit font-semibold text-xs uppercase tracking-wide">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 text-slate-600 align-top leading-relaxed">
                                {j === 0 ? <span className="font-semibold text-pf-navy">{cell}</span> : cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const LegalCallout = ({ children }) => (
    <div className="bg-pf-sky/5 border border-pf-sky/20 rounded-xl px-4 py-3 text-sm text-slate-700 font-jakarta leading-relaxed">
        {children}
    </div>
);

export const LegalContactCard = ({ children }) => (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 sm:p-6">
        {children}
    </div>
);

export default LegalPageLayout;
