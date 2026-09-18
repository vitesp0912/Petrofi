const { createClient } = require('@supabase/supabase-js');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUMP_COLUMNS = 'id, pump_code, name, city, state, owner_name, phone, email, registration_status, subscription_status, is_active, payment_verified, subscription_plan, subscription_start_date, subscription_end_date, billing_cycle';

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

function emptyPayload(profile) {
    return {
        ok: true,
        profile: profile
            ? { name: profile.name || null, role: profile.role || null }
            : null,
        pump: null,
        history: [],
    };
}

function mapPump(row) {
    return {
        code: row.pump_code || null,
        name: row.name || null,
        city: row.city || null,
        state: row.state || null,
        ownerName: row.owner_name || null,
        phone: row.phone || null,
        email: row.email || null,
        registrationStatus: row.registration_status || null,
        subscriptionStatus: row.subscription_status || null,
        active: row.is_active === true,
        paymentVerified: row.payment_verified === true,
        plan: row.subscription_plan || null,
        startDate: row.subscription_start_date || null,
        endDate: row.subscription_end_date || null,
        billingCycle: row.billing_cycle || null,
    };
}

function mapHistory(row) {
    return {
        plan: row.plan || null,
        status: row.status || null,
        startDate: row.start_date || null,
        endDate: row.end_date || null,
        amount: row.amount ?? null,
    };
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
        send(res, 503, { ok: false, reason: 'unavailable' });
        return;
    }

    const token = bearerToken(req);
    if (!token) {
        send(res, 401, { ok: false, reason: 'signed_out' });
        return;
    }

    const supabase = createClient(url, anonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: {
            headers: { Authorization: `Bearer ${token}` },
        },
    });

    try {
        const { data: authData, error: authError } = await supabase.auth.getUser(token);
        if (authError || !authData?.user) {
            send(res, 401, { ok: false, reason: 'signed_out' });
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('name, role, pump_id')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('[api/subscription] profile failed');
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        const pumpId = profile?.pump_id;
        if (!isUuid(pumpId)) {
            send(res, 200, emptyPayload(profile));
            return;
        }

        const [{ data: pumpRow, error: pumpError }, { data: history, error: historyError }] = await Promise.all([
            supabase
                .from('pumps')
                .select(PUMP_COLUMNS)
                .eq('id', pumpId)
                .maybeSingle(),
            supabase
                .from('subscriptions')
                .select('plan, status, start_date, end_date, amount')
                .eq('pump_id', pumpId)
                .order('start_date', { ascending: false })
                .limit(6),
        ]);

        if (pumpError) {
            console.error('[api/subscription] pump failed');
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        if (historyError) {
            console.error('[api/subscription] history skipped');
        }

        const pump = pumpRow && pumpRow.id === pumpId ? mapPump(pumpRow) : null;

        send(res, 200, {
            ok: true,
            profile: profile
                ? { name: profile.name || null, role: profile.role || null }
                : null,
            pump,
            history: pump && !historyError ? (history || []).map(mapHistory) : [],
        });
    } catch (err) {
        console.error('[api/subscription]', err.message);
        send(res, 500, { ok: false, reason: 'load_failed' });
    }
};
