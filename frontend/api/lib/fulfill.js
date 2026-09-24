const { billingCycleForMonths, pumpPlanForCheckout } = require('./catalog');
const { isUuid } = require('./http');
const { savePaymentOrder } = require('./save-payment-order');

function addMonths(date, months) {
    const next = new Date(date.getTime());
    next.setMonth(next.getMonth() + months);
    return next;
}

function periodForPump(pump, months, now = new Date()) {
    const currentEnd = pump?.subscription_end_date ? new Date(pump.subscription_end_date) : null;
    const validEnd = currentEnd && !Number.isNaN(currentEnd.getTime()) ? currentEnd : null;
    const start = validEnd && validEnd > now ? validEnd : now;
    return { start, end: addMonths(start, months) };
}

function orderFrom(row) {
    return {
        order_id: row.order_id,
        user_id: row.user_id,
        pump_id: row.pump_id,
        plan_id: row.plan_id,
        amount_total: row.amount_total,
    };
}

async function monthsForPlan(admin, planId) {
    if (!isUuid(planId)) return null;
    const { data } = await admin.from('plans').select('duration_months').eq('id', planId).maybeSingle();
    const months = Number(data?.duration_months);
    return Number.isFinite(months) && months > 0 ? months : null;
}

async function activatePump(admin, order, extras = {}, { force = false } = {}) {
    const { data: pump, error: pumpError } = await admin
        .from('pumps')
        .select('id, subscription_end_date, subscription_plan')
        .eq('id', order.pump_id)
        .maybeSingle();

    if (pumpError || !pump) {
        console.error('[payments] pump lookup after pay failed', pumpError?.code, pumpError?.message);
        return { ok: false, reason: 'fulfill_failed' };
    }

    if (!force && pump.subscription_end_date && pump.subscription_plan && pump.subscription_plan !== 'basic') {
        return { ok: true, already: true };
    }

    const paidAt = extras.paidAt || new Date().toISOString();
    const months = await monthsForPlan(admin, order.plan_id);
    if (!months) {
        console.error('[payments] plan duration missing');
        return { ok: false, reason: 'fulfill_failed' };
    }
    const period = periodForPump(pump, months);
    const { error: pumpUpdateError } = await admin
        .from('pumps')
        .update({
            subscription_status: 'active',
            payment_verified: true,
            payment_verified_at: paidAt,
            is_active: true,
            subscription_plan: pumpPlanForCheckout(),
            billing_cycle: billingCycleForMonths(months),
            subscription_start_date: period.start.toISOString(),
            subscription_end_date: period.end.toISOString(),
        })
        .eq('id', order.pump_id);

    if (pumpUpdateError) {
        console.error('[payments] pump activate failed', pumpUpdateError.code, pumpUpdateError.message);
        return { ok: false, reason: 'fulfill_failed' };
    }

    return { ok: true, already: false };
}

async function fulfillPaidOrder(admin, row, extras = {}) {
    if (!admin || !row?.order_id) {
        return { ok: false, reason: 'unavailable' };
    }

    let claimed;
    try {
        claimed = await savePaymentOrder(admin, {
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
            return activatePump(admin, orderFrom(row), extras, { force: false });
        }
        console.error('[payments] claim paid failed', err.reason || err.message);
        return { ok: false, reason: 'fulfill_failed' };
    }

    const wasAlreadyPaid = String(row.status || '').toLowerCase() === 'paid';
    return activatePump(admin, orderFrom(claimed || row), extras, {
        force: !wasAlreadyPaid,
    });
}

module.exports = { fulfillPaidOrder, periodForPump };
