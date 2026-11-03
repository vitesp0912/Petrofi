const { send, requireUser, isUuid, publicSiteUrl, readJsonBody, adminClient } = require('../server/http');
const { quoteById } = require('../server/catalog');
const { paymentsReady, cashfreeConfig, createOrderId, createCashfreeOrder } = require('../server/cashfree');
const { buyerFrom, applyBuyerOverrides, cashfreeCustomer, normalizeGstin } = require('../server/buyer');
const { savePaymentOrder } = require('../server/save-payment-order');
const { recordRefundConsent } = require('../server/legal-consent');
const { logQuietly, fromRequest, sanitizePayload } = require('../server/error-log');

const PUMP_COLUMNS = 'id, pump_code, name, owner_name, phone, email, address, city, state, pincode';
const RATE_LIMIT_MS = 20 * 1000;

function failCreate(req, res, status, reason, ctx = {}) {
    const severity = status >= 500 ? 'error' : 'warning';
    if (status >= 500 || reason === 'cashfree_error' || reason === 'consent_failed' || reason === 'create_failed') {
        logQuietly({
            ...fromRequest(req, {
                userId: ctx.userId,
                pumpId: ctx.pumpId,
                requestPayload: sanitizePayload(ctx.requestPayload),
            }),
            source: ctx.source || 'api',
            severity: ctx.severity || severity,
            module: 'payments',
            errorType: reason || 'create_failed',
            message: ctx.message || reason || 'create_failed',
            stack: ctx.stack || null,
            details: ctx.details || { reason },
            responseStatus: status,
            error: ctx.error,
        });
    }
    send(res, status, { ok: false, reason });
}

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

        if (body?.acceptRefundPolicy !== true) {
            send(res, 400, { ok: false, reason: 'refund_policy_required' });
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

        let gstin = null;
        if (body?.hasGst === true) {
            gstin = normalizeGstin(body?.gstin);
            if (!gstin) {
                send(res, 400, { ok: false, reason: 'invalid_gstin' });
                return;
            }
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
        const overrideError = applyBuyerOverrides(buyer, body);
        if (overrideError) {
            send(res, 400, { ok: false, reason: overrideError });
            return;
        }
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

        const orderId = createOrderId();
        const cfg = cashfreeConfig();
        let site = publicSiteUrl();
        if (cfg.production && (!site.startsWith('https://') || /localhost|127\.0\.0\.1/i.test(site))) {
            site = 'https://www.petrofi.in';
        }
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
            failCreate(req, res, 500, err.reason || 'create_failed', {
                userId: auth.user.id,
                pumpId,
                source: 'database',
                error: err,
                requestPayload: body,
                details: { orderId, reason: err.reason || 'create_failed' },
            });
            return;
        }

        try {
            await recordRefundConsent(admin, { userId: auth.user.id, pumpId, req });
        } catch (err) {
            await savePaymentOrder(admin, { orderId, status: 'failed', userId: auth.user.id }).catch(() => {});
            failCreate(req, res, 500, err.reason || 'consent_failed', {
                userId: auth.user.id,
                pumpId,
                source: 'database',
                error: err,
                requestPayload: body,
                details: { orderId, reason: err.reason || 'consent_failed' },
            });
            return;
        }

        const chargeAmount = Number(saved?.amount_total != null ? saved.amount_total : quote.total);

        const billing = {
            full_name: buyer.name,
            country: 'India',
        };
        if (buyer.address) billing.address_1 = buyer.address.slice(0, 120);
        if (buyer.city) billing.city = buyer.city.slice(0, 50);
        if (buyer.state) billing.state = buyer.state.slice(0, 50);
        if (buyer.pincode && buyer.pincode.length === 6) billing.pincode = buyer.pincode;

        const pumpLabel = buyer.pumpName || '-';
        const orderNote = [
            `Plan: ${quote.name}`,
            `Pump: ${pumpLabel}`,
            `Owner: ${buyer.name}`,
            buyer.email ? `Email: ${buyer.email}` : '',
        ]
            .filter(Boolean)
            .join(' | ')
            .slice(0, 200);

        const cart = {
            cart_name: quote.name,
            customer_note: orderNote,
            cart_items: [
                {
                    item_id: String(quote.id).slice(0, 40),
                    item_name: `${quote.name}${buyer.pumpName ? ` - ${buyer.pumpName}` : ''}`.slice(0, 100),
                    item_description: orderNote,
                    item_original_unit_price: chargeAmount,
                    item_discounted_unit_price: chargeAmount,
                    item_currency: saved?.currency || quote.currency || 'INR',
                    item_quantity: 1,
                },
            ],
            customer_billing_address: billing,
        };

        const orderPayload = {
            orderId,
            amount: chargeAmount,
            currency: saved?.currency || quote.currency,
            customer: cashfreeCustomer(auth.user.id, buyer),
            returnUrl,
            notifyUrl,
            note: orderNote,
            tags: {
                plan_id: quote.id,
                pump_id: String(pumpId).replace(/-/g, ''),
            },
        };

        let cfOrder;
        try {
            cfOrder = await createCashfreeOrder({ ...orderPayload, cart });
        } catch {
            try {
                cfOrder = await createCashfreeOrder(orderPayload);
            } catch (err) {
                await savePaymentOrder(admin, { orderId, status: 'failed', userId: auth.user.id }).catch(() => {});
                failCreate(req, res, 502, err.reason || 'cashfree_error', {
                    userId: auth.user.id,
                    pumpId,
                    source: 'api',
                    severity: 'critical',
                    error: err,
                    requestPayload: body,
                    details: {
                        orderId,
                        amount: chargeAmount,
                        reason: err.reason || 'cashfree_error',
                        cashfreeStatus: err.status || null,
                    },
                });
                return;
            }
        }

        const sessionId = cfOrder?.payment_session_id;
        if (!sessionId) {
            await savePaymentOrder(admin, { orderId, status: 'failed', userId: auth.user.id }).catch(() => {});
            failCreate(req, res, 502, 'cashfree_error', {
                userId: auth.user.id,
                pumpId,
                source: 'api',
                severity: 'critical',
                message: 'Cashfree order missing payment_session_id',
                requestPayload: body,
                details: { orderId, amount: chargeAmount, cfOrderId: cfOrder?.cf_order_id || null },
            });
            return;
        }

        await savePaymentOrder(admin, {
            orderId,
            status: 'pending',
            userId: auth.user.id,
            cfOrderId: cfOrder.cf_order_id ? String(cfOrder.cf_order_id) : null,
            paymentSessionId: sessionId,
        });

        send(res, 200, {
            ok: true,
            orderId,
            paymentSessionId: sessionId,
            mode: cfg.mode,
        });
    } catch (err) {
        failCreate(req, res, 500, 'create_failed', {
            source: 'api',
            severity: 'critical',
            error: err,
        });
    }
};
