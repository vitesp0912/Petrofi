const { send, requireUser, adminClient, readJsonBody } = require('./lib/http');
const { savePaymentOrder } = require('./lib/save-payment-order');

const CLIENT_STATUSES = new Set(['failed', 'expired', 'user_dropped']);
const ORDER_ID_RE = /^pf_[a-z0-9_]+$/i;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    try {
        const auth = await requireUser(req, res);
        if (!auth) return;

        let body;
        try {
            body = await readJsonBody(req);
        } catch {
            send(res, 400, { ok: false, reason: 'bad_request' });
            return;
        }

        const orderId = String(body?.orderId || '').trim();
        const status = String(body?.status || '').trim().toLowerCase();
        if (!ORDER_ID_RE.test(orderId) || orderId.length > 50 || !CLIENT_STATUSES.has(status)) {
            send(res, 400, { ok: false, reason: 'bad_request' });
            return;
        }

        const admin = adminClient();
        if (!admin) {
            send(res, 503, { ok: false, reason: 'unavailable' });
            return;
        }

        const { data: row, error } = await admin
            .from('payment_orders')
            .select('order_id, user_id, status')
            .eq('order_id', orderId)
            .eq('user_id', auth.user.id)
            .maybeSingle();

        if (error) {
            send(res, 500, { ok: false, reason: 'save_failed' });
            return;
        }
        if (!row) {
            send(res, 404, { ok: false, reason: 'not_found' });
            return;
        }
        if (row.status === 'paid') {
            send(res, 409, { ok: false, reason: 'already_paid' });
            return;
        }

        const saved = await savePaymentOrder(admin, {
            orderId,
            status,
            userId: auth.user.id,
        });

        send(res, 200, {
            ok: true,
            orderId: saved.order_id,
            status: saved.status,
        });
    } catch (err) {
        console.error('[payments] save', err.message);
        send(res, 500, { ok: false, reason: err.reason || 'save_failed' });
    }
};
