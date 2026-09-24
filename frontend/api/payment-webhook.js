const { send, adminClient } = require('./lib/http');
const { paymentsReady, verifyWebhookSignature, orderIsPaid, amountsMatch, getCashfreeOrder, getSuccessfulPaymentId } = require('./lib/cashfree');
const { fulfillPaidOrder } = require('./lib/fulfill');
const { savePaymentOrder } = require('./lib/save-payment-order');

module.exports.config = {
    api: { bodyParser: false },
};

function header(req, name) {
    const value = req.headers[name] || req.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
}

async function readRawBody(req) {
    if (typeof req.body === 'string') return req.body;
    if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

function extractOrder(payload) {
    const data = payload?.data || {};
    const order = data.order || payload?.order || {};
    const payment = data.payment || payload?.payment || {};
    return {
        type: String(payload?.type || payload?.event || ''),
        orderId: String(order.order_id || payload?.order_id || '').trim(),
        amount: order.order_amount,
        cfOrderId: order.cf_order_id,
        paymentStatus: String(payment.payment_status || order.order_status || '').toUpperCase(),
        cfPaymentId: payment.cf_payment_id ? String(payment.cf_payment_id) : null,
        paymentMethod: payment.payment_group || payment.payment_method || null,
    };
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    if (!paymentsReady()) {
        send(res, 503, { ok: false, reason: 'payments_offline' });
        return;
    }

    let rawBody = '';
    try {
        rawBody = await readRawBody(req);
    } catch {
        send(res, 400, { ok: false, reason: 'bad_request' });
        return;
    }

    const timestamp = header(req, 'x-webhook-timestamp');
    const signature = header(req, 'x-webhook-signature');
    const eventId = header(req, 'x-webhook-id') || header(req, 'x-idempotency-key') || header(req, 'x-idempotency-header');

    if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
        send(res, 401, { ok: false, reason: 'invalid_signature' });
        return;
    }

    let payload;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        send(res, 400, { ok: false, reason: 'bad_request' });
        return;
    }

    const event = extractOrder(payload);
    if (!event.orderId) {
        send(res, 200, { ok: true });
        return;
    }

    const admin = adminClient();
    if (!admin) {
        send(res, 503, { ok: false, reason: 'payments_offline' });
        return;
    }

    if (eventId) {
        const { error: dupError } = await admin.from('payment_webhook_events').insert({
            event_id: String(eventId).slice(0, 200),
            order_id: event.orderId,
        });
        if (dupError && dupError.code === '23505') {
            send(res, 200, { ok: true, duplicate: true });
            return;
        }
    }

    const { data: row, error } = await admin
        .from('payment_orders')
        .select('*')
        .eq('order_id', event.orderId)
        .maybeSingle();

    if (error || !row) {
        send(res, 200, { ok: true });
        return;
    }

    if (row.status === 'paid') {
        send(res, 200, { ok: true });
        return;
    }

    const success = event.paymentStatus === 'SUCCESS' || event.paymentStatus === 'PAID' || /SUCCESS/i.test(event.type);
    if (!success) {
        let next = null;
        if (event.paymentStatus === 'FAILED' || /FAILED/i.test(event.type)) next = 'failed';
        else if (event.paymentStatus === 'EXPIRED' || /EXPIRED/i.test(event.type)) next = 'expired';
        else if (
            event.paymentStatus === 'USER_DROPPED' ||
            event.paymentStatus === 'CANCELLED' ||
            /USER_DROPPED|CANCELLED/i.test(event.type)
        ) {
            next = 'user_dropped';
        }
        if (next) {
            await savePaymentOrder(admin, { orderId: row.order_id, status: next }).catch(() => {});
        }
        send(res, 200, { ok: true });
        return;
    }

    if (!amountsMatch(row.amount_total, event.amount)) {
        try {
            const cfOrder = await getCashfreeOrder(row.order_id);
            if (!orderIsPaid(cfOrder) || !amountsMatch(row.amount_total, cfOrder.order_amount)) {
                send(res, 200, { ok: true });
                return;
            }
        } catch {
            send(res, 200, { ok: true });
            return;
        }
    }

    let cfPaymentId = event.cfPaymentId || row.cf_payment_id || null;
    if (!cfPaymentId) {
        cfPaymentId = await getSuccessfulPaymentId(row.order_id).catch(() => null);
    }
    if (!cfPaymentId) {
        send(res, 200, { ok: true });
        return;
    }

    const result = await fulfillPaidOrder(admin, row, {
        cfOrderId: event.cfOrderId,
        cfPaymentId,
        paymentMethod: event.paymentMethod,
        paidAt: new Date().toISOString(),
    });

    if (!result.ok) {
        send(res, 500, { ok: false, reason: 'fulfill_failed' });
        return;
    }

    send(res, 200, { ok: true });
};
