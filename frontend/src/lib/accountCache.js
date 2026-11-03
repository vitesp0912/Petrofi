/**
 * In-memory account cache only.
 * - Never writes to localStorage / sessionStorage / IndexedDB.
 * - Bound to the signed-in user id; cleared on logout or user switch.
 * - Safe for tab switches inside the SPA; gone on full page reload (by design).
 */

let ownerUserId = null;
let subscriptionEntry = null;
let plansEntry = null;
let ordersEntry = null;

const SOFT_TTL_MS = 45 * 1000;

function isFresh(entry) {
    if (!entry?.at) return false;
    return Date.now() - entry.at < SOFT_TTL_MS;
}

export function clearAccountCache() {
    ownerUserId = null;
    subscriptionEntry = null;
    plansEntry = null;
    ordersEntry = null;
}

export function bindAccountCacheUser(userId) {
    const next = userId ? String(userId) : null;
    if (!next) {
        clearAccountCache();
        return null;
    }
    if (ownerUserId && ownerUserId !== next) {
        clearAccountCache();
    }
    ownerUserId = next;
    return ownerUserId;
}

function owned(userId) {
    return Boolean(userId && ownerUserId && ownerUserId === String(userId));
}

export function getCachedSubscription(userId) {
    if (!owned(userId) || !subscriptionEntry?.data) return null;
    return {
        data: subscriptionEntry.data,
        fresh: isFresh(subscriptionEntry),
    };
}

export function setCachedSubscription(userId, data) {
    if (!bindAccountCacheUser(userId) || !data?.ok) return;
    subscriptionEntry = { at: Date.now(), data };
}

export function getCachedPlans(userId) {
    if (!owned(userId) || !plansEntry?.data) return null;
    return {
        data: plansEntry.data,
        fresh: isFresh(plansEntry),
    };
}

export function setCachedPlans(userId, data) {
    if (!bindAccountCacheUser(userId) || !data?.ok) return;
    plansEntry = { at: Date.now(), data };
}

export function getCachedOrders(userId) {
    if (!owned(userId) || !ordersEntry?.data) return null;
    return {
        data: ordersEntry.data,
        fresh: isFresh(ordersEntry),
    };
}

export function setCachedOrders(userId, data) {
    if (!bindAccountCacheUser(userId) || !data?.ok) return;
    ordersEntry = { at: Date.now(), data };
}

export function invalidateOrdersCache() {
    ordersEntry = null;
}

export function invalidateSubscriptionCache() {
    subscriptionEntry = null;
}

export function invalidateAccountDataCaches() {
    subscriptionEntry = null;
    plansEntry = null;
    ordersEntry = null;
}
