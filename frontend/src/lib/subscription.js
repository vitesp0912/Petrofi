import { supabase } from './supabase';
import PLAN_CATALOG from './plan-catalog.json';

export async function fetchPumpSubscription() {
    if (!supabase) {
        return { ok: false, reason: 'unavailable' };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
        return { ok: false, reason: 'signed_out' };
    }

    try {
        const res = await fetch('/api/subscription', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return { ok: false, reason: 'unavailable' };
        }
        const body = await res.json().catch(() => null);
        if (res.status === 401) {
            if (supabase) await supabase.auth.signOut();
            return { ok: false, reason: 'signed_out' };
        }
        if (!res.ok || !body?.ok) {
            return { ok: false, reason: body?.reason || 'load_failed' };
        }
        return body;
    } catch (err) {
        console.error('[PetroFI subscription]', err);
        return { ok: false, reason: 'load_failed' };
    }
}

export function titleCase(value) {
    if (!value) return 'Not set';
    return String(value)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDate(value) {
    if (!value) return 'Not set';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not set';
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    });
}

export function formatDateLong(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        timeZone: 'Asia/Kolkata',
    });
}

export function formatMoney(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value)) return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
}

export const GST_RATE = PLAN_CATALOG.gstRate;
export const EARLY_BIRD_LAST_DAY = PLAN_CATALOG.earlyBirdLastDay;
export const EARLY_BIRD_END_LABEL = '31 December 2026';
export const STANDARD_FROM_LABEL = '1 January 2027';

export const PETROFI_PLANS = PLAN_CATALOG.plans;

function kolkataDay(now = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);
}

export function isEarlyBirdActive(now = new Date()) {
    return kolkataDay(now) <= EARLY_BIRD_LAST_DAY;
}

export function daysUntilEarlyBirdEnd(now = new Date()) {
    const end = new Date('2026-12-31T18:29:59.000Z');
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

export function gstAmount(base) {
    return Math.round(Number(base) * GST_RATE);
}

export function totalWithGst(base) {
    return Number(base) + gstAmount(base);
}

export function planPrice(plan, now = new Date()) {
    const early = isEarlyBirdActive(now);
    const base = early ? plan.earlyBird : plan.standard;
    const saved = Math.max(0, plan.standard - plan.earlyBird);
    const off = plan.standard > 0 ? Math.round((saved / plan.standard) * 100) : 0;
    return {
        early,
        base,
        gst: gstAmount(base),
        total: totalWithGst(base),
        saved,
        off,
        perMonth: Math.round(base / plan.months),
        laterPerMonth: Math.round(plan.standard / plan.months),
        savedPerMonth: Math.round(saved / plan.months),
    };
}

export function remainingLabel(remaining) {
    if (remaining == null) return 'No end date on file';
    if (remaining > 1) return `${remaining} days left`;
    if (remaining === 1) return '1 day left';
    if (remaining === 0) return 'Ends today';
    if (remaining === -1) return '1 day overdue';
    return `${Math.abs(remaining)} days overdue`;
}

export function periodProgress(startDate, endDate, now = new Date()) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        return null;
    }
    const pct = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
    return Math.min(100, Math.max(0, Math.round(pct)));
}

export function daysUntil(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

export function roleLabel(role) {
    const key = String(role || '').toLowerCase();
    if (key === 'dealer') return 'Owner';
    if (key === 'manager') return 'Manager';
    if (key === 'fsm') return 'Staff';
    return titleCase(role);
}

export function statusTone(status) {
    const key = String(status || '').toLowerCase();
    if (key === 'active' || key === 'approved') {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (key === 'pending') {
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (key === 'cancelled' || key === 'rejected' || key === 'expired' || key === 'inactive') {
        return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-slate-50 text-slate-600 border-slate-200';
}
