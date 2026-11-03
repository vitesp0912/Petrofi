const { send, bearerToken, userClient, readJsonBody, isUuid } = require('../server/http');
const { recordError, sanitizePayload } = require('../server/error-log');

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 20;
const hits = new Map();

function clientKey(req, userId) {
    const forwarded = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '';
    const ip = String(Array.isArray(forwarded) ? forwarded[0] : forwarded)
        .split(',')[0]
        .trim()
        .slice(0, 80);
    return `${userId || 'anon'}:${ip || 'unknown'}`;
}

function rateLimited(key) {
    const now = Date.now();
    const row = hits.get(key) || { count: 0, start: now };
    if (now - row.start > RATE_WINDOW_MS) {
        hits.set(key, { count: 1, start: now });
        return false;
    }
    row.count += 1;
    hits.set(key, row);
    return row.count > RATE_MAX;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    let body;
    try {
        body = await readJsonBody(req);
    } catch {
        send(res, 400, { ok: false, reason: 'bad_request' });
        return;
    }

    let userId = null;
    const token = bearerToken(req);
    if (token) {
        try {
            const supabase = userClient(token);
            if (supabase) {
                const { data } = await supabase.auth.getUser(token);
                if (data?.user?.id) userId = data.user.id;
            }
        } catch {
            /* keep anonymous log */
        }
    }

    const key = clientKey(req, userId);
    if (rateLimited(key)) {
        send(res, 429, { ok: false, reason: 'too_fast' });
        return;
    }

    const message = String(body?.message || '').trim();
    if (!message || message.length > 16000) {
        send(res, 400, { ok: false, reason: 'bad_request' });
        return;
    }

    const pumpId = isUuid(body?.pumpId) ? body.pumpId : null;
    const result = await recordError({
        source: 'frontend',
        severity: body?.severity,
        module: body?.module,
        errorType: body?.errorType || 'client_error',
        message,
        stack: body?.stack,
        details: sanitizePayload(body?.details),
        userId: isUuid(body?.userId) && body.userId === userId ? body.userId : userId,
        pumpId,
        endpoint: body?.endpoint || 'client',
        httpMethod: body?.httpMethod || null,
        requestPayload: sanitizePayload(body?.requestPayload),
        responseStatus: body?.responseStatus,
        pageUrl: body?.pageUrl,
        userAgent: req.headers['user-agent'],
        correlationId: body?.correlationId,
        dedupeMinutes: 15,
    });

    if (!result.ok) {
        send(res, 503, { ok: false, reason: 'log_failed' });
        return;
    }

    send(res, 200, { ok: true, id: result.id, occurrenceCount: result.occurrenceCount });
};
