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

export function formatDateFull(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const day = date.toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' });
    const month = date.toLocaleDateString('en-IN', { month: 'long', timeZone: 'Asia/Kolkata' });
    const year = date.toLocaleDateString('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' });
    return `${day} ${month}, ${year}`;
}

export function isPaidSubscription(subscription) {
    if (!subscription) return false;
    const code = String(subscription.planCode || '').trim().toLowerCase();
    if (code === 'trial') return false;
    if (code) return true;
    const name = String(subscription.planName || '').trim().toLowerCase();
    if (!name) return false;
    return !name.includes('trial');
}

export function isActiveSubscription(subscription) {
    return String(subscription?.status || '').trim().toLowerCase() === 'active';
}

export function planDurationLabel(subscription) {
    const days = Number(subscription?.days);
    const months = Number(subscription?.months);
    if (!Number.isFinite(days) || days <= 0) return null;
    if (days === 30 || months === 1) return '30 days';
    if (Number.isFinite(months) && months > 0) {
        return `${days} days (${months} ${months === 1 ? 'month' : 'months'})`;
    }
    return `${days} days`;
}

export function paidCopy(subscription) {
    const remaining = subscription?.remainingDays ?? daysUntil(subscription?.endDate);
    const dateLabel = formatDateFull(subscription?.endDate);
    const plan = String(subscription?.planName || '').trim() || 'PetroFI plan';
    const live = remaining == null || remaining >= 0;

    if (!live) {
        return {
            pill: 'Plan ended',
            status: remainingLabel(remaining),
            headline: plan,
            detail: dateLabel ? `${plan} ended on ${dateLabel}.` : `${plan} has ended.`,
            live: false,
        };
    }
    if (remaining == null) {
        return {
            pill: 'Active plan',
            status: remainingLabel(remaining),
            headline: plan,
            detail: `${plan} is active on this pump.`,
            live: true,
        };
    }
    if (remaining > 1) {
        return {
            pill: `${remaining} days left`,
            status: remainingLabel(remaining),
            headline: plan,
            detail: dateLabel ? `${plan} stays active until ${dateLabel}.` : `${plan} is active on this pump.`,
            live: true,
        };
    }
    if (remaining === 1) {
        return {
            pill: 'Ends tomorrow',
            status: '1 day left',
            headline: plan,
            detail: dateLabel ? `${plan} stays active until ${dateLabel}.` : `${plan} ends tomorrow.`,
            live: true,
        };
    }
    return {
        pill: 'Ends today',
        status: 'Ends today',
        headline: plan,
        detail: dateLabel ? `${plan} stays active until ${dateLabel}.` : `${plan} ends today.`,
        live: true,
    };
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

export function trialCopy(subscription) {
    const remaining = subscription?.remainingDays ?? daysUntil(subscription?.endDate);
    const dateLabel = formatDateLong(subscription?.endDate);

    if (remaining == null) {
        return {
            pill: 'Trial ending soon',
            status: 'Ending soon',
            detail: 'Your free trial is ending soon.',
        };
    }
    if (remaining > 1) {
        return {
            pill: `Trial ends in ${remaining} days`,
            status: remainingLabel(remaining),
            detail: dateLabel ? `Your trial ends on ${dateLabel}.` : `Trial ends in ${remaining} days.`,
        };
    }
    if (remaining === 1) {
        return {
            pill: 'Trial ends tomorrow',
            status: '1 day left',
            detail: dateLabel ? `Your trial ends on ${dateLabel}.` : 'Your trial ends tomorrow.',
        };
    }
    if (remaining === 0) {
        return {
            pill: 'Trial ends today',
            status: 'Ends today',
            detail: 'Your trial ends today.',
        };
    }
    return {
        pill: 'Trial ended',
        status: remainingLabel(remaining),
        detail: dateLabel ? `Your trial ended on ${dateLabel}.` : 'Your trial has ended.',
    };
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
    if (key === 'active' || key === 'approved' || key === 'paid') {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (key === 'pending') {
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (key === 'cancelled' || key === 'rejected' || key === 'expired' || key === 'inactive' || key === 'failed') {
        return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-slate-50 text-slate-600 border-slate-200';
}
