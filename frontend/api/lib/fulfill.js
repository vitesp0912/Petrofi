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

async function fulfillPaidOrder(admin, row, extras = {}) {
    if (!admin || !row?.order_id) {
        return { ok: false, reason: 'unavailable' };
    }

    const paidStamp = {
        status: 'paid',
        paid_at: extras.paidAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cf_order_id: extras.cfOrderId || row.cf_order_id || null,
        cf_payment_id: extras.cfPaymentId || row.cf_payment_id || null,
        payment_method: extras.paymentMethod || row.payment_method || null,
    };

    const { data: claimed, error: claimError } = await admin
        .from('payment_orders')
        .update(paidStamp)
        .eq('order_id', row.order_id)
        .neq('status', 'paid')
        .select('order_id, user_id, pump_id, plan_id, plan_name, months, amount_total')
        .maybeSingle();

    if (claimError) {
        console.error('[payments] claim paid failed');
        return { ok: false, reason: 'fulfill_failed' };
    }

    if (!claimed) {
        return { ok: true, already: true };
    }

    const order = claimed;

    const { data: pump, error: pumpError } = await admin
        .from('pumps')
        .select('id, subscription_end_date')
        .eq('id', order.pump_id)
        .maybeSingle();

    if (pumpError || !pump) {
        console.error('[payments] pump lookup after pay failed');
        return { ok: false, reason: 'fulfill_failed' };
    }

    const period = periodForPump(pump, order.months);
    const { error: pumpUpdateError } = await admin
        .from('pumps')
        .update({
            subscription_status: 'active',
            payment_verified: true,
            is_active: true,
            subscription_plan: order.plan_name,
            billing_cycle: order.plan_id,
            subscription_start_date: period.start.toISOString(),
            subscription_end_date: period.end.toISOString(),
        })
        .eq('id', order.pump_id);

    if (pumpUpdateError) {
        console.error('[payments] pump activate failed');
        return { ok: false, reason: 'fulfill_failed' };
    }

    const { error: historyError } = await admin.from('subscriptions').insert({
        pump_id: order.pump_id,
        plan: order.plan_name,
        status: 'active',
        start_date: period.start.toISOString(),
        end_date: period.end.toISOString(),
        amount: order.amount_total,
    });

    if (historyError) {
        console.error('[payments] history insert skipped');
    }

    return { ok: true, already: false };
}

module.exports = { fulfillPaidOrder, periodForPump };
