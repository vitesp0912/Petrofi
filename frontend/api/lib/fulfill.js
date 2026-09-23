const { billingCycleForMonths, pumpPlanForCheckout } = require('./catalog');

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
        plan_name: row.plan_name,
        months: row.months,
        amount_total: row.amount_total,
    };
}

async function activatePump(admin, order, extras = {}, { rollbackOnFail = false, previousStatus = 'pending', force = false } = {}) {
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
    const period = periodForPump(pump, order.months);
    const { error: pumpUpdateError } = await admin
        .from('pumps')
        .update({
            subscription_status: 'active',
            payment_verified: true,
            payment_verified_at: paidAt,
            is_active: true,
            subscription_plan: pumpPlanForCheckout(),
            billing_cycle: billingCycleForMonths(order.months),
            subscription_start_date: period.start.toISOString(),
            subscription_end_date: period.end.toISOString(),
        })
        .eq('id', order.pump_id);

    if (pumpUpdateError) {
        console.error('[payments] pump activate failed', pumpUpdateError.code, pumpUpdateError.message);
        if (rollbackOnFail) {
            await admin
                .from('payment_orders')
                .update({
                    status: previousStatus && previousStatus !== 'paid' ? previousStatus : 'pending',
                    paid_at: null,
                    updated_at: new Date().toISOString(),
                })
                .eq('order_id', order.order_id)
                .eq('status', 'paid');
        }
        return { ok: false, reason: 'fulfill_failed' };
    }

    let planUuid = extras.planUuid || null;
    if (!planUuid && order.plan_id) {
        const { data: planRow } = await admin.from('plans').select('id').eq('code', order.plan_id).maybeSingle();
        planUuid = planRow?.id || null;
    }

    if (!planUuid) {
        console.error('[payments] history insert skipped missing plan_id');
    } else {
        const { error: historyError } = await admin.from('subscriptions').insert({
            pump_id: order.pump_id,
            plan_id: planUuid,
            status: 'active',
            start_date: period.start.toISOString(),
            end_date: period.end.toISOString(),
        });

        if (historyError) {
            console.error('[payments] history insert skipped', historyError.code, historyError.message);
        }
    }

    return { ok: true, already: false };
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
        console.error('[payments] claim paid failed', claimError.code, claimError.message);
        return { ok: false, reason: 'fulfill_failed' };
    }

    if (!claimed) {
        return activatePump(admin, orderFrom(row), extras, { rollbackOnFail: false });
    }

    return activatePump(admin, claimed, extras, {
        rollbackOnFail: true,
        previousStatus: row.status,
        force: true,
    });
}

module.exports = { fulfillPaidOrder, periodForPump };
