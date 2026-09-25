import { supabase } from './supabase';

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
    } catch {
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

export function formatMoney(amount, currency = 'INR') {
    const value = Number(amount);
    if (!Number.isFinite(value)) return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    }).format(value);
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
