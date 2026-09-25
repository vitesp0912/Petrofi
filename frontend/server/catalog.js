const { adminClient } = require('./http');

const PLAN_COLUMNS =
    'id, code, name, duration_days, duration_months, price_base_inr, gst_rate, gst_inr, price_total_inr, currency, is_active, sort_order';

function money(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function periodCopy(row) {
    const days = Number(row.duration_days);
    const months = Number(row.duration_months);
    return {
        billedAs: `${days} days`,
        period: `Covers ${days} days (${months} ${months === 1 ? 'month' : 'months'}) after payment.`,
        cta: `Continue with ${row.name}`,
    };
}

function toQuote(row, featuredCode) {
    const copy = periodCopy(row);
    const gstRate = money(row.gst_rate);
    return {
        id: row.code,
        name: row.name,
        months: Number(row.duration_months),
        days: Number(row.duration_days),
        billedAs: copy.billedAs,
        period: copy.period,
        cta: copy.cta,
        featured: Boolean(featuredCode) && row.code === featuredCode,
        base: money(row.price_base_inr),
        gst: money(row.gst_inr),
        total: money(row.price_total_inr),
        gstRate,
        gstPct: gstRate,
        currency: row.currency || 'INR',
        sortOrder: Number(row.sort_order) || 0,
    };
}

function featuredCode(rows) {
    if (!rows.length) return null;
    return rows.reduce((best, row) =>
        Number(row.duration_months) > Number(best.duration_months) ? row : best
    ).code;
}

async function loadActivePaidPlans() {
    const admin = adminClient();
    if (!admin) {
        const err = new Error('unavailable');
        err.reason = 'unavailable';
        throw err;
    }

    const { data, error } = await admin
        .from('plans')
        .select(PLAN_COLUMNS)
        .eq('is_active', true)
        .neq('code', 'trial')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('[plans] catalog', error.code, error.message);
        const err = new Error('load_failed');
        err.reason = 'load_failed';
        throw err;
    }

    return data || [];
}

async function listQuotes() {
    const rows = await loadActivePaidPlans();
    const featured = featuredCode(rows);
    return rows.map((row) => toQuote(row, featured));
}

async function quoteById(planId) {
    const code = String(planId || '').trim();
    if (!code || code === 'trial') return null;

    const admin = adminClient();
    if (!admin) {
        const err = new Error('unavailable');
        err.reason = 'unavailable';
        throw err;
    }

    const { data, error } = await admin
        .from('plans')
        .select(PLAN_COLUMNS)
        .eq('code', code)
        .eq('is_active', true)
        .neq('code', 'trial')
        .maybeSingle();

    if (error) {
        console.error('[plans] quote', error.code, error.message);
        const err = new Error('load_failed');
        err.reason = 'load_failed';
        throw err;
    }

    if (!data) return null;
    const quote = toQuote(data, data.code);
    quote.planUuid = data.id;
    return quote;
}

module.exports = {
    listQuotes,
    quoteById,
};
