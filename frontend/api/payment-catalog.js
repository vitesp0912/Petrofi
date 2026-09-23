const { send, requireUser, isUuid } = require('./lib/http');
const { listQuotes } = require('./lib/catalog');
const { paymentsReady } = require('./lib/cashfree');
const { buyerFrom, indianMobile } = require('./lib/buyer');

const PUMP_COLUMNS = 'id, pump_code, name, owner_name, phone, email';

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    try {
        const auth = await requireUser(req, res);
        if (!auth) return;

        const ready = paymentsReady();
        const { data: profile, error: profileError } = await auth.supabase
            .from('users')
            .select('name, role, pump_id')
            .eq('id', auth.user.id)
            .maybeSingle();

        if (profileError) {
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        let pump = null;
        if (isUuid(profile?.pump_id)) {
            const { data: pumpRow } = await auth.supabase
                .from('pumps')
                .select(PUMP_COLUMNS)
                .eq('id', profile.pump_id)
                .maybeSingle();
            if (pumpRow && pumpRow.id === profile.pump_id) pump = pumpRow;
        }

        const buyer = buyerFrom(auth.user, profile, pump);
        const quotes = await listQuotes();
        send(res, 200, {
            ok: true,
            ready,
            quotes,
            buyer: {
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone || indianMobile(auth.user.phone),
                pumpName: buyer.pumpName,
                pumpCode: buyer.pumpCode,
                hasPump: Boolean(pump),
            },
        });
    } catch (err) {
        console.error('[payments] catalog', err.message);
        send(res, 500, { ok: false, reason: 'load_failed' });
    }
};
