import { supabase } from './supabase';

function authHeader() {
    return supabase.auth.getSession().then(({ data }) => {
        const token = data?.session?.access_token;
        if (!token) return null;
        return { Authorization: `Bearer ${token}` };
    });
}

async function readJson(res) {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return { ok: false, reason: 'unavailable' };
    }
    return res.json().catch(() => ({ ok: false, reason: 'unavailable' }));
}

export async function fetchPaymentCatalog() {
    const headers = await authHeader();
    if (!headers) return { ok: false, reason: 'signed_out' };
    try {
        const res = await fetch('/api/payment-catalog', { headers });
        return readJson(res);
    } catch {
        return { ok: false, reason: 'unavailable' };
    }
}

export async function createPaymentOrder({ planId, gstin, phone }) {
    const headers = await authHeader();
    if (!headers) return { ok: false, reason: 'signed_out' };
    try {
        const res = await fetch('/api/payment-create-order', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, gstin, phone }),
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
        return readJson(res);
    } catch {
        return { ok: false, reason: 'unavailable' };
    }
}

export function paymentErrorText(reason) {
    if (reason === 'payments_offline') return 'Pay is not open yet. Call PetroFI and we will take this on the pump.';
    if (reason === 'unknown_plan') return 'Pick a plan to continue.';
    if (reason === 'invalid_gstin') return 'Enter a valid 15-character GSTIN, or leave it blank.';
    if (reason === 'no_pump') return 'No pump is linked to this login yet.';
    if (reason === 'phone_required') return 'Add a 10-digit mobile number to pay.';
    if (reason === 'too_fast') return 'Wait a few seconds and try again.';
    if (reason === 'cashfree_error') return 'Cashfree could not start this payment. Try again.';
    if (reason === 'signed_out') return 'Sign in again to pay.';
    return 'We could not start this payment. Try again.';
}

let cashfreeLoader = null;

export function loadCashfreeSdk() {
    if (window.Cashfree) return Promise.resolve(window.Cashfree);
    if (cashfreeLoader) return cashfreeLoader;
    cashfreeLoader = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        script.onload = () => {
            if (window.Cashfree) resolve(window.Cashfree);
            else reject(new Error('checkout_unavailable'));
        };
        script.onerror = () => {
            cashfreeLoader = null;
            reject(new Error('checkout_unavailable'));
        };
        document.head.appendChild(script);
    });
    return cashfreeLoader;
}
