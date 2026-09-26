import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { formatDate, formatMoney } from '../../lib/subscription';
import { fetchPaymentCatalog, fetchPaymentStatus } from '../../lib/payments';
import { PaymentResultDialog, paymentResultKind } from './PaymentDialogs';
import { cardClass, LoadingState, PageIntro, StatusPill } from './AccountBits';

const PaymentsPanel = () => {
    const { loading } = useOutletContext();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const returnOrderId = params.get('order_id') || '';
    const handledReturn = useRef('');

    const [orders, setOrders] = useState([]);
    const [loadError, setLoadError] = useState('');
    const [resultStatus, setResultStatus] = useState('');
    const [resultPlanName, setResultPlanName] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchPaymentCatalog('orders').then((result) => {
            if (cancelled) return;
            if (!result.ok) {
                setLoadError('Transactions could not load.');
                return;
            }
            setOrders(result.orders || []);
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

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-5 sm:space-y-6" data-testid="account-payments">
            <PageIntro
                kicker="Payments"
                title="Transactions"
                text="Payments for this pump are listed here."
            />

            <section className={`${cardClass} p-6 sm:p-7`}>
                {loadError ? (
                    <p className="text-sm text-slate-500 font-jakarta">{loadError}</p>
                ) : orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm font-jakarta">
                            <thead>
                                <tr className="text-xs text-slate-400">
                                    <th className="pb-3 font-semibold">Order ID</th>
                                    <th className="pb-3 font-semibold">Plan</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Date</th>
                                    <th className="pb-3 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((row) => (
                                    <tr key={row.orderId} className="border-t border-slate-100">
                                        <td className="py-3.5 font-mono text-pf-navy">{row.orderId}</td>
                                        <td className="py-3.5 font-semibold text-pf-navy">{row.planName || 'Not set'}</td>
                                        <td className="py-3.5"><StatusPill value={row.status} /></td>
                                        <td className="py-3.5 text-slate-600">{formatDate(row.createdAt)}</td>
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
