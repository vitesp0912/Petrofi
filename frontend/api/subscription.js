const { send, requireUser, isUuid, adminClient } = require('../server/http');
const { logQuietly, fromRequest } = require('../server/error-log');

const PUMP_COLUMNS =
    'id, pump_code, name, city, state, address, pincode, owner_name, phone, email, registration_status';
const SUB_COLUMNS = 'id, plan_id, status, start_date, end_date, created_at';

function emptyPayload(profile) {
    return {
        ok: true,
        profile: profile ? { name: profile.name || null, role: profile.role || null } : null,
        pump: null,
        subscription: null,
    };
}

function mapPump(row) {
    return {
        id: row.id || null,
        code: row.pump_code || null,
        name: row.name || null,
        city: row.city || null,
        state: row.state || null,
        address: row.address || null,
        pincode: row.pincode || null,
        ownerName: row.owner_name || null,
        phone: row.phone || null,
        email: row.email || null,
        registrationStatus: row.registration_status || null,
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
        planCode: plan?.code || null,
        days: plan?.duration_days != null ? Number(plan.duration_days) : null,
        months: plan?.duration_months != null ? Number(plan.duration_months) : null,
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
    const { data, error } = await admin
        .from('plans')
        .select('id, name, code, duration_days, duration_months')
        .in('id', ids);
    if (error) {
        return {};
    }
    return Object.fromEntries((data || []).map((row) => [row.id, row]));
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
            logQuietly({
                ...fromRequest(req, { userId: auth.user.id }),
                source: 'database',
                severity: 'error',
                module: 'subscriptions',
                errorType: 'profile_load_failed',
                message: profileError.message || 'load_failed',
                details: { code: profileError.code, reason: 'load_failed' },
                responseStatus: 500,
            });
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
            logQuietly({
                ...fromRequest(req, { userId: auth.user.id, pumpId }),
                source: 'database',
                severity: 'error',
                module: 'subscriptions',
                errorType: 'pump_load_failed',
                message: pumpError.message || 'load_failed',
                details: { code: pumpError.code, reason: 'load_failed' },
                responseStatus: 500,
            });
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        if (subError) {
            logQuietly({
                ...fromRequest(req, { userId: auth.user.id, pumpId }),
                source: 'database',
                severity: 'error',
                module: 'subscriptions',
                errorType: 'subscription_load_failed',
                message: subError.message || 'load_failed',
                details: { code: subError.code, reason: 'load_failed' },
                responseStatus: 500,
            });
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        const pump = pumpRow && pumpRow.id === pumpId ? mapPump(pumpRow) : null;
        const rows = pump ? subRows || [] : [];
        const current = pickCurrent(rows);
        const names = await planNameMap(current?.plan_id ? [current.plan_id] : []);

        send(res, 200, {
            ok: true,
            profile: profile ? { name: profile.name || null, role: profile.role || null } : null,
            pump,
            subscription: current ? mapSubscription(current, names[current.plan_id]) : null,
        });
    } catch (err) {
        logQuietly({
            ...fromRequest(req),
            source: 'api',
            severity: 'error',
            module: 'subscriptions',
            errorType: 'subscription_unhandled',
            error: err,
            responseStatus: 500,
        });
        send(res, 500, { ok: false, reason: 'load_failed' });
    }
};
