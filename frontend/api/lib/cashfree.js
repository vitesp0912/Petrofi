const crypto = require('crypto');

const API_VERSION = '2025-01-01';

function cashfreeConfig() {
    const appId = String(process.env.CASHFREE_APP_ID || '').trim();
    const secret = String(process.env.CASHFREE_SECRET_KEY || '').trim();
    const env = String(process.env.CASHFREE_ENV || 'sandbox').trim().toLowerCase();
    const production = env === 'production' || env === 'prod' || env === 'live';
    if (!appId || !secret) return null;
    return {
        appId,
        secret,
        production,
        mode: production ? 'production' : 'sandbox',
        baseUrl: production ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg',
    };
}

function paymentsReady() {
    return Boolean(cashfreeConfig() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function cashfreeRequest(path, { method = 'GET', body } = {}) {
    const cfg = cashfreeConfig();
    if (!cfg) {
        const error = new Error('payments_offline');
        error.reason = 'payments_offline';
        throw error;
    }
    const res = await fetch(`${cfg.baseUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-api-version': API_VERSION,
            'x-client-id': cfg.appId,
            'x-client-secret': cfg.secret,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { raw: text };
    }
    if (!res.ok) {
        const error = new Error('cashfree_error');
        error.reason = 'cashfree_error';
        error.status = res.status;
        error.data = data;
        throw error;
    }
    return data;
}

function createOrderId(planId) {
    const rand = crypto.randomBytes(4).toString('hex');
    const stamp = Date.now().toString(36);
    const plan = String(planId || 'plan').replace(/[^a-z0-9]/gi, '').slice(0, 12);
    return `pf_${plan}_${stamp}_${rand}`.slice(0, 45);
}

async function createCashfreeOrder({ orderId, amount, customer, returnUrl, notifyUrl, tags }) {
    const orderMeta = { return_url: returnUrl };
    if (notifyUrl) orderMeta.notify_url = notifyUrl;
    const body = {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        order_meta: orderMeta,
        customer_details: customer,
        order_note: 'PetroFI subscription',
    };
    if (tags && Object.keys(tags).length) body.order_tags = tags;
    return cashfreeRequest('/orders', {
        method: 'POST',
        body,
    });
}

async function getCashfreeOrder(orderId) {
    return cashfreeRequest(`/orders/${encodeURIComponent(orderId)}`);
}

function safeEqual(a, b) {
    const left = Buffer.from(String(a || ''), 'utf8');
    const right = Buffer.from(String(b || ''), 'utf8');
    if (left.length !== right.length) return false;
    return crypto.timingSafeEqual(left, right);
}

function verifyWebhookSignature(rawBody, timestamp, signature) {
    const cfg = cashfreeConfig();
    if (!cfg || !rawBody || !timestamp || !signature) return false;
    const ts = Number(timestamp);
    if (!Number.isFinite(ts)) return false;
    const ageMs = Math.abs(Date.now() - (ts < 1e12 ? ts * 1000 : ts));
    if (ageMs > 5 * 60 * 1000) return false;
    const expected = crypto.createHmac('sha256', cfg.secret).update(String(timestamp) + rawBody).digest('base64');
    return safeEqual(expected, signature);
}

function orderIsPaid(order) {
    const status = String(order?.order_status || '').toUpperCase();
    return status === 'PAID';
}

function amountsMatch(expectedRupees, received) {
    const left = Number(expectedRupees);
    const right = Number(received);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
    return Math.round(left) === Math.round(right);
}

module.exports = {
    cashfreeConfig,
    paymentsReady,
    createOrderId,
    createCashfreeOrder,
    getCashfreeOrder,
    verifyWebhookSignature,
    orderIsPaid,
    amountsMatch,
};
