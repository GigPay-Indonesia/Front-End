import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi';
import { getTokenSymbolByAddress } from '../lib/abis';
import { useEscrowCoreContract } from '../lib/hooks/useGigPayContracts';

const statusStyles: Record<string, string> = {
    Created: 'bg-slate-800 border-slate-700 text-slate-300',
    Funded: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    Submitted: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    Released: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    Refunded: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
    'In Dispute': 'bg-red-500/10 border-red-500/20 text-red-400',
};

export const Payments: React.FC = () => {
    const escrowCore = useEscrowCoreContract();
    const [refreshKey, setRefreshKey] = useState(0);

    const nextIntentId = useReadContract({
        address: escrowCore.address,
        abi: escrowCore.abi,
        functionName: 'nextIntentId',
        query: { enabled: Boolean(escrowCore.address && escrowCore.abi) },
    });

    const latestIntentId = Number(nextIntentId.data || 0);
    const intentIds = useMemo(() => {
        if (!latestIntentId || latestIntentId <= 1) return [];
        const maxItems = 10;
        const start = Math.max(1, latestIntentId - maxItems);
        return Array.from({ length: latestIntentId - start }, (_, idx) => BigInt(latestIntentId - 1 - idx));
    }, [latestIntentId, refreshKey]);

    const intentsRead = useReadContracts({
        contracts: intentIds.map((intentId) => ({
            address: escrowCore.address,
            abi: escrowCore.abi,
            functionName: 'intents',
            args: [intentId],
        })),
        query: { enabled: Boolean(escrowCore.address && escrowCore.abi && intentIds.length) },
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'IntentCreated',
        onLogs: () => {
            nextIntentId.refetch();
            intentsRead.refetch();
            setRefreshKey((prev) => prev + 1);
        },
        enabled: Boolean(escrowCore.address && escrowCore.abi),
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'Funded',
        onLogs: () => intentsRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi),
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'Submitted',
        onLogs: () => intentsRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi),
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'Released',
        onLogs: () => intentsRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi),
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'Refunded',
        onLogs: () => intentsRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi),
    });

    const payments = useMemo(() => {
        const statusLabels = ['Created', 'Funded', 'Submitted', 'Released', 'Refunded', 'In Dispute'];
        return intentIds.map((intentId, idx) => {
            const result = intentsRead.data?.[idx]?.result as any;
            const status = typeof result?.status === 'number' ? statusLabels[result.status] || 'Unknown' : 'Unknown';
            const assetSymbol = getTokenSymbolByAddress(result?.asset);
            const payoutSymbol = getTokenSymbolByAddress(result?.payoutAsset);
            const deadlineSeconds = Number(result?.deadline || 0);
            const days = deadlineSeconds
                ? Math.max(0, Math.ceil((deadlineSeconds - Math.floor(Date.now() / 1000)) / 86400))
                : 0;

            return {
                id: `PI-${intentId.toString()}`,
                to: result?.treasury ? `${result.treasury.slice(0, 6)}...${result.treasury.slice(-4)}` : '—',
                amount: result?.amount ? result.amount.toString() : '—',
                asset: assetSymbol,
                payoutAsset: payoutSymbol,
                status,
                protection: 'Not Enabled',
                yield: result?.escrowYieldEnabled ? 'Enabled' : 'Disabled',
                deadline: days ? `${days} days` : '—',
                intentId,
            };
        });
    }, [intentIds, intentsRead.data]);

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Payments
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Track payment intents, approvals, and releases.</p>
                    </div>
                    <Link
                        to="/payments/new"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all"
                    >
                        New Payment <ArrowUpRight size={18} />
                    </Link>
                </div>

                <div className="bg-[#0f172a]/30 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4">Payment ID</th>
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Asset</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Protection</th>
                                    <th className="px-6 py-4">Yield</th>
                                    <th className="px-6 py-4">Release Due</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {payments.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white font-semibold">{item.id}</td>
                                        <td className="px-6 py-4 text-slate-300">{item.to}</td>
                                        <td className="px-6 py-4 font-mono text-white">{item.amount}</td>
                                        <td className="px-6 py-4 text-slate-300">{item.asset}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${statusStyles[item.status]}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{item.protection}</td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{item.yield}</td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{item.deadline}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/payments/${item.intentId.toString()}`} className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider">
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
