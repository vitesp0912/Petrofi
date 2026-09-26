import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { statusTone, titleCase } from '../../lib/subscription';

const PETROFI_MARK =
    'https://customer-assets.emergentagent.com/job_shift-clarity/artifacts/zbnh3pqn_app_icon.png';

export const BrandLink = ({ compact = false }) => (
    <Link to="/" className="inline-flex items-center gap-2 min-w-0" data-testid="account-brand">
        <img src={PETROFI_MARK} alt="PetroFI" className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} object-contain shrink-0`} />
        <span className={`font-bold font-outfit text-pf-navy ${compact ? 'text-lg' : 'text-xl'}`}>PetroFI</span>
    </Link>
);

export const cardClass =
    'bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_32px_rgba(13,27,62,0.06)]';

export const Bone = ({ className = '' }) => (
    <div className={`animate-pulse rounded-md bg-slate-200/90 ${className}`} />
);

export const StatusPill = ({ value }) => (
    <span className={`inline-flex items-center justify-center min-h-10 sm:min-h-9 rounded-full border px-3.5 py-2 text-xs font-semibold font-jakarta ${statusTone(value)}`}>
        {titleCase(value)}
    </span>
);

export const FieldRow = ({ label, value }) => (
    <div className="flex items-start justify-between gap-6 py-3.5 border-b border-slate-100 last:border-b-0">
        <dt className="text-sm text-slate-500 font-jakarta shrink-0">{label}</dt>
        <dd className="text-sm font-semibold text-pf-navy font-jakarta text-right break-words">{value || 'Not set'}</dd>
    </div>
);

export const GateCard = ({ title, body, action, onAction, to }) => (
    <div className={`${cardClass} p-8 sm:p-10 h-full flex flex-col`} data-testid="subscription-gate">
        <div className="w-12 h-12 rounded-2xl bg-pf-sky/10 text-pf-sky flex items-center justify-center mb-5">
            <Building2 size={22} />
        </div>
        <h2 className="text-2xl font-bold font-outfit text-pf-navy mb-2">{title}</h2>
        <p className="text-sm text-slate-500 font-jakarta leading-relaxed">{body}</p>
        {action && to ? (
            <Link
                to={to}
                className="inline-flex mt-6 bg-pf-navy text-white px-5 py-2.5 rounded-full text-sm font-semibold font-jakarta hover:bg-pf-navy/90"
            >
                {action}
            </Link>
        ) : null}
        {action && onAction ? (
            <button
                type="button"
                onClick={onAction}
                className="inline-flex mt-6 bg-pf-navy text-white px-5 py-2.5 rounded-full text-sm font-semibold font-jakarta hover:bg-pf-navy/90"
            >
                {action}
            </button>
        ) : null}
    </div>
);

export const LoadingState = () => (
    <div className="space-y-5" data-testid="subscription-loading">
        <div className={`${cardClass} h-52 animate-pulse`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`${cardClass} h-56 animate-pulse`} />
            <div className={`${cardClass} h-56 animate-pulse`} />
        </div>
    </div>
);

export const PageIntro = ({ kicker, title, text }) => (
    <header className="mb-6 sm:mb-8">
        <p className="text-pf-sky text-xs font-semibold uppercase tracking-[0.16em] font-jakarta mb-2">{kicker}</p>
        <h1 className="text-[28px] sm:text-[34px] font-bold font-outfit text-pf-navy leading-[1.15] text-balance">{title}</h1>
        {text ? <p className="mt-2 text-[15px] text-slate-500 font-jakarta leading-relaxed max-w-2xl">{text}</p> : null}
    </header>
);
