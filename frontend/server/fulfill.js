const { isUuid } = require('./http');
const { savePaymentOrder } = require('./save-payment-order');

function addMonths(date, months) {
    const next = new Date(date.getTime());
    next.setMonth(next.getMonth() + months);
    return next;
}

function periodForPump(endDate, months, now = new Date()) {
    const currentEnd = endDate ? new Date(endDate) : null;
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

async function planForOrder(admin, planId) {
    if (!isUuid(planId)) return null;
    const { data } = await admin.from('plans').select('id, code, duration_months').eq('id', planId).maybeSingle();
    const months = Number(data?.duration_months);
    if (!data?.id || !Number.isFinite(months) || months <= 0) return null;
    return { id: data.id, code: data.code, months };
}

function latestSubscription(rows) {
    if (!rows?.length) return null;
    return [...rows].sort((a, b) => {
        const end = new Date(b.end_date || 0).getTime() - new Date(a.end_date || 0).getTime();
        if (end) return end;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })[0];
}

async function activatePump(admin, order, { force = false } = {}) {
    const { data: pump, error: pumpError } = await admin
        .from('pumps')
        .select('id')
        .eq('id', order.pump_id)
        .maybeSingle();

    if (pumpError || !pump) {
        console.error('[payments] pump lookup after pay failed', pumpError?.code, pumpError?.message);
        return { ok: false, reason: 'fulfill_failed' };
    }

    const { data: subRows, error: subError } = await admin
        .from('subscriptions')
        .select('id, plan_id, status, end_date, created_at')
        .eq('pump_id', order.pump_id)
        .order('created_at', { ascending: false })
        .limit(8);

    if (subError) {
        console.error('[payments] subscription lookup failed', subError.code, subError.message);
        return { ok: false, reason: 'fulfill_failed' };
    }

    const current = latestSubscription(subRows);
    const plan = await planForOrder(admin, order.plan_id);
    if (!plan) {
        console.error('[payments] plan duration missing');
        return { ok: false, reason: 'fulfill_failed' };
    }

    let currentCode = null;
    if (isUuid(current?.plan_id)) {
        const { data: currentPlan } = await admin.from('plans').select('code').eq('id', current.plan_id).maybeSingle();
        currentCode = currentPlan?.code || null;
    }

    const alreadyPaid =
        current &&
        current.end_date &&
        String(current.status || '').toLowerCase() === 'active' &&
        currentCode &&
        currentCode !== 'trial';

    if (!force && alreadyPaid) {
        return { ok: true, already: true };
    }

    const period = periodForPump(current?.end_date, plan.months);
    const subscription = {
        pump_id: order.pump_id,
        plan_id: plan.id,
        status: 'active',
        start_date: period.start.toISOString(),
        end_date: period.end.toISOString(),
    };

    const write = current?.id
        ? admin.from('subscriptions').update(subscription).eq('id', current.id)
        : admin.from('subscriptions').insert(subscription);
    const { error: subWriteError } = await write;

    if (subWriteError) {
        console.error('[payments] subscription activate failed', subWriteError.code, subWriteError.message);
        return { ok: false, reason: 'fulfill_failed' };
    }

    const { error: pumpUpdateError } = await admin.from('pumps').update({ is_active: true }).eq('id', order.pump_id);

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
            return activatePump(admin, orderFrom(row), { force: false });
        }
        console.error('[payments] claim paid failed', err.reason || err.message);
        return { ok: false, reason: 'fulfill_failed' };
    }

    const wasAlreadyPaid = String(row.status || '').toLowerCase() === 'paid';
    return activatePump(admin, orderFrom(claimed || row), {
        force: !wasAlreadyPaid,
    });
}

module.exports = { fulfillPaidOrder, periodForPump };
