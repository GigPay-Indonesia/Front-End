import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, DollarSign, FileText, ArrowUpRight } from 'lucide-react';
import { useReadContract, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, keccak256, toHex } from 'viem';
import { getTokenSymbolByAddress } from '../lib/abis';
import { useEscrowCoreContract, useTreasuryVaultContract, useYieldManagerContract } from '../lib/hooks/useGigPayContracts';
import { getJobByOnchainIntent, getReleaseData, recordEscrowFunded, recordEscrowRefunded, recordEscrowReleased, recordEscrowSubmitted } from '../lib/api';

const statusLabels = ['Created', 'Funded', 'Submitted', 'Released', 'Refunded'];

const ERC20_DECIMALS_ABI = [
    {
        type: 'function',
        name: 'decimals',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
    },
] as const;

const CONVERT_TO_ASSETS_ABI = [
    {
        type: 'function',
        name: 'convertToAssets',
        stateMutability: 'view',
        inputs: [{ name: 'shares', type: 'uint256' }],
        outputs: [{ name: 'assets', type: 'uint256' }],
    },
] as const;

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
    const yieldManager = useYieldManagerContract();
    const intentId = useMemo(() => parseIntentId(id), [id]);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [evidenceInput, setEvidenceInput] = useState('');
    const [submittedEvidenceHash, setSubmittedEvidenceHash] = useState<`0x${string}` | null>(null);
    const [releaseError, setReleaseError] = useState<string | null>(null);
    const [jobContext, setJobContext] = useState<{ job: any; milestoneIndex: number } | null>(null);
    const [jobError, setJobError] = useState<string | null>(null);

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
    const { data: actionReceipt, isLoading: isActionLoading, isSuccess: isActionConfirmed } = useWaitForTransactionReceipt({ hash: actionHash });

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
        escrowShares: bigint;
        protectionEnabled: boolean;
    } | undefined;

    const statusLabel = typeof intent?.status === 'number' ? statusLabels[intent.status] || 'Unknown' : 'Unknown';
    const amountSymbol = getTokenSymbolByAddress(intent?.asset);
    const payoutSymbol = getTokenSymbolByAddress(intent?.payoutAsset);
    const amountValue = intent ? intent.amount.toString() : '—';
    const releaseDueDays = intent?.deadline
        ? Math.max(0, Math.ceil((Number(intent.deadline) - Math.floor(Date.now() / 1000)) / 86400))
        : null;

    useEffect(() => {
        if (!intentId) return;
        let mounted = true;
        const run = async () => {
            try {
                setJobError(null);
                const ctx = await getJobByOnchainIntent(intentId.toString());
                if (!mounted) return;
                setJobContext(ctx);
            } catch (e: any) {
                if (!mounted) return;
                setJobContext(null);
                setJobError(e?.message || null);
            }
        };
        run();
        return () => {
            mounted = false;
        };
    }, [intentId]);

    const decimalsRead = useReadContract({
        address: (intent?.asset as `0x${string}` | undefined) || undefined,
        abi: ERC20_DECIMALS_ABI as any,
        functionName: 'decimals',
        query: { enabled: Boolean(intent?.asset) },
    });

    const tokenDecimals = Number(decimalsRead.data ?? 18);

    const strategyRead = useReadContract({
        address: yieldManager.address,
        abi: yieldManager.abi,
        functionName: 'strategies',
        args: intent ? [intent.escrowStrategyId] : undefined,
        query: { enabled: Boolean(yieldManager.address && yieldManager.abi && intent?.escrowYieldEnabled) },
    });

    const strategyAddress = (strategyRead.data as any)?.[0] as `0x${string}` | undefined;

    const convertRead = useReadContract({
        address: strategyAddress,
        abi: CONVERT_TO_ASSETS_ABI as any,
        functionName: 'convertToAssets',
        args: intent ? [intent.escrowShares || 0n] : undefined,
        query: { enabled: Boolean(strategyAddress && intent?.escrowYieldEnabled) },
    });

    const principalFmt = useMemo(() => {
        if (!intent) return '—';
        try {
            return formatUnits(intent.amount, tokenDecimals);
        } catch {
            return intent.amount.toString();
        }
    }, [intent, tokenDecimals]);

    const currentValueFmt = useMemo(() => {
        const v = convertRead.data as bigint | undefined;
        if (!intent?.escrowYieldEnabled || !v) return null;
        try {
            return formatUnits(v, tokenDecimals);
        } catch {
            return v.toString();
        }
    }, [convertRead.data, intent?.escrowYieldEnabled, tokenDecimals]);

    const yieldDeltaFmt = useMemo(() => {
        const v = convertRead.data as bigint | undefined;
        if (!intent?.escrowYieldEnabled || !v || !intent) return null;
        const delta = v - intent.amount;
        try {
            return formatUnits(delta > 0n ? delta : 0n, tokenDecimals);
        } catch {
            return (delta > 0n ? delta : 0n).toString();
        }
    }, [convertRead.data, intent, tokenDecimals]);

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

    const handleRelease = async () => {
        if (!intentId || !escrowCore.address) return;
        setReleaseError(null);

        if (intent?.swapRequired) {
            try {
                const releaseData = await getReleaseData(intentId.toString());
                if (!releaseData.swapData) {
                    setReleaseError('Swap data not configured for this intent.');
                    return;
                }
                setPendingAction('Release');
                writeContract({
                    address: escrowCore.address,
                    abi: escrowCore.abi,
                    functionName: 'releaseWithSwap',
                    args: [intentId, releaseData.swapData],
                });
                return;
            } catch (error) {
                setReleaseError('Unable to prepare swap release.');
                return;
            }
        }

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

    const handleSubmitWork = () => {
        if (!intentId || !escrowCore.address || !evidenceInput.trim()) return;
        const evidenceHash = keccak256(toHex(evidenceInput.trim()));
        setSubmittedEvidenceHash(evidenceHash);
        setPendingAction('Submit');
        writeContract({
            address: escrowCore.address,
            abi: escrowCore.abi,
            functionName: 'submitWork',
            args: [intentId, evidenceHash],
        });
    };

    useEffect(() => {
        if (!isActionConfirmed || !pendingAction || !intentId || !actionHash) return;
        const onchainIntentId = intentId.toString();

        const syncAction = async () => {
            try {
                if (pendingAction === 'Fund') {
                    await recordEscrowFunded(onchainIntentId, { txHash: actionReceipt?.transactionHash || actionHash });
                } else if (pendingAction === 'Submit') {
                    await recordEscrowSubmitted(onchainIntentId, {
                        txHash: actionReceipt?.transactionHash || actionHash,
                        evidenceHash: submittedEvidenceHash || undefined,
                    });
                } else if (pendingAction === 'Release') {
                    await recordEscrowReleased(onchainIntentId, { txHash: actionReceipt?.transactionHash || actionHash });
                } else if (pendingAction === 'Refund') {
                    await recordEscrowRefunded(onchainIntentId, { txHash: actionReceipt?.transactionHash || actionHash });
                }
            } catch {
                // Backend sync is best-effort for UI actions.
            } finally {
                setPendingAction(null);
            }
        };

        syncAction();
    }, [isActionConfirmed, pendingAction, intentId, actionHash, actionReceipt, submittedEvidenceHash]);

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/payments" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
                        <ArrowLeft size={18} className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Payment {intentId ? `PI-${intentId.toString()}` : id}</h1>
                        <div className="text-slate-500 text-sm">
                            Review status, evidence, and approvals.
                            {jobContext?.job?.id && (
                                <span className="ml-2">
                                    ·{' '}
                                    <Link to={`/explore/${jobContext.job.id}`} className="text-blue-400 hover:text-blue-300 font-bold">
                                        {jobContext.job.title} (Milestone {jobContext.milestoneIndex})
                                    </Link>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {jobContext?.job?.milestones?.length ? (
                            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-300 border border-cyan-500/20">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Progress</div>
                                            <div className="text-sm font-bold text-white">{jobContext.job.title}</div>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/explore/${jobContext.job.id}`}
                                        className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                                    >
                                        View Job <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                                    {jobContext.job.milestones.map((m: any) => {
                                        const isActive = Number(m.index) === Number(jobContext.milestoneIndex);
                                        const isDone = String(m.escrowIntent?.status || '').toUpperCase() === 'RELEASED';
                                        return (
                                            <div
                                                key={m.id}
                                                className={`min-w-[180px] rounded-xl border p-3 ${isActive
                                                    ? 'border-primary/40 bg-primary/10'
                                                    : 'border-white/5 bg-white/[0.02]'}`}
                                            >
                                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Milestone {m.index}</div>
                                                <div className="mt-1 text-sm font-bold text-slate-200 line-clamp-2">{m.title}</div>
                                                <div className="mt-2 text-xs text-slate-500">
                                                    {isDone ? 'Completed' : isActive ? 'Active' : 'Pending'} · {m.percentage}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {jobError && <div className="mt-3 text-xs text-slate-500">{jobError}</div>}
                            </div>
                        ) : null}

                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-6">Activity Timeline</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                        <DollarSign size={24} />
                                    </div>
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

                        {intent?.escrowYieldEnabled && (
                            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                                <h4 className="text-white font-bold mb-4">Escrow Yield</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Principal</span>
                                        <span className="text-white font-mono">{principalFmt} {amountSymbol}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Current Value (est.)</span>
                                        <span className="text-white font-mono">{currentValueFmt ?? '—'} {amountSymbol}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Yield Accrued (est.)</span>
                                        <span className="text-emerald-400 font-mono">+ {yieldDeltaFmt ?? '—'} {amountSymbol}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {statusLabel === 'Released' && (
                            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                                <h4 className="text-white font-bold mb-2">Settlement Receipt</h4>
                                <p className="text-xs text-slate-500">Estimated values based on current strategy conversion.</p>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Principal</div>
                                        <div className="mt-1 text-white font-mono font-bold">{principalFmt} {amountSymbol}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Yield</div>
                                        <div className="mt-1 text-emerald-300 font-mono font-bold">+ {yieldDeltaFmt ?? '—'} {amountSymbol}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Total (est.)</div>
                                        <div className="mt-1 text-blue-200 font-mono font-bold">{currentValueFmt ?? principalFmt} {amountSymbol}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-white font-bold mb-4">Actions</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evidence Summary</label>
                                    <textarea
                                        value={evidenceInput}
                                        onChange={(event) => setEvidenceInput(event.target.value)}
                                        rows={3}
                                        placeholder="Describe delivered work or provide a proof reference."
                                        className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0b1220] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                                    />
                                    {submittedEvidenceHash && (
                                        <p className="mt-2 text-xs text-slate-400">Evidence hash: {submittedEvidenceHash.slice(0, 10)}…{submittedEvidenceHash.slice(-8)}</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleSubmitWork}
                                    disabled={isActionLoading || !intentId || !evidenceInput.trim()}
                                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all disabled:opacity-60"
                                >
                                    {pendingAction === 'Submit' && isActionLoading ? 'Submitting...' : 'Submit Work'}
                                </button>
                                <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleFund}
                                    disabled={isActionLoading || !intentId}
                                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all"
                                >
                                    {pendingAction === 'Fund' && isActionLoading ? 'Processing...' : 'Fund Escrow'}
                                </button>
                                <button
                                    onClick={handleRelease}
                                    disabled={isActionLoading || !intentId}
                                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all"
                                >
                                    {pendingAction === 'Release' && isActionLoading ? 'Processing...' : intent?.swapRequired ? 'Release With Swap' : 'Approve Release'}
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
                        {releaseError && (
                            <div className="mt-3 text-xs text-red-300">{releaseError}</div>
                        )}
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
                                    <span>Swap Required</span>
                                    <span className="text-white">{intent?.swapRequired ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Protection</span>
                                    <span className="text-white">{intent?.protectionEnabled ? 'Enabled' : 'Not Enabled'}</span>
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
                            <ShieldCheck className="text-blue-400 shrink-0" size={20} />
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
