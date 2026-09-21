const { send, requireUser, adminClient } = require('./lib/http');
const { listQuotes } = require('./lib/catalog');
const { paymentsReady, getCashfreeOrder, orderIsPaid, amountsMatch } = require('./lib/cashfree');
const { fulfillPaidOrder } = require('./lib/fulfill');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    try {
        const auth = await requireUser(req, res);
        if (!auth) return;

        const url = new URL(req.url, 'http://localhost');
        const orderId = String(url.searchParams.get('order_id') || '').trim();
        if (!orderId || orderId.length > 50 || !/^pf_[a-z0-9_]+$/i.test(orderId)) {
            send(res, 400, { ok: false, reason: 'bad_request' });
            return;
        }

        const admin = adminClient();
        if (!admin || !paymentsReady()) {
            send(res, 503, { ok: false, reason: 'payments_offline' });
            return;
        }

        const { data: row, error } = await admin
            .from('payment_orders')
            .select('*')
            .eq('order_id', orderId)
            .eq('user_id', auth.user.id)
            .maybeSingle();

        if (error) {
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }
        if (!row) {
            send(res, 404, { ok: false, reason: 'not_found' });
            return;
        }

        if (row.status === 'paid') {
            send(res, 200, { ok: true, status: 'paid', orderId, quotes: listQuotes() });
            return;
        }

        let cfOrder;
        try {
            cfOrder = await getCashfreeOrder(orderId);
        } catch (err) {
            send(res, 200, { ok: true, status: row.status || 'pending', orderId, quotes: listQuotes() });
            return;
        }

        if (!orderIsPaid(cfOrder) || !amountsMatch(row.amount_total, cfOrder.order_amount)) {
            const mapped = String(cfOrder?.order_status || row.status || 'pending').toLowerCase();
            send(res, 200, { ok: true, status: mapped === 'paid' ? 'pending' : mapped, orderId, quotes: listQuotes() });
            return;
        }

        const result = await fulfillPaidOrder(admin, row, {
            cfOrderId: cfOrder.cf_order_id,
            paidAt: new Date().toISOString(),
        });

        if (!result.ok) {
            send(res, 500, { ok: false, reason: 'fulfill_failed' });
            return;
        }

        send(res, 200, { ok: true, status: 'paid', orderId, quotes: listQuotes() });
    } catch (err) {
        console.error('[payments] status', err.message);
        send(res, 500, { ok: false, reason: 'load_failed' });
    }
};
