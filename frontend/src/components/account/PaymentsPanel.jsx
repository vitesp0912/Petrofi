import React, { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { Landmark, Phone, Smartphone, Wallet } from 'lucide-react';
import { formatDate, formatMoney } from '../../lib/subscription';
import {
    createPaymentOrder,
    fetchPaymentCatalog,
    fetchPaymentStatus,
    savePaymentStatus,
    loadCashfreeSdk,
    paymentErrorText,
} from '../../lib/payments';
import { cardClass, LoadingState, PageIntro, StatusPill } from './AccountBits';

const METHODS = [
    { icon: Smartphone, label: 'UPI', hint: 'GPay, PhonePe, and other UPI apps' },
    { icon: Landmark, label: 'Net banking', hint: 'Pay from your bank account' },
    { icon: Wallet, label: 'Cards', hint: 'Debit and credit cards' },
];

const PaymentsPanel = () => {
    const { user, loading, pump, profile } = useOutletContext();
    const [params] = useSearchParams();
    const requestedPlan = params.get('plan') || '';
    const returnOrderId = params.get('order_id') || '';

    const [catalog, setCatalog] = useState(null);
    const [catalogError, setCatalogError] = useState('');
    const [planId, setPlanId] = useState(requestedPlan || '');
    const [gstin, setGstin] = useState('');
    const [phone, setPhone] = useState('');
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState('');
    const [payStatus, setPayStatus] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchPaymentCatalog().then((result) => {
            if (cancelled) return;
            if (!result.ok) {
                setCatalogError(paymentErrorText(result.reason));
                return;
            }
            setCatalog(result);
            const ids = (result.quotes || []).map((item) => item.id);
            setPlanId((current) => (ids.includes(current) ? current : ids.includes(requestedPlan) ? requestedPlan : ids[0] || ''));
            setPhone((current) => current || result.buyer?.phone || '');
        });
        return () => {
            cancelled = true;
        };
    }, [requestedPlan]);

    useEffect(() => {
        if (!returnOrderId) return undefined;
        let cancelled = false;
        setPayStatus('checking');
        fetchPaymentStatus(returnOrderId).then((result) => {
            if (cancelled) return;
            if (result.ok && result.status === 'paid') {
                setPayStatus('paid');
                fetchPaymentCatalog().then((catalogResult) => {
                    if (cancelled || !catalogResult.ok) return;
                    setCatalog(catalogResult);
                });
                return;
            }
            setPayStatus(result.status || 'pending');
        });
        return () => {
            cancelled = true;
        };
    }, [returnOrderId]);

    const quotes = useMemo(() => catalog?.quotes || [], [catalog]);
    const orders = catalog?.orders || [];
    const ordersFailed = Boolean(catalogError);
    const quote = useMemo(
        () => quotes.find((item) => item.id === planId) || quotes[0] || null,
        [quotes, planId]
    );
    const buyer = catalog?.buyer || {
        name: profile?.name || pump?.ownerName || '',
        email: pump?.email || user?.email || '',
        phone: '',
        pumpName: pump?.name || '',
        pumpCode: pump?.code || '',
        hasPump: Boolean(pump),
    };
    const phoneLocked = Boolean(buyer?.phone);
    const canPay = Boolean(catalog?.ready && buyer?.hasPump && quote && (phoneLocked || phone.length === 10) && !paying);

    const handlePay = async (event) => {
        event.preventDefault();
        if (!canPay || !quote) return;
        setPaying(true);
        setPayError('');
        const created = await createPaymentOrder({
            planId: quote.id,
            gstin,
            phone: phoneLocked ? undefined : phone,
        });
        if (!created.ok) {
            setPaying(false);
            setPayError(paymentErrorText(created.reason));
            return;
        }
        try {
            const Cashfree = await loadCashfreeSdk();
            const cashfree = Cashfree({ mode: created.mode === 'production' ? 'production' : 'sandbox' });
            await cashfree.checkout({
                paymentSessionId: created.paymentSessionId,
                redirectTarget: '_self',
            });
        } catch {
            if (created.orderId) {
                await savePaymentStatus(created.orderId, 'user_dropped');
            }
            setPayError('Cashfree checkout did not open. Try again.');
        } finally {
            setPaying(false);
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-5 sm:space-y-6" data-testid="account-payments">
            <PageIntro
                kicker="Payments"
                title="Pay for your PetroFI plan"
                text="Pick a plan. Your pump details fill in from this login. Pay Now opens Cashfree."
            />

            {payStatus === 'paid' ? (
                <section className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 sm:p-6">
                    <p className="text-sm font-bold text-emerald-800 font-outfit">Payment received</p>
                    <p className="mt-1 text-sm text-emerald-800/80 font-jakarta">
                        This pump is now on a paid PetroFI plan. A GST invoice will follow from Cashfree.
                    </p>
                    <Link to="/subscription" className="inline-flex mt-4 text-sm font-semibold text-pf-navy font-jakarta">
                        Back to profile
                    </Link>
                </section>
            ) : null}

            {payStatus === 'checking' ? (
                <p className="text-sm text-slate-500 font-jakarta">Checking this payment with Cashfree.</p>
            ) : null}

            <form onSubmit={handlePay} className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
                <section className={`${cardClass} p-5 sm:p-7`}>
                    <h2 className="text-lg font-bold font-outfit text-pf-navy">Choose a plan</h2>
                    <p className="mt-1 text-sm text-slate-500 font-jakarta">The amount is set on the server. It cannot be edited here.</p>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {quotes.map((item) => {
                            const selected = item.id === planId;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setPlanId(item.id)}
                                    className={`text-left rounded-2xl border p-4 ${
                                        selected ? 'border-pf-navy ring-2 ring-pf-navy/15 bg-slate-50' : 'border-slate-200 bg-white'
                                    }`}
                                    data-testid={`pay-plan-${item.id}`}
                                >
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 font-jakarta">
                                        {item.name}
                                    </p>
                                    <p className="mt-2 text-xl font-bold font-outfit text-pf-navy">
                                        {formatMoney(item.base, item.currency)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 font-jakarta">+{item.gstPct}% GST</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 space-y-3">
                        <p className="text-sm font-bold font-outfit text-pf-navy">Billing details</p>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 px-3.5 py-3">
                                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 font-jakarta">Name</dt>
                                <dd className="mt-1 text-sm font-semibold text-pf-navy font-jakarta">{buyer?.name || profile?.name || 'Not set'}</dd>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3.5 py-3">
                                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 font-jakarta">Pump</dt>
                                <dd className="mt-1 text-sm font-semibold text-pf-navy font-jakarta">{buyer?.pumpName || pump?.name || 'Not set'}</dd>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3.5 py-3">
                                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 font-jakarta">Email</dt>
                                <dd className="mt-1 text-sm font-semibold text-pf-navy font-jakarta break-all">{buyer?.email || user?.email || 'Not set'}</dd>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3.5 py-3">
                                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 font-jakarta">Mobile</dt>
                                <dd className="mt-1 text-sm font-semibold text-pf-navy font-jakarta">
                                    {phoneLocked ? (
                                        buyer.phone
                                    ) : (
                                        <input
                                            value={phone}
                                            onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                                            inputMode="numeric"
                                            placeholder="10-digit mobile"
                                            className="w-full bg-transparent text-sm font-semibold text-pf-navy font-jakarta outline-none"
                                            data-testid="pay-phone"
                                        />
                                    )}
                                </dd>
                            </div>
                        </dl>
                        <div>
                            <label htmlFor="pay-gstin" className="block text-xs font-semibold text-pf-navy font-jakarta mb-1.5">
                                GSTIN for this business
                            </label>
                            <input
                                id="pay-gstin"
                                value={gstin}
                                onChange={(event) => setGstin(event.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15))}
                                placeholder="Optional. 15 characters"
                                autoComplete="off"
                                data-testid="pay-gstin"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-jakarta text-pf-navy placeholder-slate-400 focus:outline-none focus:border-pf-sky focus:ring-2 focus:ring-pf-sky/20 bg-slate-50 uppercase"
                            />
                            <p className="mt-1.5 text-xs text-slate-500 font-jakarta">
                                If a firm is buying PetroFI, add GSTIN so the invoice can carry it. Leave blank for a personal pump.
                            </p>
                        </div>
                    </div>
                </section>

                <aside className="space-y-5">
                    <section className="rounded-2xl bg-pf-navy text-white p-6 sm:p-7 shadow-[0_18px_50px_rgba(13,27,62,0.22)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pf-sky font-jakarta">To pay</p>
                        <h2 className="mt-2 text-2xl font-bold font-outfit">{quote ? quote.name : 'Select a plan'}</h2>
                        {quote ? (
                            <dl className="mt-5 space-y-2 text-sm font-jakarta">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-white/55">Plan</dt>
                                    <dd className="font-semibold">{formatMoney(quote.base, quote.currency)}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-white/55">+{quote.gstPct}% GST</dt>
                                    <dd className="font-semibold">{formatMoney(quote.gst, quote.currency)}</dd>
                                </div>
                                <div className="flex justify-between gap-4 pt-2 border-t border-white/10">
                                    <dt className="font-semibold">Total</dt>
                                    <dd className="text-xl font-bold font-outfit">{formatMoney(quote.total, quote.currency)}</dd>
                                </div>
                            </dl>
                        ) : null}
                        {catalogError ? <p className="mt-4 text-sm text-amber-200 font-jakarta">{catalogError}</p> : null}
                        {!catalog?.ready && catalog ? (
                            <p className="mt-4 text-sm text-amber-200 font-jakarta">
                                Cashfree keys are not live on this server yet. You can still review the amount.
                            </p>
                        ) : null}
                        {payError ? <p className="mt-4 text-sm text-rose-200 font-jakarta">{payError}</p> : null}
                        <button
                            type="submit"
                            disabled={!canPay}
                            data-testid="pay-now-btn"
                            className="mt-6 w-full inline-flex items-center justify-center rounded-full bg-pf-sky text-pf-navy px-5 py-3 text-sm font-bold font-jakarta hover:bg-pf-sky/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {paying ? 'Opening Cashfree…' : 'Pay Now'}
                        </button>
                        <a
                            href="tel:+917398621812"
                            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white/10 text-white px-5 py-3 text-sm font-semibold font-jakarta hover:bg-white/15"
                        >
                            <Phone size={15} />
                            Need help? Call
                        </a>
                    </section>

                    <section className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
                        {METHODS.map((method) => (
                            <div key={method.label} className={`${cardClass} p-4 flex items-start gap-3`}>
                                <div className="w-9 h-9 rounded-xl bg-slate-100 text-pf-navy flex items-center justify-center shrink-0">
                                    <method.icon size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold font-outfit text-pf-navy">{method.label}</p>
                                    <p className="text-xs text-slate-500 font-jakarta">{method.hint}</p>
                                </div>
                            </div>
                        ))}
                    </section>
                </aside>
            </form>

            <section className={`${cardClass} p-6 sm:p-7`}>
                <h3 className="text-lg font-bold font-outfit text-pf-navy mb-1">Transactions</h3>
                <p className="text-sm text-slate-500 font-jakarta mb-4">Payments for this pump are listed here.</p>
                {ordersFailed ? (
                    <p className="text-sm text-slate-500 font-jakarta">Transactions could not load. Refresh the page.</p>
                ) : orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm font-jakarta">
                            <thead>
                                <tr className="text-xs text-slate-400">
                                    <th className="pb-3 font-semibold">Plan</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Date</th>
                                    <th className="pb-3 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((row) => (
                                    <tr key={row.orderId} className="border-t border-slate-100">
                                        <td className="py-3.5 font-semibold text-pf-navy">{row.planName || 'Not set'}</td>
                                        <td className="py-3.5"><StatusPill value={row.status} /></td>
                                        <td className="py-3.5 text-slate-600">{formatDate(row.paidAt || row.createdAt)}</td>
                                        <td className="py-3.5 font-semibold text-pf-navy">
                                            {formatMoney(row.amount, row.currency)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 font-jakarta">No transactions yet.</p>
                )}
            </section>
        </div>
    );
};

export default PaymentsPanel;
