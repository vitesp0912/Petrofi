import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { formatDate, formatMoney, titleCase } from '../../lib/subscription';
import { fetchPaymentCatalog, fetchPaymentStatus } from '../../lib/payments';
import { PaymentResultDialog, paymentResultKind } from './PaymentDialogs';
import { Bone, cardClass, StatusPill } from './AccountBits';

function methodLabel(value) {
    const key = String(value || '').trim().toLowerCase();
    if (!key) return null;
    if (key === 'upi') return 'UPI';
    if (key === 'card' || key === 'cc' || key === 'dc') return 'Card';
    if (key === 'nb' || key === 'netbanking' || key === 'net_banking') return 'Net banking';
    if (key === 'wallet') return 'Wallet';
    return titleCase(value);
}

const PaymentsSkeleton = () => (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-7" data-testid="account-payments-skeleton" aria-busy="true" aria-live="polite">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
                <Bone className="h-3 w-20 bg-sky-100" />
                <Bone className="mt-3 h-8 sm:h-9 w-44 sm:w-56" />
            </div>
            <Bone className="h-8 w-24 rounded-full" />
        </header>
        <section className={`${cardClass} overflow-hidden`}>
            <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                    <div className="grid grid-cols-[1.2fr_1.3fr_0.8fr_0.9fr_0.8fr] gap-4 items-center px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-100">
                        <Bone className="h-3 w-10" />
                        <Bone className="h-3 w-16" />
                        <Bone className="h-3 w-12" />
                        <Bone className="h-3 w-10" />
                        <Bone className="h-3 w-14 justify-self-end" />
                    </div>
                    {[0, 1, 2, 3, 4].map((row) => (
                        <div
                            key={row}
                            className="grid grid-cols-[1.2fr_1.3fr_0.8fr_0.9fr_0.8fr] gap-4 items-center px-5 sm:px-6 py-4 border-t border-slate-100 first:border-t-0"
                        >
                            <div>
                                <Bone className="h-4 w-24" />
                                <Bone className="mt-1.5 h-3 w-20" />
                            </div>
                            <Bone className="h-4 w-28" />
                            <Bone className="h-6 w-16 rounded-full" />
                            <Bone className="h-4 w-24" />
                            <Bone className="h-4 w-16 justify-self-end" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
);

const PaymentsPanel = () => {
    const { loading } = useOutletContext();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const returnOrderId = params.get('order_id') || '';
    const handledReturn = useRef('');

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [resultStatus, setResultStatus] = useState('');
    const [resultPlanName, setResultPlanName] = useState('');

    useEffect(() => {
        let cancelled = false;
        setOrdersLoading(true);
        fetchPaymentCatalog('orders').then((result) => {
            if (cancelled) return;
            if (!result.ok) {
                setLoadError('Transactions could not load.');
                setOrdersLoading(false);
                return;
            }
            setOrders(result.orders || []);
            setOrdersLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!returnOrderId || handledReturn.current === returnOrderId) return undefined;
        handledReturn.current = returnOrderId;
        let cancelled = false;
        fetchPaymentStatus(returnOrderId).then(async (result) => {
            if (cancelled) return;
            const kind = paymentResultKind(result.ok ? result.status : 'failed');
            const catalogResult = await fetchPaymentCatalog('orders');
            if (cancelled) return;
            const nextOrders = catalogResult.ok ? catalogResult.orders || [] : [];
            if (catalogResult.ok) setOrders(nextOrders);
            const matched = nextOrders.find((row) => row.orderId === returnOrderId);
            setResultPlanName(matched?.planName || '');
            setResultStatus(kind);
            navigate('/subscription/payments', { replace: true });
        });
        return () => {
            cancelled = true;
        };
    }, [returnOrderId, navigate]);

    if (loading || ordersLoading) return <PaymentsSkeleton />;

    return (
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-7" data-testid="account-payments">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <p className="text-pf-sky text-xs font-semibold uppercase tracking-[0.16em] font-jakarta mb-2">
                        Payments
                    </p>
                    <h1 className="text-[28px] sm:text-[32px] font-bold font-outfit text-pf-navy leading-[1.15]">
                        Transactions
                    </h1>
                </div>
                <p className="self-start sm:self-auto inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-3 py-1.5 text-xs font-bold font-jakarta">
                    {orders.length} {orders.length === 1 ? 'payment' : 'payments'}
                </p>
            </header>

            <section className={`${cardClass} overflow-hidden`}>
                {loadError ? (
                    <div className="px-6 py-16 text-center">
                        <p className="text-sm font-semibold text-pf-navy font-outfit">Transactions could not load</p>
                    </div>
                ) : orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm font-jakarta">
                            <thead>
                                <tr className="bg-slate-50 text-sm uppercase tracking-wide text-slate-600">
                                    <th className="text-left font-bold px-5 sm:px-6 py-3.5">Plan</th>
                                    <th className="text-left font-bold px-5 sm:px-6 py-3.5">Order ID</th>
                                    <th className="text-left font-bold px-5 sm:px-6 py-3.5">Status</th>
                                    <th className="text-left font-bold px-5 sm:px-6 py-3.5">Date</th>
                                    <th className="text-right font-bold px-5 sm:px-6 py-3.5">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((row) => {
                                    const method = methodLabel(row.paymentMethod);
                                    return (
                                        <tr key={row.orderId} className="border-t border-slate-100 hover:bg-slate-50/70">
                                            <td className="px-5 sm:px-6 py-4 align-middle">
                                                <p className="font-semibold text-pf-navy font-outfit leading-tight">
                                                    {row.planName || 'Not set'}
                                                </p>
                                                {method ? (
                                                    <p className="mt-1 text-xs text-slate-400 font-jakarta">
                                                        {method}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-5 sm:px-6 py-4 align-middle text-slate-600 font-outfit tabular-nums break-all">
                                                {row.orderId || 'Not set'}
                                            </td>
                                            <td className="px-5 sm:px-6 py-4 align-middle">
                                                <StatusPill value={row.status} />
                                            </td>
                                            <td className="px-5 sm:px-6 py-4 align-middle text-slate-600 whitespace-nowrap">
                                                {formatDate(row.paidAt || row.createdAt)}
                                            </td>
                                            <td className="px-5 sm:px-6 py-4 align-middle text-right font-bold font-outfit text-pf-navy tabular-nums whitespace-nowrap">
                                                {formatMoney(row.amount, row.currency)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                            <Receipt size={22} />
                        </span>
                        <p className="mt-4 text-base font-bold font-outfit text-pf-navy">No transactions yet</p>
                    </div>
                )}
            </section>

            <PaymentResultDialog
                status={resultStatus}
                planName={resultPlanName}
                onClose={() => {
                    setResultStatus('');
                    setResultPlanName('');
                }}
            />
        </div>
    );
};

export default PaymentsPanel;
