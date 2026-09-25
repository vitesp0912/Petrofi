const { isUuid } = require('./http');

function blankToNull(value) {
    if (value == null) return null;
    const text = String(value).trim();
    return text ? text : null;
}

function compactArgs(args) {
    const out = {};
    Object.entries(args).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        out[key] = value;
    });
    return out;
}

function money2(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100) / 100;
}

function wholeDays(value) {
    const days = Number(value);
    if (!Number.isInteger(days) || days <= 0) return null;
    return days;
}

async function durationForPlan(admin, planId) {
    if (!isUuid(planId)) return null;
    const { data, error } = await admin.from('plans').select('duration_days').eq('id', planId).maybeSingle();
    if (error) return null;
    return wholeDays(data?.duration_days);
}

async function storeDurationDays(admin, saved, fallbackPlanId) {
    if (!saved?.order_id || wholeDays(saved.duration_days)) return saved;
    const days = await durationForPlan(admin, saved.plan_id || fallbackPlanId);
    if (!days) return saved;
    const { error } = await admin.from('payment_orders').update({ duration_days: days }).eq('order_id', saved.order_id);
    if (error) return saved;
    return { ...saved, duration_days: days };
}

async function loadPlan(admin, planId) {
    const value = blankToNull(planId);
    if (!value) return null;
    const query = admin.from('plans').select('id, code, price_total_inr, currency, duration_days').eq('is_active', true).neq('code', 'trial');
    const { data, error } = isUuid(value)
        ? await query.eq('id', value).maybeSingle()
        : await query.eq('code', value).maybeSingle();
    if (error) return null;
    return data || null;
}

function rpcArgs(input) {
    return compactArgs({
        p_order_id: input.orderId,
        p_status: input.status,
        p_user_id: input.userId || null,
        p_pump_id: input.pumpId || null,
        p_amount_total: input.amountTotal == null ? null : input.amountTotal,
        p_currency: blankToNull(input.currency),
        p_plan_id: blankToNull(input.planId),
        p_gstin: blankToNull(input.gstin),
        p_billing_name: blankToNull(input.billingName),
        p_billing_email: blankToNull(input.billingEmail),
        p_billing_phone: blankToNull(input.billingPhone),
        p_cf_order_id: blankToNull(input.cfOrderId),
        p_cf_payment_id: blankToNull(input.cfPaymentId),
        p_payment_session_id: blankToNull(input.paymentSessionId),
        p_payment_method: blankToNull(input.paymentMethod),
        p_paid_at: input.paidAt || null,
    });
}

function mapRpcError(error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('not allowed')) return 'not_allowed';
    if (message.includes('invalid gstin')) return 'invalid_gstin';
    if (message.includes('does not match plan') || message.includes('does not belong')) return 'bad_request';
    if (message.includes('uuid')) return 'unknown_plan';
    if (message.includes('mismatch') || message.includes('required') || message.includes('immutable')) return 'bad_request';
    if (message.includes('paid order cannot change')) return 'already_paid';
    return 'save_failed';
}

async function savePaymentOrder(admin, input) {
    if (!admin) {
        const err = new Error('unavailable');
        err.reason = 'unavailable';
        throw err;
    }

    const plan = input.status === 'created' ? await loadPlan(admin, input.planId) : null;
    const payload = rpcArgs({
        ...input,
        planId: plan?.id || input.planId,
        amountTotal: plan ? money2(plan.price_total_inr) : input.amountTotal,
        currency: plan?.currency || input.currency,
    });

    if (input.status === 'created') {
        if (!payload.p_user_id || !payload.p_pump_id || !payload.p_plan_id || payload.p_amount_total == null || !wholeDays(plan?.duration_days)) {
            const err = new Error('unknown_plan');
            err.reason = 'unknown_plan';
            throw err;
        }
    }

    const { data, error } = await admin.rpc('save_payment_order', payload);
    if (error) {
        const err = new Error('save_failed');
        err.reason = mapRpcError(error);
        throw err;
    }
    const saved = Array.isArray(data) ? data[0] : data;
    return storeDurationDays(admin, saved, plan?.id || input.planId);
}

module.exports = { savePaymentOrder };
