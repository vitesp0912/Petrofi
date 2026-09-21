const { createClient } = require('@supabase/supabase-js');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function send(res, status, body) {
    const payload = JSON.stringify(body);
    if (typeof res.setHeader === 'function') {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    if (typeof res.status === 'function' && typeof res.json === 'function') {
        res.status(status).json(body);
        return;
    }
    res.statusCode = status;
    res.end(payload);
}

function bearerToken(req) {
    const header = String(req.headers.authorization || '');
    const match = /^Bearer\s+(\S+)/i.exec(header);
    return match ? match[1] : null;
}

function isUuid(value) {
    return typeof value === 'string' && UUID_RE.test(value);
}

function supabaseUrl() {
    return process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
}

function anonKey() {
    return process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
}

function serviceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function userClient(token) {
    const url = supabaseUrl();
    const key = anonKey();
    if (!url || !key) return null;
    return createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: {
            headers: { Authorization: `Bearer ${token}` },
        },
    });
}

function adminClient() {
    const url = supabaseUrl();
    const key = serviceRoleKey();
    if (!url || !key) return null;
    return createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
}

async function requireUser(req, res) {
    const token = bearerToken(req);
    if (!token) {
        send(res, 401, { ok: false, reason: 'signed_out' });
        return null;
    }
    const supabase = userClient(token);
    if (!supabase) {
        send(res, 503, { ok: false, reason: 'unavailable' });
        return null;
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
        send(res, 401, { ok: false, reason: 'signed_out' });
        return null;
    }
    return { supabase, user: data.user, token };
}

function publicSiteUrl() {
    const raw = process.env.PUBLIC_SITE_URL || process.env.REACT_APP_SITE_URL || 'https://www.petrofi.in';
    return String(raw).replace(/\/$/, '');
}

function readJsonBody(req) {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return Promise.resolve(req.body);
    }
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (chunk) => {
            raw += chunk;
            if (raw.length > 20 * 1024) {
                req.destroy();
                reject(new Error('payload too large'));
            }
        });
        req.on('end', () => {
            if (!raw) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(raw));
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

module.exports = {
    send,
    bearerToken,
    isUuid,
    userClient,
    adminClient,
    requireUser,
    publicSiteUrl,
    readJsonBody,
    supabaseUrl,
    anonKey,
    serviceRoleKey,
};
