const { send, requireUser, adminClient } = require('../server/http');
const { paymentsReady, getCashfreeOrder, getSuccessfulPaymentId, orderIsPaid, amountsMatch } = require('../server/cashfree');
const { fulfillPaidOrder } = require('../server/fulfill');

const ORDER_COLUMNS =
    'order_id, user_id, pump_id, plan_id, amount_total, status, cf_order_id, cf_payment_id, paid_at, payment_method';

function reply(res, status, orderId) {
    send(res, 200, { ok: true, status, orderId });
}

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
            .select(ORDER_COLUMNS)
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
            const healed = await fulfillPaidOrder(admin, row, {
                cfOrderId: row.cf_order_id,
                paidAt: row.paid_at || new Date().toISOString(),
            });
            if (!healed.ok) {
                send(res, 500, { ok: false, reason: 'fulfill_failed' });
                return;
            }
            reply(res, 'paid', orderId);
            return;
        }

        let cfOrder;
        try {
            cfOrder = await getCashfreeOrder(orderId);
        } catch {
            reply(res, row.status || 'pending', orderId);
            return;
        }

        if (!orderIsPaid(cfOrder) || !amountsMatch(row.amount_total, cfOrder.order_amount)) {
            const mapped = String(cfOrder?.order_status || row.status || 'pending').toLowerCase();
            reply(res, mapped === 'paid' ? 'pending' : mapped, orderId);
            return;
        }

        const cfPaymentId = (await getSuccessfulPaymentId(orderId).catch(() => null)) || row.cf_payment_id;
        if (!cfPaymentId) {
            reply(res, 'pending', orderId);
            return;
        }

        const result = await fulfillPaidOrder(admin, row, {
            cfOrderId: cfOrder.cf_order_id,
            cfPaymentId,
            paidAt: new Date().toISOString(),
        });

        if (!result.ok) {
            send(res, 500, { ok: false, reason: 'fulfill_failed' });
            return;
        }

        reply(res, 'paid', orderId);
    } catch {
        send(res, 500, { ok: false, reason: 'load_failed' });
    }
};
