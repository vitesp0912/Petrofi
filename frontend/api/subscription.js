const { send, requireUser, isUuid, adminClient } = require('../server/http');

const PUMP_COLUMNS =
    'id, pump_code, name, city, state, owner_name, phone, email, registration_status, is_active';
const SUB_COLUMNS = 'id, plan_id, status, start_date, end_date, created_at';

function emptyPayload(profile) {
    return {
        ok: true,
        profile: profile ? { name: profile.name || null, role: profile.role || null } : null,
        pump: null,
        subscription: null,
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
        active: row.is_active === true,
    };
}

function daysUntil(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

function remainingLabel(remaining) {
    if (remaining == null) return 'Not set';
    if (remaining > 1) return `${remaining} days left`;
    if (remaining === 1) return '1 day left';
    if (remaining === 0) return 'Ends today';
    if (remaining === -1) return '1 day overdue';
    return `${Math.abs(remaining)} days overdue`;
}

function mapSubscription(row, plan) {
    if (!row) return null;
    const remainingDays = daysUntil(row.end_date);
    return {
        status: row.status || null,
        planName: plan?.name || null,
        startDate: row.start_date || null,
        endDate: row.end_date || null,
        remainingDays,
        timeLeft: remainingLabel(remainingDays),
    };
}

function pickCurrent(rows) {
    if (!rows?.length) return null;
    return [...rows].sort((a, b) => {
        const aActive = String(a.status || '').toLowerCase() === 'active' ? 1 : 0;
        const bActive = String(b.status || '').toLowerCase() === 'active' ? 1 : 0;
        if (bActive !== aActive) return bActive - aActive;
        const end = new Date(b.end_date || 0).getTime() - new Date(a.end_date || 0).getTime();
        if (end) return end;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })[0];
}

async function planNameMap(planIds) {
    const ids = [...new Set((planIds || []).filter((id) => isUuid(id)))];
    if (!ids.length) return {};
    const admin = adminClient();
    if (!admin) return {};
    const { data, error } = await admin.from('plans').select('id, name').in('id', ids);
    if (error) {
        console.error('[api/subscription] plans lookup failed', error.code, error.message);
        return {};
    }
    return Object.fromEntries((data || []).map((row) => [row.id, { name: row.name }]));
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    try {
        const auth = await requireUser(req, res);
        if (!auth) return;

        const admin = adminClient();
        if (!admin) {
            send(res, 503, { ok: false, reason: 'unavailable' });
            return;
        }

        const { data: profile, error: profileError } = await admin
            .from('users')
            .select('name, role, pump_id')
            .eq('id', auth.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('[api/subscription] profile failed', profileError.code, profileError.message);
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        const pumpId = profile?.pump_id;
        if (!isUuid(pumpId)) {
            send(res, 200, emptyPayload(profile));
            return;
        }

        const [{ data: pumpRow, error: pumpError }, { data: subRows, error: subError }] = await Promise.all([
            admin.from('pumps').select(PUMP_COLUMNS).eq('id', pumpId).maybeSingle(),
            admin
                .from('subscriptions')
                .select(SUB_COLUMNS)
                .eq('pump_id', pumpId)
                .order('created_at', { ascending: false })
                .limit(8),
        ]);

        if (pumpError) {
            console.error('[api/subscription] pump failed', pumpError.code, pumpError.message);
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        if (subError) {
            console.error('[api/subscription] subscriptions failed', subError.code, subError.message);
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        const pump = pumpRow && pumpRow.id === pumpId ? mapPump(pumpRow) : null;
        const rows = pump ? subRows || [] : [];
        const names = await planNameMap(rows.map((row) => row.plan_id));
        const current = pickCurrent(rows);
        const history = rows.map((row) => mapSubscription(row, names[row.plan_id]));

        send(res, 200, {
            ok: true,
            profile: profile ? { name: profile.name || null, role: profile.role || null } : null,
            pump,
            subscription: current ? mapSubscription(current, names[current.plan_id]) : null,
            history,
        });
    } catch (err) {
        console.error('[api/subscription]', err.message);
        send(res, 500, { ok: false, reason: 'load_failed' });
    }
};
