const { send, requireUser, isUuid, publicSiteUrl, readJsonBody, adminClient } = require('../server/http');
const { listQuotes, quoteById } = require('../server/catalog');
const { paymentsReady, cashfreeConfig, createOrderId, createCashfreeOrder } = require('../server/cashfree');
const { buyerFrom, cashfreeCustomer, normalizeGstin, indianMobile } = require('../server/buyer');
const { savePaymentOrder } = require('../server/save-payment-order');

const PUMP_COLUMNS = 'id, pump_code, name, owner_name, phone, email, subscription_end_date';
const RATE_LIMIT_MS = 20 * 1000;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        send(res, 405, { ok: false, reason: 'method_not_allowed' });
        return;
    }

    if (!paymentsReady()) {
        send(res, 503, { ok: false, reason: 'payments_offline' });
        return;
    }

    try {
        const auth = await requireUser(req, res);
        if (!auth) return;

        let body;
        try {
            body = await readJsonBody(req);
        } catch {
            send(res, 400, { ok: false, reason: 'bad_request' });
            return;
        }

        const planId = String(body?.planId || '').trim();
        let quote;
        try {
            quote = await quoteById(planId);
        } catch (err) {
            send(res, 500, { ok: false, reason: err.reason || 'load_failed' });
            return;
        }
        if (!quote) {
            send(res, 400, { ok: false, reason: 'unknown_plan' });
            return;
        }

        const gstin = normalizeGstin(body?.gstin);
        if (gstin === null) {
            send(res, 400, { ok: false, reason: 'invalid_gstin' });
            return;
        }

        const admin = adminClient();
        if (!admin) {
            send(res, 503, { ok: false, reason: 'payments_offline' });
            return;
        }

        const { data: profile, error: profileError } = await admin
            .from('users')
            .select('name, role, pump_id')
            .eq('id', auth.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('[payments] create profile', profileError.code, profileError.message);
            send(res, 500, { ok: false, reason: 'load_failed' });
            return;
        }

        const pumpId = profile?.pump_id;
        if (!isUuid(pumpId)) {
            send(res, 400, { ok: false, reason: 'no_pump' });
            return;
        }

        const { data: pump, error: pumpError } = await admin
            .from('pumps')
            .select(PUMP_COLUMNS)
            .eq('id', pumpId)
            .maybeSingle();

        if (pumpError || !pump || pump.id !== pumpId) {
            send(res, 400, { ok: false, reason: 'no_pump' });
            return;
        }

        const buyer = buyerFrom(auth.user, profile, pump);
        buyer.phone = indianMobile(body?.phone) || buyer.phone;
        if (!buyer.phone) {
            send(res, 400, { ok: false, reason: 'phone_required' });
            return;
        }

        const { data: recent } = await admin
            .from('payment_orders')
            .select('created_at')
            .eq('user_id', auth.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (recent?.created_at && Date.now() - new Date(recent.created_at).getTime() < RATE_LIMIT_MS) {
            send(res, 429, { ok: false, reason: 'too_fast' });
            return;
        }

        const orderId = createOrderId(quote.id);
        const cfg = cashfreeConfig();
        const site = publicSiteUrl();
        const returnUrl = `${site}/subscription/payments?order_id={order_id}`;
        const notifyUrl = site.startsWith('https://') ? `${site}/api/payment-webhook` : '';

        let saved;
        try {
            saved = await savePaymentOrder(admin, {
                orderId,
                status: 'created',
                userId: auth.user.id,
                pumpId,
                planId: quote.planUuid || quote.id,
                amountTotal: quote.total,
                currency: quote.currency,
                gstin: gstin || null,
                billingName: buyer.name,
                billingEmail: buyer.email || null,
                billingPhone: buyer.phone,
            });
        } catch (err) {
            console.error('[payments] insert order failed', err.reason || err.message);
            send(res, 500, { ok: false, reason: err.reason || 'create_failed' });
            return;
        }

        const chargeAmount = Number(saved?.amount_total != null ? saved.amount_total : quote.total);

        let cfOrder;
        try {
            cfOrder = await createCashfreeOrder({
                orderId,
                amount: chargeAmount,
                currency: saved?.currency || quote.currency,
                customer: cashfreeCustomer(auth.user.id, buyer),
                returnUrl,
                notifyUrl,
                tags: {
                    plan_id: quote.id,
                    gstin: gstin || '',
                    pump_id: pumpId,
                },
            });
        } catch (err) {
            await savePaymentOrder(admin, { orderId, status: 'failed', userId: auth.user.id }).catch(() => {});
            console.error('[payments] cashfree create failed');
            send(res, 502, { ok: false, reason: err.reason || 'cashfree_error' });
            return;
        }

        const sessionId = cfOrder?.payment_session_id;
        if (!sessionId) {
            await savePaymentOrder(admin, { orderId, status: 'failed', userId: auth.user.id }).catch(() => {});
            send(res, 502, { ok: false, reason: 'cashfree_error' });
            return;
        }

        await savePaymentOrder(admin, {
            orderId,
            status: 'pending',
            userId: auth.user.id,
            cfOrderId: cfOrder.cf_order_id ? String(cfOrder.cf_order_id) : null,
            paymentSessionId: sessionId,
        });

        const quotes = await listQuotes().catch(() => []);
        send(res, 200, {
            ok: true,
            orderId,
            paymentSessionId: sessionId,
            mode: cfg.mode,
            amount: chargeAmount,
            plan: quote,
            quotes,
        });
    } catch (err) {
        console.error('[payments] create-order', err.message);
        send(res, 500, { ok: false, reason: 'create_failed' });
    }
};
