const { send, requireUser, isUuid, adminClient } = require('./lib/http');
const { listQuotes } = require('./lib/catalog');
const { paymentsReady } = require('./lib/cashfree');
const { buyerFrom, indianMobile } = require('./lib/buyer');

const PUMP_COLUMNS = 'id, pump_code, name, owner_name, phone, email';
const ORDER_COLUMNS = 'order_id, amount_total, currency, status, payment_method, paid_at, created_at, plan_id';

function mapOrder(row, planName) {
    return {
        orderId: row.order_id,
        planName: planName || null,
        amount: row.amount_total,
        currency: row.currency || 'INR',
        status: row.status || null,
        paymentMethod: row.payment_method || null,
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
        console.error('[payments] orders', error.code, error.message);
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

        const ready = paymentsReady();
        const { data: profile, error: profileError } = await auth.supabase
            .from('users')
            .select('name, role, pump_id')
            .eq('id', auth.user.id)
            .maybeSingle();

        if (profileError) {
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        let pump = null;
        if (isUuid(profile?.pump_id)) {
            const { data: pumpRow } = await auth.supabase
                .from('pumps')
                .select(PUMP_COLUMNS)
                .eq('id', profile.pump_id)
                .maybeSingle();
            if (pumpRow && pumpRow.id === profile.pump_id) pump = pumpRow;
        }

        const buyer = buyerFrom(auth.user, profile, pump);
        const [quotes, orders] = await Promise.all([
            listQuotes(),
            ordersForPump(pump?.id),
        ]);
        send(res, 200, {
            ok: true,
            ready,
            quotes,
            orders,
            buyer: {
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone || indianMobile(auth.user.phone),
                pumpName: buyer.pumpName,
                pumpCode: buyer.pumpCode,
                hasPump: Boolean(pump),
            },
        });
    } catch (err) {
        console.error('[payments] catalog', err.message);
        send(res, 500, { ok: false, reason: 'load_failed' });
    }
};
