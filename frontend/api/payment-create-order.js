const { send, requireUser, isUuid, publicSiteUrl, readJsonBody, adminClient } = require('../server/http');
const { quoteById } = require('../server/catalog');
const { paymentsReady, cashfreeConfig, createOrderId, createCashfreeOrder } = require('../server/cashfree');
const { buyerFrom, cashfreeCustomer, normalizeGstin, indianMobile } = require('../server/buyer');
const { savePaymentOrder } = require('../server/save-payment-order');

const PUMP_COLUMNS = 'id, pump_code, name, owner_name, phone, email, address, city, state, pincode, subscription_end_date';
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
            send(res, 500, { ok: false, reason: err.reason || 'create_failed' });
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
                ...(gstin ? { gstin } : {}),
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
                send(res, 502, { ok: false, reason: err.reason || 'cashfree_error' });
                return;
            }
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

        send(res, 200, {
            ok: true,
            orderId,
            paymentSessionId: sessionId,
            mode: cfg.mode,
        });
    } catch {
        send(res, 500, { ok: false, reason: 'create_failed' });
    }
};
