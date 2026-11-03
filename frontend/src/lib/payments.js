import { supabase } from './supabase';
import { reportClientErrorQuiet } from './errorLog';

const LOG_REASONS = new Set([
    'unavailable',
    'cashfree_error',
    'consent_failed',
    'create_failed',
    'load_failed',
    'save_failed',
    'fulfill_failed',
    'payments_offline',
]);

function authHeader() {
    return supabase.auth.getSession().then(({ data }) => {
        const token = data?.session?.access_token;
        if (!token) return null;
        return { Authorization: `Bearer ${token}` };
    });
}

function logPaymentFailure(errorType, reason, details = {}) {
    if (!reason || reason === 'signed_out' || !LOG_REASONS.has(reason)) return;
    reportClientErrorQuiet({
        module: 'payments',
        severity: reason === 'cashfree_error' || reason === 'fulfill_failed' ? 'critical' : 'error',
        errorType,
        message: `Payment client failure: ${reason}`,
        details: { reason, ...details },
        endpoint: details.endpoint || null,
        httpMethod: details.httpMethod || null,
        responseStatus: details.responseStatus || null,
    });
}

async function readJson(res) {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return { ok: false, reason: 'unavailable', responseStatus: res.status };
    }
    const body = await res.json().catch(() => ({ ok: false, reason: 'unavailable' }));
    if (body && typeof body === 'object') body.responseStatus = res.status;
    return body;
}

export async function fetchPaymentCatalog(scope = 'plans') {
    const headers = await authHeader();
    if (!headers) return { ok: false, reason: 'signed_out' };
    try {
        const query = scope === 'orders' ? '?scope=orders' : '?scope=plans';
        const res = await fetch(`/api/payment-catalog${query}`, { headers });
        const body = await readJson(res);
        if (!body?.ok && (body?.reason === 'unavailable' || !res.headers.get('content-type')?.includes('application/json'))) {
            logPaymentFailure('payment_catalog_failed', body?.reason || 'unavailable', {
                endpoint: '/api/payment-catalog',
                httpMethod: 'GET',
                responseStatus: body?.responseStatus || res.status,
                scope,
            });
        }
        return body;
    } catch (err) {
        logPaymentFailure('payment_catalog_network', 'unavailable', {
            endpoint: '/api/payment-catalog',
            httpMethod: 'GET',
            message: err?.message,
        });
        return { ok: false, reason: 'unavailable' };
    }
}

export async function createPaymentOrder({ planId, gstin, hasGst, phone, name, email, pumpName, address, acceptRefundPolicy }) {
    const headers = await authHeader();
    if (!headers) return { ok: false, reason: 'signed_out' };
    try {
        const res = await fetch('/api/payment-create-order', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, gstin, hasGst, phone, name, email, pumpName, address, acceptRefundPolicy }),
        });
        const body = await readJson(res);
        if (!body?.ok && body?.reason === 'unavailable') {
            logPaymentFailure('payment_create_failed', 'unavailable', {
                endpoint: '/api/payment-create-order',
                httpMethod: 'POST',
                responseStatus: body?.responseStatus || res.status,
                planId,
            });
        }
        return body;
    } catch (err) {
        logPaymentFailure('payment_create_network', 'unavailable', {
            endpoint: '/api/payment-create-order',
            httpMethod: 'POST',
            message: err?.message,
            planId,
        });
        return { ok: false, reason: 'unavailable' };
    }
}

export async function savePaymentStatus(orderId, status) {
    const headers = await authHeader();
    if (!headers) return { ok: false, reason: 'signed_out' };
    try {
        const res = await fetch('/api/payment-save', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status }),
        });
        return readJson(res);
    } catch {
        return { ok: false, reason: 'unavailable' };
    }
}

export async function fetchPaymentStatus(orderId) {
    const headers = await authHeader();
    if (!headers) return { ok: false, reason: 'signed_out' };
    try {
        const res = await fetch(`/api/payment-status?order_id=${encodeURIComponent(orderId)}`, { headers });
        const body = await readJson(res);
        if (!body?.ok && body?.reason === 'unavailable') {
            logPaymentFailure('payment_status_failed', 'unavailable', {
                endpoint: '/api/payment-status',
                httpMethod: 'GET',
                responseStatus: body?.responseStatus || res.status,
                orderId,
            });
        }
        return body;
    } catch (err) {
        logPaymentFailure('payment_status_network', 'unavailable', {
            endpoint: '/api/payment-status',
            httpMethod: 'GET',
            message: err?.message,
            orderId,
        });
        return { ok: false, reason: 'unavailable' };
    }
}

export function paymentErrorText(reason) {
    if (reason === 'payments_offline') return 'Pay is not open yet. Call PetroFI and we will take this on the pump.';
    if (reason === 'unknown_plan') return 'Pick a plan to continue.';
    if (reason === 'invalid_gstin') return 'Enter a valid 15-character GSTIN.';
    if (reason === 'invalid_email') return 'Enter a valid email address.';
    if (reason === 'no_pump') return 'No pump is linked to this login yet.';
    if (reason === 'phone_required') return 'Add a 10-digit mobile number to pay.';
    if (reason === 'refund_policy_required') return 'Accept the Refund and Cancellation Policy to pay.';
    if (reason === 'consent_failed') return 'We could not record your acceptance of the Refund and Cancellation Policy. Try again.';
    if (reason === 'too_fast') return 'Wait a few seconds and try again.';
    if (reason === 'cashfree_error') return 'We could not start this payment. Try again.';
    if (reason === 'signed_out') return 'Sign in again to pay.';
    return 'We could not start this payment. Try again.';
}

let cashfreeLoader = null;

export function loadCashfreeSdk() {
    if (typeof window !== 'undefined' && typeof window.Cashfree === 'function') {
        return Promise.resolve(window.Cashfree);
    }
    if (cashfreeLoader) return cashfreeLoader;
    cashfreeLoader = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        script.onload = () => {
            if (typeof window.Cashfree === 'function') {
                resolve(window.Cashfree);
                return;
            }
            cashfreeLoader = null;
            reject(new Error('checkout_unavailable'));
        };
        script.onerror = () => {
            cashfreeLoader = null;
            reject(new Error('checkout_unavailable'));
        };
        document.head.appendChild(script);
    });
    return cashfreeLoader;
}

function checkoutFail(reason, detail) {
    const err = new Error(reason);
    err.reason = reason;
    if (detail) err.detail = String(detail).slice(0, 180);
    return err;
}

export async function startHostedCheckout(created) {
    const sessionId = String(created?.paymentSessionId || '').trim();
    if (!sessionId) throw checkoutFail('checkout_no_session');

    let Checkout;
    try {
        Checkout = await loadCashfreeSdk();
    } catch {
        throw checkoutFail('checkout_unavailable');
    }

    const mode = created.mode === 'production' ? 'production' : 'sandbox';
    let client;
    try {
        client = Checkout({ mode });
    } catch (err) {
        throw checkoutFail('checkout_init_failed', err?.message);
    }

    let result;
    try {
        result = await client.checkout({
            paymentSessionId: sessionId,
            redirectTarget: '_self',
        });
    } catch (err) {
        throw checkoutFail('checkout_open_failed', err?.message || err?.code);
    }

    if (result?.error) {
        const detail = result.error.message || result.error.code || result.error;
        throw checkoutFail('checkout_open_failed', detail);
    }
}

export function checkoutErrorText(err) {
    const reason = err?.reason || '';
    if (reason === 'checkout_unavailable') {
        return 'Cashfree could not load in this browser. Allow sdk.cashfree.com, or turn off blockers, then try again.';
    }
    if (reason === 'checkout_no_session') {
        return 'Payment was created but the checkout session was missing. Try again.';
    }
    if (reason === 'checkout_init_failed' || reason === 'checkout_open_failed') {
        if (err?.detail) return `Payment page could not open: ${err.detail}`;
        return 'The payment page could not open. Confirm this site domain is allowed in Cashfree, then try again.';
    }
    return 'The payment page could not open. Try again.';
}
