import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useReadContract, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getTokenSymbolByAddress } from '../lib/abis';
import { useEscrowCoreContract, useTreasuryVaultContract } from '../lib/hooks/useGigPayContracts';

const statusLabels = ['Created', 'Funded', 'Submitted', 'Released', 'Refunded', 'In Dispute'];

const parseIntentId = (value?: string) => {
    if (!value) return null;
    const numeric = value.replace(/[^0-9]/g, '');
    if (!numeric) return null;
    try {
        return BigInt(numeric);
    } catch {
        return null;
    }
};

export const PaymentDetail: React.FC = () => {
    const { id } = useParams();
    const escrowCore = useEscrowCoreContract();
    const treasuryVault = useTreasuryVaultContract();
    const intentId = useMemo(() => parseIntentId(id), [id]);
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    const intentRead = useReadContract({
        address: escrowCore.address,
        abi: escrowCore.abi,
        functionName: 'intents',
        args: intentId ? [intentId] : undefined,
        query: { enabled: Boolean(escrowCore.address && escrowCore.abi && intentId) },
    });

    const splitsRead = useReadContract({
        address: escrowCore.address,
        abi: escrowCore.abi,
        functionName: 'getSplits',
        args: intentId ? [intentId] : undefined,
        query: { enabled: Boolean(escrowCore.address && escrowCore.abi && intentId) },
    });

    const { writeContract, data: actionHash } = useWriteContract();
    const { isLoading: isActionLoading } = useWaitForTransactionReceipt({ hash: actionHash });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'IntentCreated',
        onLogs: () => intentRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi && intentId),
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'Funded',
        onLogs: () => intentRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi && intentId),
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'Submitted',
        onLogs: () => intentRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi && intentId),
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'Released',
        onLogs: () => intentRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi && intentId),
    });

    useWatchContractEvent({
        address: escrowCore.address,
        abi: escrowCore.abi,
        eventName: 'Refunded',
        onLogs: () => intentRead.refetch(),
        enabled: Boolean(escrowCore.address && escrowCore.abi && intentId),
    });

    const intent = intentRead.data as {
        treasury: string;
        payer: string;
        creator: string;
        asset: string;
        payoutAsset: string;
        amount: bigint;
        deadline: bigint;
        acceptanceWindow: bigint;
        status: number;
        swapRequired: boolean;
        preferredRoute: number;
        escrowYieldEnabled: boolean;
        escrowStrategyId: number;
    } | undefined;

    const statusLabel = typeof intent?.status === 'number' ? statusLabels[intent.status] || 'Unknown' : 'Unknown';
    const amountSymbol = getTokenSymbolByAddress(intent?.asset);
    const payoutSymbol = getTokenSymbolByAddress(intent?.payoutAsset);
    const amountValue = intent ? intent.amount.toString() : '—';
    const releaseDueDays = intent?.deadline
        ? Math.max(0, Math.ceil((Number(intent.deadline) - Math.floor(Date.now() / 1000)) / 86400))
        : null;

    const handleFund = () => {
        if (!intentId || !escrowCore.address || !treasuryVault.address || !intent?.asset) return;
        setPendingAction('Fund');
        writeContract({
            address: treasuryVault.address,
            abi: treasuryVault.abi,
            functionName: 'fundEscrow',
            args: [escrowCore.address, intent.asset, intentId, intent.amount],
        });
    };

    const handleRelease = () => {
        if (!intentId || !escrowCore.address) return;
        setPendingAction('Release');
        writeContract({
            address: escrowCore.address,
            abi: escrowCore.abi,
            functionName: 'release',
            args: [intentId],
        });
    };

    const handleRefund = () => {
        if (!intentId || !escrowCore.address) return;
        setPendingAction('Refund');
        writeContract({
            address: escrowCore.address,
            abi: escrowCore.abi,
            functionName: 'refundToTreasury',
            args: [intentId],
        });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/payments" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
                        <ArrowLeft size={18} className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Payment {intentId ? `PI-${intentId.toString()}` : id}</h1>
                        <p className="text-slate-500 text-sm">Review status, evidence, and approvals.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-6">Activity Timeline</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">Current Status</span>
                                            <span className="text-xs text-slate-500">{statusLabel}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Live status from escrow contract.</p>
                                    </div>
                                </div>
                                {releaseDueDays !== null && (
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-purple-400"></div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-white">Release Due</span>
                                                <span className="text-xs text-slate-500">{releaseDueDays} days</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">Based on current deadline.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-4">Actions</h4>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleFund}
                                    disabled={isActionLoading || !intentId}
                                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all"
                                >
                                    {pendingAction === 'Fund' && isActionLoading ? 'Processing...' : 'Fund Escrow'}
                                </button>
                                <button
                                    onClick={handleRelease}
                                    disabled={isActionLoading || !intentId}
                                    className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all"
                                >
                                    {pendingAction === 'Release' && isActionLoading ? 'Processing...' : 'Approve Release'}
                                </button>
                                <button className="flex-1 py-3 bg-[#0f172a] border border-slate-700 hover:border-slate-500 text-white font-medium rounded-xl transition-all">
                                    Request Clarification
                                </button>
                                <button
                                    onClick={handleRefund}
                                    disabled={isActionLoading || !intentId}
                                    className="flex-1 py-3 bg-[#0f172a] border border-red-500/40 hover:border-red-500 text-red-300 font-medium rounded-xl transition-all"
                                >
                                    {pendingAction === 'Refund' && isActionLoading ? 'Processing...' : 'Initiate Refund'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-4">Summary</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span>Recipient</span>
                                    <span className="text-white">{intent?.treasury ? `${intent.treasury.slice(0, 6)}...${intent.treasury.slice(-4)}` : '—'}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Amount</span>
                                    <span className="text-white">{amountValue} {amountSymbol}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Status</span>
                                    <span className="text-yellow-400">{statusLabel}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Protection</span>
                                    <span className="text-white">Not Enabled</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Yield</span>
                                    <span className="text-white">{intent?.escrowYieldEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Payout Asset</span>
                                    <span className="text-white">{payoutSymbol}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 flex gap-3">
                            <ShieldCheck className="text-cyan-400 shrink-0" size={20} />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Escrow actions will update automatically once confirmed on-chain.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
