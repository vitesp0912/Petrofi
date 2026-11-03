import { supabase } from './supabase';

const SENSITIVE_KEY =
    /(pass(word)?|secret|token|authorization|cookie|api[_-]?key|refresh|session|bearer|otp|cvv|card|private)/i;

const recent = new Map();
let handlersInstalled = false;
let contextGetter = () => ({});

function clip(value, max) {
    if (value == null) return null;
    const text = String(value);
    return text.length > max ? text.slice(0, max) : text;
}

function sanitizeValue(value, depth = 0) {
    if (value == null) return value;
    if (depth > 5) return '[truncated]';
    if (typeof value === 'string') return clip(value, 2000);
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.slice(0, 30).map((item) => sanitizeValue(item, depth + 1));
    if (typeof value === 'object') {
        const out = {};
        for (const [key, nested] of Object.entries(value)) {
            out[key] = SENSITIVE_KEY.test(key) ? '[redacted]' : sanitizeValue(nested, depth + 1);
        }
        return out;
    }
    return clip(value, 200);
}

function fingerprintKey(input) {
    return [
        input.module || 'general',
        input.errorType || 'client_error',
        String(input.message || '').slice(0, 240),
        input.endpoint || '',
    ].join('|');
}

function shouldSkip(input) {
    const key = fingerprintKey(input);
    const now = Date.now();
    const last = recent.get(key) || 0;
    if (now - last < 15_000) return true;
    recent.set(key, now);
    if (recent.size > 200) {
        for (const [entryKey, ts] of recent) {
            if (now - ts > 60_000) recent.delete(entryKey);
        }
    }
    return false;
}

async function authHeader() {
    if (!supabase) return {};
    try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
}

export function setErrorLogContext(getter) {
    contextGetter = typeof getter === 'function' ? getter : () => ({});
}

export async function reportClientError(input = {}) {
    try {
        const ctx = contextGetter() || {};
        const payload = {
            module: input.module || 'general',
            severity: input.severity || 'error',
            errorType: input.errorType || 'client_error',
            message: clip(input.message || input.error?.message || 'client error', 16000),
            stack: clip(input.stack || input.error?.stack || null, 64000),
            details: sanitizeValue({
                ...(input.details || {}),
                name: input.error?.name || undefined,
            }),
            userId: input.userId || ctx.userId || null,
            pumpId: input.pumpId || ctx.pumpId || null,
            endpoint: input.endpoint || (typeof window !== 'undefined' ? window.location?.pathname : null),
            httpMethod: input.httpMethod || null,
            requestPayload: sanitizeValue(input.requestPayload),
            responseStatus: input.responseStatus ?? null,
            pageUrl: typeof window !== 'undefined' ? clip(window.location?.href, 1000) : null,
            correlationId: input.correlationId || null,
        };

        if (!payload.message || shouldSkip(payload)) return { ok: false, reason: 'skipped' };

        const headers = {
            'Content-Type': 'application/json',
            ...(await authHeader()),
        };
        const res = await fetch('/api/error-log', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            keepalive: true,
        });
        if (!res.ok) return { ok: false, reason: 'log_failed' };
        return { ok: true };
    } catch {
        return { ok: false, reason: 'log_failed' };
    }
}

export function reportClientErrorQuiet(input) {
    void reportClientError(input);
}

export function installGlobalErrorHandlers() {
    if (typeof window === 'undefined' || handlersInstalled) return;
    handlersInstalled = true;

    window.addEventListener('error', (event) => {
        const err = event?.error;
        reportClientErrorQuiet({
            module: 'general',
            severity: 'error',
            errorType: 'uncaught_error',
            message: err?.message || event?.message || 'uncaught error',
            stack: err?.stack || null,
            details: {
                filename: event?.filename || null,
                lineno: event?.lineno || null,
                colno: event?.colno || null,
            },
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event?.reason;
        const message =
            typeof reason === 'string'
                ? reason
                : reason?.message || 'unhandled promise rejection';
        reportClientErrorQuiet({
            module: 'general',
            severity: 'error',
            errorType: 'unhandled_rejection',
            message,
            stack: reason?.stack || null,
            details: sanitizeValue({ reason }),
        });
    });
}
