# PetroFI Cashfree payments

This is the checklist to take real money on the subscription Payments page.

The website does **not** trust the browser for price, plan, or “I paid”. Cashfree and the PetroFI server decide. If Cashfree is down, the rest of the website still loads. Pay Now simply fails with a clear message.

## Who does what

Checkout code is already in the repo. The browser never writes `payment_orders`. Pay Now calls `/api/payment-*`. Those routes talk to Cashfree and write the database with the service role key.

**Already in the repo (no extra coding needed for the money path)**

- Payments page: `frontend/src/components/account/PaymentsPanel.jsx`
- Create order / status / webhook: `frontend/api/payment-*.js`
- SQL: `docs/sql/cashfree_payments.sql`

**You do these (I cannot do them from this chat)**

1. Run the SQL once in Supabase → SQL Editor.
2. Paste `SUPABASE_SERVICE_ROLE_KEY` into repo-root `.env` and into Vercel (server env only).
3. Confirm sandbox Cashfree App ID + Secret are on Vercel (they are already in local `.env`).
4. In Cashfree → Webhooks, add `https://www.petrofi.in/api/payment-webhook` (success + failed, API `2025-01-01`).
5. Redeploy Vercel after env vars. Sign in and make one sandbox payment.
6. After that works: live Cashfree keys + `CASHFREE_ENV=production`.

**Do not paste into this chat**

- Service role key
- Live Cashfree secret
- MCP `sbp_` token

The attached Supabase MCP is **read-only**. It cannot create tables. Run the SQL yourself in the dashboard.

---

## What you will see on the page

1. Plan selector: 1 year, 6 months, Monthly.
2. Name, pump, email, and mobile filled from this login.
3. Optional GSTIN for a business invoice.
4. **Pay Now** opens Cashfree (UPI, cards, net banking).
5. After a successful pay, the pump plan turns active.

GST is **+18%** on the plan amount. That total is calculated on the server.

---

## What I need from you

Send these in a private channel. Do not paste secret keys in GitHub, WhatsApp groups, or this chat if it is logged.

### 1. Cashfree account (required)

From [Cashfree Merchant Dashboard](https://merchant.cashfree.com/) → Developers → API Keys:

| Item | Test (sandbox) | Live (production) |
| --- | --- | --- |
| App ID / Client ID | needed | needed before real money |
| Secret Key | needed | needed before real money |

Also confirm:

- Business name on the Cashfree account
- Whether you want **test first** (recommended) or go live immediately
- The public website URL Cashfree should send people back to. For PetroFI this should be `https://www.petrofi.in`

### 2. Cashfree webhook (required)

In Cashfree → Developers → Webhooks, add:

`https://www.petrofi.in/api/payment-webhook`

Subscribe to payment success and payment failed events. Use API version **2025-01-01** if asked.

The webhook is checked with your Cashfree secret. A fake “payment success” from a browser will be ignored.

### 3. Supabase service role key (required)

From Supabase → Project Settings → API:

| Item | Why |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | The webhook has no user login. This key updates the pump after Cashfree confirms pay. **Never** put this in frontend env vars or `REACT_APP_*`. |

You already have `SUPABASE_URL` and the anon key on Vercel. Keep those. Add only the service role as a **server** secret.

### 4. Run the SQL (required, once)

In Supabase → SQL Editor, run the file:

`docs/sql/cashfree_payments.sql`

This creates `payment_orders` and `payment_webhook_events` with row security on. The browser can read a user’s own orders. It cannot insert, edit, or delete them.

### 5. Vercel environment variables (required)

On the Vercel project that hosts this frontend, add:

```
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_ENV=sandbox
PUBLIC_SITE_URL=https://www.petrofi.in
SUPABASE_SERVICE_ROLE_KEY=
```

Use `CASHFREE_ENV=sandbox` until a test payment works. Then switch to `CASHFREE_ENV=production` and put the **live** App ID and Secret Key.

Redeploy after saving env vars.

### 6. Optional, but useful

| Item | Why |
| --- | --- |
| Your company GSTIN | For Cashfree invoices / GST reports on your merchant account |
| Support phone already on the site | Shown if Pay Now cannot run |
| A test UPI ID or test card from Cashfree | To prove sandbox before live |

You do **not** need to send customer GSTINs. Each buyer can type their own GSTIN on the Payments page.

---

## What we will not do

- The browser cannot change ₹4,999 to ₹1. The server looks up the plan id and charges that plan plus GST.
- A paid plan is not switched on from a URL like `?paid=true`. The server asks Cashfree, then updates the pump.
- Missing Cashfree keys will not crash the homepage, login, or gallery. Only Pay Now stays closed.
- Secret keys stay on Vercel. They are not in the React bundle.

---

## Test plan (sandbox)

1. Run the SQL.
2. Put sandbox keys on Vercel (or in local `.env`).
3. Sign in to `/subscription/payments`.
4. Pick a plan. Confirm name and pump are filled.
5. Pay with a Cashfree test method.
6. You should return to Payments and see **Payment received**.
7. Profile should show an active plan and a later valid-till date.
8. Only then switch `CASHFREE_ENV` to `production`.

---

## If something fails

- **Pay is not open yet** → keys missing, or SQL not run, or `SUPABASE_SERVICE_ROLE_KEY` missing.
- **Cashfree checkout did not open** → ad blocker, or sandbox/live key mismatch.
- **Paid in Cashfree but pump still on trial** → open Payments again with the same login. The page asks Cashfree for the order status. Also check webhook logs in Cashfree.
- **Need a human** → +91 73986 21812

---

## Files added for this

- Payments page: `frontend/src/components/account/PaymentsPanel.jsx`
- Create order (server): `frontend/api/payment-create-order.js`
- Payment status (server): `frontend/api/payment-status.js`
- Cashfree webhook (server): `frontend/api/payment-webhook.js`
- SQL: `docs/sql/cashfree_payments.sql`
