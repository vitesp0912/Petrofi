const crypto = require('crypto');
const { adminClient, isUuid } = require('./http');

const SENSITIVE_KEY =
    /(pass(word)?|secret|token|authorization|cookie|api[_-]?key|refresh|session|bearer|otp|cvv|card|private|smtp|service[_-]?role)/i;

const MODULES = new Set([
    'authentication',
    'dashboard',
    'reports',
    'subscriptions',
    'payments',
    'pump_management',
    'demo',
    'legal',
    'general',
]);

const SOURCES = new Set(['frontend', 'backend', 'database', 'api']);
const SEVERITIES = new Set(['warning', 'error', 'critical']);

function clip(value, max) {
    if (value == null) return null;
    const text = String(value);
    return text.length > max ? text.slice(0, max) : text;
}

function environmentName() {
    const vercel = String(process.env.VERCEL_ENV || '').trim();
    if (vercel) return vercel;
    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

function looksSecret(value) {
    const text = String(value || '');
    if (text.length > 40 && /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(text)) return true;
    if (/^Bearer\s+/i.test(text)) return true;
    return false;
}

function sanitizeValue(value, depth = 0) {
    if (value == null) return value;
    if (depth > 6) return '[truncated]';
    if (typeof value === 'string') {
        if (looksSecret(value)) return '[redacted]';
        return clip(value, 4000);
    }
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
        return value.slice(0, 50).map((item) => sanitizeValue(item, depth + 1));
    }
    if (typeof value === 'object') {
        const out = {};
        for (const [key, nested] of Object.entries(value)) {
            if (SENSITIVE_KEY.test(key)) {
                out[key] = '[redacted]';
                continue;
            }
            out[key] = sanitizeValue(nested, depth + 1);
        }
        return out;
    }
    return clip(value, 400);
}

function sanitizePayload(payload) {
    if (payload == null) return null;
    if (typeof payload === 'string') {
        try {
            return sanitizeValue(JSON.parse(payload));
        } catch {
            return { raw: clip(payload, 2000) };
        }
    }
    return sanitizeValue(payload);
}

function normalizeModule(moduleName) {
    const key = String(moduleName || 'general').trim().toLowerCase();
    return MODULES.has(key) ? key : 'general';
}

function normalizeSource(source) {
    const key = String(source || 'backend').trim().toLowerCase();
    return SOURCES.has(key) ? key : 'backend';
}

function normalizeSeverity(severity) {
    const key = String(severity || 'error').trim().toLowerCase();
    return SEVERITIES.has(key) ? key : 'error';
}

function errorFields(err) {
    if (!err) return { message: 'unknown error', stack: null, details: {} };
    if (typeof err === 'string') return { message: err, stack: null, details: {} };
    const details = {};
    if (err.reason) details.reason = err.reason;
    if (err.code) details.code = err.code;
    if (err.status) details.status = err.status;
    if (err.data != null) details.data = sanitizeValue(err.data);
    if (err.details != null) details.details = sanitizeValue(err.details);
    return {
        message: clip(err.message || err.reason || 'unknown error', 16000) || 'unknown error',
        stack: clip(err.stack || null, 64000),
        details,
    };
}

function fingerprintOf(parts) {
    const basis = [
        parts.source,
        parts.module,
        parts.errorType,
        String(parts.message || '').slice(0, 500),
        parts.endpoint || '',
        parts.userId || '',
        parts.pumpId || '',
    ].join('|');
    return crypto.createHash('sha256').update(basis).digest('hex');
}

function pathnameOf(req) {
    try {
        return String(req.url || req.originalUrl || '').split('?')[0] || null;
    } catch {
        return null;
    }
}

function correlationFrom(req, explicit) {
    if (explicit) return clip(explicit, 120);
    const header =
        req?.headers?.['x-request-id'] ||
        req?.headers?.['x-correlation-id'] ||
        req?.headers?.['x-vercel-id'];
    if (header) return clip(Array.isArray(header) ? header[0] : header, 120);
    return crypto.randomUUID();
}

function fromRequest(req, extras = {}) {
    const userAgent = req?.headers?.['user-agent'];
    return {
        endpoint: extras.endpoint || pathnameOf(req),
        httpMethod: extras.httpMethod || req?.method || null,
        userAgent: userAgent ? clip(Array.isArray(userAgent) ? userAgent[0] : userAgent, 512) : null,
        correlationId: correlationFrom(req, extras.correlationId),
        userId: extras.userId || null,
        pumpId: extras.pumpId || null,
        requestPayload: extras.requestPayload,
    };
}

async function recordError(input = {}) {
    try {
        const admin = adminClient();
        if (!admin) return { ok: false, reason: 'unavailable' };

        const parsed = errorFields(input.error);
        const source = normalizeSource(input.source);
        const severity = normalizeSeverity(input.severity);
        const moduleName = normalizeModule(input.module);
        const errorType = clip(input.errorType || input.reason || parsed.details.reason || 'unknown', 120) || 'unknown';
        const message = clip(input.message || parsed.message, 16000) || 'unknown error';
        const stack = clip(input.stack || parsed.stack, 64000);
        const details = sanitizeValue({
            ...parsed.details,
            ...(input.details && typeof input.details === 'object' ? input.details : {}),
        });
        const userId = isUuid(input.userId) ? input.userId : null;
        const pumpId = isUuid(input.pumpId) ? input.pumpId : null;
        const endpoint = clip(input.endpoint, 500);
        const fingerprint =
            clip(input.fingerprint, 128) ||
            fingerprintOf({
                source,
                module: moduleName,
                errorType,
                message,
                endpoint,
                userId,
                pumpId,
            });

        const { data, error } = await admin.rpc('upsert_error_log', {
            p_fingerprint: fingerprint,
            p_source: source,
            p_severity: severity,
            p_module: moduleName,
            p_error_type: errorType,
            p_message: message,
            p_stack: stack,
            p_details: details || {},
            p_user_id: userId,
            p_pump_id: pumpId,
            p_endpoint: endpoint,
            p_http_method: clip(input.httpMethod, 16),
            p_request_payload: sanitizePayload(input.requestPayload),
            p_response_status:
                input.responseStatus == null || Number.isNaN(Number(input.responseStatus))
                    ? null
                    : Number(input.responseStatus),
            p_page_url: clip(input.pageUrl, 1000),
            p_user_agent: clip(input.userAgent, 512),
            p_environment: clip(input.environment || environmentName(), 40),
            p_correlation_id: clip(input.correlationId, 120),
            p_dedupe_minutes: Number.isFinite(Number(input.dedupeMinutes))
                ? Math.max(1, Number(input.dedupeMinutes))
                : 15,
        });

        if (error) return { ok: false, reason: error.message || 'log_failed' };
        return { ok: true, id: data?.id || null, occurrenceCount: data?.occurrence_count || 1 };
    } catch (err) {
        return { ok: false, reason: err?.message || 'log_failed' };
    }
}

function logQuietly(input) {
    return recordError(input).catch(() => ({ ok: false }));
}

module.exports = {
    recordError,
    logQuietly,
    fromRequest,
    sanitizePayload,
    sanitizeValue,
    fingerprintOf,
    normalizeModule,
    normalizeSource,
    normalizeSeverity,
};
