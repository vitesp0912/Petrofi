const { savePaymentOrder } = require('./save-payment-order');
const { logQuietly } = require('./error-log');

async function fulfillPaidOrder(admin, row, extras = {}) {
    if (!admin || !row?.order_id) {
        return { ok: false, reason: 'unavailable' };
    }

    if (String(row.status || '').toLowerCase() === 'paid') {
        return { ok: true, already: true };
    }

    try {
        await savePaymentOrder(admin, {
            orderId: row.order_id,
            status: 'paid',
            userId: row.user_id,
            pumpId: row.pump_id,
            amountTotal: row.amount_total,
            planId: row.plan_id,
            cfOrderId: extras.cfOrderId || row.cf_order_id || null,
            cfPaymentId: extras.cfPaymentId || row.cf_payment_id || null,
            paymentMethod: extras.paymentMethod || row.payment_method || null,
            paidAt: extras.paidAt || new Date().toISOString(),
        });
    } catch (err) {
        if (err.reason === 'already_paid') {
            return { ok: true, already: true };
        }
        logQuietly({
            source: 'database',
            severity: 'critical',
            module: 'payments',
            errorType: 'fulfill_failed',
            error: err,
            message: err?.message || 'fulfill_failed',
            userId: row.user_id,
            pumpId: row.pump_id,
            endpoint: 'fulfillPaidOrder',
            details: {
                orderId: row.order_id,
                reason: err?.reason || 'fulfill_failed',
            },
            responseStatus: 500,
        });
        return { ok: false, reason: 'fulfill_failed' };
    }

    return { ok: true, already: false };
}

module.exports = { fulfillPaidOrder };
