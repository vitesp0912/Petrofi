const { send, requireUser, isUuid, adminClient } = require('../server/http');
const { listQuotes } = require('../server/catalog');
const { paymentsReady } = require('../server/cashfree');

const ORDER_COLUMNS = 'order_id, amount_total, currency, status, payment_method, paid_at, created_at, plan_id';

function mapOrder(row, planName) {
    return {
        orderId: row.order_id,
        planName: planName || null,
        amount: row.amount_total,
        currency: row.currency || 'INR',
        status: row.status || null,
        paidAt: row.paid_at || null,
        createdAt: row.created_at || null,
    };
}

async function ordersForPump(pumpId) {
    if (!isUuid(pumpId)) return [];
    const admin = adminClient();
    if (!admin) return [];
    const { data, error } = await admin
        .from('payment_orders')
        .select(ORDER_COLUMNS)
        .eq('pump_id', pumpId)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) {
        const err = new Error('load_failed');
        err.reason = 'load_failed';
        throw err;
    }
    const rows = data || [];
    const ids = [...new Set(rows.map((row) => row.plan_id).filter((id) => isUuid(id)))];
    let names = {};
    if (ids.length) {
        const { data: plans } = await admin.from('plans').select('id, name').in('id', ids);
        names = Object.fromEntries((plans || []).map((plan) => [plan.id, plan.name]));
    }
    return rows.map((row) => mapOrder(row, names[row.plan_id]));
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    try {
        const auth = await requireUser(req, res);
        if (!auth) return;

        const admin = adminClient();
        if (!admin) {
            send(res, 503, { ok: false, reason: 'unavailable' });
            return;
        }

        const url = new URL(req.url, 'http://localhost');
        const scope = String(url.searchParams.get('scope') || 'plans').trim();

        const { data: profile, error: profileError } = await admin
            .from('users')
            .select('pump_id')
            .eq('id', auth.user.id)
            .maybeSingle();

        if (profileError) {
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        const pumpId = isUuid(profile?.pump_id) ? profile.pump_id : null;
        const payload = { ok: true, ready: paymentsReady() };

        if (scope === 'orders') {
            payload.orders = await ordersForPump(pumpId);
            send(res, 200, payload);
            return;
        }

        payload.quotes = await listQuotes();
        payload.hasPump = Boolean(pumpId);
        send(res, 200, payload);
    } catch (err) {
        send(res, 500, { ok: false, reason: 'load_failed' });
    }
};
