import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GlassCard, Button } from '../components/treasury/yield-aggregator/ui';
import { getJobs, getPaymentIntents, getTreasuryActivity, getTreasuryHistory, getTreasuryOverview } from '../lib/api';
import { useTreasuryOpsFallback } from '../hooks/useTreasuryOpsFallback';
import { useTreasuryOpsActivityFallback } from '../hooks/useTreasuryOpsActivityFallback';
import { useTreasuryOpsTimeseries } from '../hooks/useTreasuryOpsTimeseries';
import { useTreasuryOpsPaymentsFallback } from '../hooks/useTreasuryOpsPaymentsFallback';
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useTreasuryVaultContract } from '../lib/hooks/useGigPayContracts';
import { getTokenAddress } from '../lib/abis';
import { useGigPayRegistry } from '../lib/hooks/useGigPayRegistry';
import { formatUnits, parseUnits } from 'viem';

type TreasuryOverview = Awaited<ReturnType<typeof getTreasuryOverview>>;
type TreasuryHistory = Awaited<ReturnType<typeof getTreasuryHistory>>;

const toNum = (v: unknown) => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : 0;
  return Number.isFinite(n) ? n : 0;
};

const shortHash = (hash?: string | null) => {
  if (!hash) return '';
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
};

const fmt = (v: unknown) => {
  const n = toNum(v);
  if (n === 0) return '0';
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(4);
};

const withTimeout = async <T,>(promise: Promise<T>, ms = 6_000): Promise<T> => {
  let id: number | undefined;
  const timeout = new Promise<T>((_resolve, reject) => {
    id = window.setTimeout(() => reject(new Error('Backend request timed out')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (id != null) window.clearTimeout(id);
  }
};

export const TreasuryOps: React.FC = () => {
  const navigate = useNavigate();
  const chainId = useChainId();
  const { address } = useAccount();
  const treasuryVault = useTreasuryVaultContract();
  const { yieldManagerAddress } = useGigPayRegistry();
  const [mode, setMode] = useState<'backend' | 'fallback'>('backend');
  const [overview, setOverview] = useState<TreasuryOverview | null>(null);
  const [history, setHistory] = useState<TreasuryHistory | null>(null);
  const [activity, setActivity] = useState<any[] | null>(null);
  const [paymentIntents, setPaymentIntents] = useState<any[] | null>(null);
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Yield actions (operator only) ---
  const [yieldAsset, setYieldAsset] = useState<'IDRX' | 'USDC' | 'USDT' | 'DAI' | 'EURC'>('IDRX');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');

  const yieldAssetAddress = getTokenAddress(yieldAsset) as `0x${string}` | undefined;

  const isOperatorRead = useReadContract({
    address: treasuryVault.address as `0x${string}` | undefined,
    abi: treasuryVault.abi as any,
    functionName: 'operators',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(treasuryVault.address && treasuryVault.abi && address) },
  });
  const isOperator = Boolean(isOperatorRead.data);

  const assetConfigRead = useReadContract({
    address: treasuryVault.address as `0x${string}` | undefined,
    abi: treasuryVault.abi as any,
    functionName: 'assetConfig',
    args: yieldAssetAddress ? [yieldAssetAddress] : undefined,
    query: { enabled: Boolean(treasuryVault.address && treasuryVault.abi && yieldAssetAddress) },
  });

  const yieldSharesRead = useReadContract({
    address: treasuryVault.address as `0x${string}` | undefined,
    abi: treasuryVault.abi as any,
    functionName: 'yieldShares',
    args: yieldAssetAddress ? [yieldAssetAddress] : undefined,
    query: { enabled: Boolean(treasuryVault.address && treasuryVault.abi && yieldAssetAddress) },
  });

  const tokenDecimalsRead = useReadContract({
    address: yieldAssetAddress,
    abi: [
      {
        type: 'function',
        name: 'decimals',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
      },
    ] as const,
    functionName: 'decimals',
    query: { enabled: Boolean(yieldAssetAddress) },
  });

  const tokenDecimals = Number(tokenDecimalsRead.data ?? 18);
  const parsedDepositAmount = useMemo(() => {
    if (!depositAmount) return 0n;
    try {
      return parseUnits(depositAmount, tokenDecimals);
    } catch {
      return 0n;
    }
  }, [depositAmount, tokenDecimals]);

  const cfg = assetConfigRead.data as any;
  const cfgEnabled = Boolean(cfg?.[0]);
  const cfgStrategyId = Number(cfg?.[1] ?? 0);
  const cfgBufferBps = Number(cfg?.[2] ?? 0);
  const shares = (yieldSharesRead.data as bigint | undefined) ?? 0n;

  const yieldManagerStrategiesRead = useReadContract({
    address: yieldManagerAddress as `0x${string}` | undefined,
    abi: [
      {
        type: 'function',
        name: 'strategies',
        stateMutability: 'view',
        inputs: [{ name: '', type: 'uint32' }],
        outputs: [
          { name: 'strategy', type: 'address' },
          { name: 'allowed', type: 'bool' },
        ],
      },
    ] as const,
    functionName: 'strategies',
    args: cfgStrategyId ? [cfgStrategyId] : undefined,
    query: { enabled: Boolean(yieldManagerAddress && cfgStrategyId) },
  });

  const strategyAddress = (yieldManagerStrategiesRead.data as any)?.[0] as `0x${string}` | undefined;
  const strategyAllowed = Boolean((yieldManagerStrategiesRead.data as any)?.[1]);

  const convertToAssetsRead = useReadContract({
    address: strategyAddress,
    abi: [
      {
        type: 'function',
        name: 'convertToAssets',
        stateMutability: 'view',
        inputs: [{ name: 'shares', type: 'uint256' }],
        outputs: [{ name: 'assets', type: 'uint256' }],
      },
    ] as const,
    functionName: 'convertToAssets',
    args: shares ? [shares] : undefined,
    query: { enabled: Boolean(strategyAddress && shares) },
  });

  const estimatedAssetsOut = (convertToAssetsRead.data as bigint | undefined) ?? 0n;
  const sharesFmt = useMemo(() => (shares ? shares.toString() : '0'), [shares]);
  const estAssetsFmt = useMemo(() => {
    try {
      return formatUnits(estimatedAssetsOut, tokenDecimals);
    } catch {
      return estimatedAssetsOut.toString();
    }
  }, [estimatedAssetsOut, tokenDecimals]);

  const { writeContract, data: yieldTxHash, isPending: isYieldTxPending } = useWriteContract();
  const { isLoading: isYieldTxConfirming, isSuccess: isYieldTxConfirmed } = useWaitForTransactionReceipt({ hash: yieldTxHash });
  const [yieldAction, setYieldAction] = useState<'deposit' | 'withdraw' | null>(null);

  const parseBigIntSafe = (v: string) => {
    try {
      const s = v.trim();
      if (!s) return 0n;
      if (!/^\d+$/.test(s)) return 0n;
      return BigInt(s);
    } catch {
      return 0n;
    }
  };

  const withdrawSharesParsed = useMemo(() => parseBigIntSafe(withdrawShares), [withdrawShares]);

  const fallbackTotals = useTreasuryOpsFallback({ enabled: mode === 'fallback' });
  const fallbackActivity = useTreasuryOpsActivityFallback({ enabled: mode === 'fallback', limit: 100 });
  const fallbackPayments = useTreasuryOpsPaymentsFallback({ enabled: mode === 'fallback', maxItems: 20 });
  const tsKey = useMemo(() => {
    const addr = treasuryVault.address || 'unknown';
    return `gigpay:ops_ts:${chainId}:${addr}`;
  }, [chainId, treasuryVault.address]);

  const fallbackTimeseries = useTreasuryOpsTimeseries({
    enabled: mode === 'fallback',
    storageKey: tsKey,
    sampleMs: 60_000,
    current:
      mode === 'fallback'
        ? {
          idle: toNum(fallbackTotals.totals.idle),
          yieldDeployed: toNum(fallbackTotals.totals.yieldDeployed),
          escrowLocked: toNum(fallbackTotals.totals.escrowLocked),
          total: toNum(fallbackTotals.totals.total),
        }
        : null,
  });

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const [ov, hist, act, payments] = await Promise.all([
          withTimeout(getTreasuryOverview(), 6_000),
          withTimeout(getTreasuryHistory(range), 6_000),
          withTimeout(getTreasuryActivity({ limit: 100 }), 6_000),
          withTimeout(getPaymentIntents(), 6_000),
        ]);
        if (!mounted) return;
        setMode('backend');
        setOverview(ov);
        setHistory(hist);
        setActivity(act.rows || []);
        setPaymentIntents(payments.intents || []);
      } catch (e: any) {
        if (!mounted) return;
        setMode('fallback');
        setError(e?.message || 'Backend unavailable — showing on-chain fallback data.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [range]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (mode !== 'backend') return;
      if (!address) {
        setJobs([]);
        return;
      }
      try {
        const data = await withTimeout(getJobs({ createdBy: address, includePrivate: true }), 6_000);
        if (!mounted) return;
        setJobs(data.jobs || []);
      } catch {
        if (!mounted) return;
        setJobs([]);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [mode, address]);

  const allocationData = useMemo(() => {
    const t = mode === 'backend' ? overview?.totals : fallbackTotals.totals;
    if (!t) return [];
    return [
      { name: 'Idle', value: toNum(t.idle) },
      { name: 'Yield', value: toNum(t.yieldDeployed) },
      { name: 'Escrow', value: toNum(t.escrowLocked) },
    ].filter((x) => x.value > 0);
  }, [mode, overview, fallbackTotals.totals]);

  const pieColors = ['#60a5fa', '#34d399', '#f59e0b'];

  const historyRows = useMemo(() => {
    if (mode === 'backend') {
      const rows = history?.rows || [];
      // Combined snapshots have assetSymbol null.
      return rows
        .filter((r: any) => r.assetSymbol == null)
        .map((r: any) => ({
          t: new Date(r.timestamp).toLocaleDateString(),
          total: toNum(r.total),
          idle: toNum(r.idle),
          yield: toNum(r.yieldDeployed),
          escrow: toNum(r.escrowLocked),
        }));
    }

    return fallbackTimeseries.getRange(range).map((p) => ({
      t: new Date(p.t).toLocaleDateString(),
      total: p.total,
      idle: p.idle,
      yield: p.yieldDeployed,
      escrow: p.escrowLocked,
    }));
  }, [mode, history, fallbackTimeseries, range]);

  const jobsInProgress = useMemo(() => {
    const js = jobs || [];
    return js
      .map((j: any) => {
        const milestones = Array.isArray(j.milestones) ? j.milestones : [];
        const total = milestones.length || 0;
        const done = milestones.filter((m: any) => ['RELEASED', 'REFUNDED'].includes(m?.escrowIntent?.status)).length;
        const active = total - done;
        return { job: j, total, done, active };
      })
      .filter((x) => x.total > 0)
      .sort((a, b) => b.active - a.active);
  }, [jobs]);

  const activityRows = useMemo(() => {
    return (mode === 'backend' ? activity : fallbackActivity.rows) || [];
  }, [mode, activity, fallbackActivity.rows]);

  const severityClass = (sev?: string) => {
    if (sev === 'success') return 'border-emerald-500/20 bg-emerald-500/5';
    if (sev === 'warning') return 'border-amber-500/20 bg-amber-500/5';
    return 'border-white/5 bg-white/[0.02]';
  };

  const canWriteYield = Boolean(
    isOperator &&
    treasuryVault.address &&
    treasuryVault.abi &&
    yieldAssetAddress &&
    cfgEnabled &&
    cfgStrategyId &&
    strategyAllowed
  );

  const handleDepositToYield = () => {
    if (!canWriteYield) return;
    if (!yieldAssetAddress || parsedDepositAmount === 0n) return;
    setYieldAction('deposit');
    writeContract({
      address: treasuryVault.address as `0x${string}`,
      abi: treasuryVault.abi as any,
      functionName: 'depositToYield',
      args: [yieldAssetAddress, parsedDepositAmount],
    });
  };

  const handleWithdrawFromYield = () => {
    if (!canWriteYield) return;
    if (!yieldAssetAddress || withdrawSharesParsed === 0n) return;
    setYieldAction('withdraw');
    writeContract({
      address: treasuryVault.address as `0x${string}`,
      abi: treasuryVault.abi as any,
      functionName: 'withdrawFromYield',
      args: [yieldAssetAddress, withdrawSharesParsed],
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-purple-500/10 blur-[140px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-display">
              Treasury Ops
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Allocation (idle / yield / escrow), history snapshots, and backend-indexed activity.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
            {(['7d', '30d', '90d', '1y', 'all'] as const).map((r) => (
              <Button
                key={r}
                variant={r === range ? 'default' : 'ghost'}
                className={`h-9 px-4 text-xs font-bold uppercase tracking-wider transition-all ${r === range
                  ? 'bg-blue-600 shadow-lg shadow-blue-500/25 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                onClick={() => setRange(r)}
                disabled={loading}
              >
                {r.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6">
          <GlassCard className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-400 font-bold">Yield actions (treasury vault)</div>
                <div className="text-xs text-slate-500 mt-1">
                  Operator-gated: deposit idle funds into yield or withdraw shares back to treasury.
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {address ? (
                  <span className={`font-bold ${isOperator ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isOperator ? 'Operator' : 'Not operator'}
                  </span>
                ) : (
                  <span className="text-slate-500">Connect wallet</span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Asset</div>
                <select
                  value={yieldAsset}
                  onChange={(e) => setYieldAsset(e.target.value as any)}
                  className="mt-2 w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                >
                  {(['IDRX', 'USDC', 'USDT', 'DAI', 'EURC'] as const).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">enabled</span>
                    <span className="font-mono text-slate-200">{cfgEnabled ? 'true' : 'false'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">strategyId</span>
                    <span className="font-mono text-slate-200">{String(cfgStrategyId || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">bufferBps</span>
                    <span className="font-mono text-slate-200">{String(cfgBufferBps || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Position</div>
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">shares</span>
                    <span className="font-mono text-slate-200">{sharesFmt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">est. assets</span>
                    <span className="font-mono text-slate-200">{estAssetsFmt} {yieldAsset}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">strategy</span>
                    <span className="font-mono text-slate-200">
                      {strategyAddress ? `${strategyAddress.slice(0, 6)}…${strategyAddress.slice(-4)}` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">allowed</span>
                    <span className={`font-mono ${strategyAllowed ? 'text-emerald-400' : 'text-red-300'}`}>
                      {strategyAllowed ? 'true' : 'false'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-500">
                  Withdraw uses raw share units (uint256). Deposit uses token decimals ({String(tokenDecimals)}).
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deposit to yield</div>
                  <input
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={`Amount in ${yieldAsset}`}
                    className="mt-2 w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={handleDepositToYield}
                    disabled={!canWriteYield || parsedDepositAmount === 0n || isYieldTxPending || isYieldTxConfirming}
                    className="mt-3 w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-sm"
                  >
                    {yieldAction === 'deposit' && (isYieldTxPending || isYieldTxConfirming) ? 'Depositing…' : 'Deposit'}
                  </button>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Withdraw from yield</div>
                  <input
                    value={withdrawShares}
                    onChange={(e) => setWithdrawShares(e.target.value)}
                    placeholder="Shares (uint256)"
                    className="mt-2 w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={handleWithdrawFromYield}
                    disabled={!canWriteYield || withdrawSharesParsed === 0n || isYieldTxPending || isYieldTxConfirming}
                    className="mt-3 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-sm"
                  >
                    {yieldAction === 'withdraw' && (isYieldTxPending || isYieldTxConfirming) ? 'Withdrawing…' : 'Withdraw'}
                  </button>
                </div>

                {yieldTxHash && (
                  <div className="text-xs text-slate-500">
                    tx: <span className="font-mono text-slate-300">{shortHash(String(yieldTxHash))}</span>{' '}
                    {isYieldTxConfirmed ? <span className="text-emerald-400 font-bold">confirmed</span> : null}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <GlassCard className="p-5">
            <div className="text-sm text-slate-400 font-bold">Totals</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total</span>
                <span className="font-bold">{fmt(mode === 'backend' ? overview?.totals?.total : fallbackTotals.totals.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Idle</span>
                <span className="font-bold">{fmt(mode === 'backend' ? overview?.totals?.idle : fallbackTotals.totals.idle)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Yield</span>
                <span className="font-bold">{fmt(mode === 'backend' ? overview?.totals?.yieldDeployed : fallbackTotals.totals.yieldDeployed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Escrow</span>
                <span className="font-bold">{fmt(mode === 'backend' ? overview?.totals?.escrowLocked : fallbackTotals.totals.escrowLocked)}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 lg:col-span-1">
            <div className="text-sm text-slate-400 font-bold">Allocation</div>
            <div className="h-56 mt-3">
              {allocationData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80}>
                      {allocationData.map((_, idx) => (
                        <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => fmt(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  {loading ? 'Loading…' : 'No allocation data yet.'}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5 lg:col-span-1">
            <div className="text-sm text-slate-400 font-bold">Per-asset</div>
            <div className="mt-4 space-y-2">
              {((mode === 'backend' ? overview?.perAsset : fallbackTotals.perAsset) || []).map((a: any) => (
                <div key={a.symbol} className="flex items-center justify-between text-sm">
                  <div className="text-slate-300 font-bold">{a.symbol}</div>
                  <div className="text-slate-400">idle {fmt(a.idle)} · yield {fmt(a.yieldDeployed)} · escrow {fmt(a.escrowLocked)}</div>
                </div>
              ))}
              {!(mode === 'backend' ? overview?.perAsset?.length : fallbackTotals.perAsset?.length) && (
                <div className="text-slate-500 text-sm">{loading ? 'Loading…' : 'No assets found.'}</div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400 font-bold">History (combined)</div>
            </div>
            <div className="h-80 mt-4">
              {historyRows.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyRows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="t" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => fmt(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#e2e8f0" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="idle" stroke="#60a5fa" dot={false} />
                    <Line type="monotone" dataKey="yield" stroke="#34d399" dot={false} />
                    <Line type="monotone" dataKey="escrow" stroke="#f59e0b" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  {loading ? 'Loading…' : 'No snapshots yet (snapshot loop writes periodically).'}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="text-sm text-slate-400 font-bold">Activity</div>
            <div className="mt-4 space-y-3 max-h-[22rem] overflow-auto pr-1">
              {activityRows.map((e: any) => {
                const ui = e.ui || {};
                const title = ui.title || `${e.source} · ${e.eventName}`;
                const jobTitle = ui.job?.title;
                const jobId = ui.job?.id;
                const milestoneIndex = ui.milestone?.index;
                const recipient = ui.recipient;
                const intentId = e.onchainIntentId != null ? String(e.onchainIntentId) : null;
                const amount = e.amount != null ? fmt(e.amount) : null;
                const asset = typeof e.asset === 'string' ? e.asset : null;
                return (
                  <div key={e.id} className={`rounded-xl border p-3 ${severityClass(ui.severity)}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-bold text-slate-200 text-sm">{title}</div>
                      <div className="text-xs text-slate-500">{shortHash(e.txHash)}</div>
                    </div>

                    <div className="mt-1 text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>
                        block {String(e.blockNumber)} · log {String(e.logIndex)}
                      </span>
                      {intentId ? (
                        <>
                          <span className="text-slate-600">·</span>
                          <Link to={`/payments/${intentId}`} className="text-blue-400 hover:text-blue-300">
                            intent {intentId}
                          </Link>
                        </>
                      ) : null}
                      {amount ? (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="font-mono text-slate-300">
                            {amount}
                            {asset ? ` (${asset.slice(0, 6)}…${asset.slice(-4)})` : ''}
                          </span>
                        </>
                      ) : null}
                    </div>

                    {(jobTitle || recipient) && (
                      <div className="mt-2 text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                        {jobTitle && jobId ? (
                          <>
                            <Link to={`/explore/${jobId}`} className="text-slate-200 hover:text-white font-bold">
                              {jobTitle}
                            </Link>
                            {milestoneIndex != null ? (
                              <span className="text-slate-500">· milestone {String(milestoneIndex) + 1}</span>
                            ) : null}
                          </>
                        ) : null}
                        {recipient ? (
                          <>
                            <span className="text-slate-600">·</span>
                            <span>recipient {recipient}</span>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}

              {!activityRows.length && (
                <div className="text-slate-500 text-sm">
                  {loading || (mode === 'fallback' && fallbackActivity.isLoading) ? 'Loading…' : 'No activity found.'}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="mt-6">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-400 font-bold">Jobs in progress</div>
                <div className="text-xs text-slate-500 mt-1">
                  {mode === 'backend' ? 'Your published jobs and milestone completion.' : 'Unavailable in fallback mode.'}
                </div>
              </div>
              <Link to="/explore" className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider">
                View explore
              </Link>
            </div>

            {mode !== 'backend' ? (
              <div className="mt-4 text-slate-500 text-sm">Switch to backend mode to see maker job progress.</div>
            ) : !address ? (
              <div className="mt-4 text-slate-500 text-sm">Connect your wallet to load your jobs.</div>
            ) : jobs == null ? (
              <div className="mt-4 text-slate-500 text-sm">{loading ? 'Loading…' : 'Loading jobs…'}</div>
            ) : !jobsInProgress.length ? (
              <div className="mt-4 text-slate-500 text-sm">No jobs found.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {jobsInProgress.slice(0, 8).map(({ job, total, done }: any) => {
                  const pct = total ? Math.round((done / total) * 100) : 0;
                  const first = Array.isArray(job.milestones) ? job.milestones.find((m: any) => m?.escrowIntent?.onchainIntentId != null) : null;
                  const firstIntentId = first?.escrowIntent?.onchainIntentId != null ? String(first.escrowIntent.onchainIntentId) : null;
                  return (
                    <div key={job.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/explore/${job.id}`} className="font-bold text-slate-200 hover:text-white">
                            {job.title}
                          </Link>
                          <div className="mt-1 text-xs text-slate-500">
                            {done}/{total} milestones completed · {pct}%
                          </div>
                        </div>
                        {firstIntentId ? (
                          <Link
                            to={`/payments/${firstIntentId}`}
                            className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider"
                          >
                            Open
                          </Link>
                        ) : null}
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-blue-500/70" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="mt-6">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-400 font-bold">Payments</div>
                <div className="text-xs text-slate-500 mt-1">
                  {mode === 'backend'
                    ? 'Resume incomplete intents or jump to on-chain payment details.'
                    : 'Backend drafts unavailable in fallback. Showing recent on-chain intents.'}
                </div>
              </div>
              <Link to="/payments/new" className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider">
                New payment
              </Link>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-white/5">
                  <tr>
                    <th className="py-3 pr-4">Payment</th>
                    <th className="py-3 pr-4">Recipient</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Asset</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {((mode === 'backend' ? paymentIntents : null) || []).slice(0, 20).map((p: any) => {
                    const hasOnchain = p.onchainIntentId != null;
                    const label = hasOnchain ? `PI-${String(p.onchainIntentId)}` : `Draft-${String(p.id).slice(0, 8)}`;
                    const amount = p.amount ?? '—';
                    const asset = p.fundingAsset ?? '—';
                    const recipient = p.recipient?.displayName ?? '—';
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4 font-bold text-slate-200">{label}</td>
                        <td className="py-3 pr-4 text-slate-300">{recipient}</td>
                        <td className="py-3 pr-4 font-mono text-slate-200">{String(amount)}</td>
                        <td className="py-3 pr-4 text-slate-300">{asset}</td>
                        <td className="py-3 pr-4 text-slate-300">{String(p.status || '—')}</td>
                        <td className="py-3 text-right">
                          {hasOnchain ? (
                            <Link
                              to={`/payments/${String(p.onchainIntentId)}`}
                              className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider"
                            >
                              Continue
                            </Link>
                          ) : (
                            <button
                              className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider"
                              onClick={() => navigate('/payments/new', { state: { resumeEscrowIntent: p } })}
                            >
                              Continue
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {mode === 'fallback' &&
                    fallbackPayments.rows.map((p) => (
                      <tr key={p.key} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4 font-bold text-slate-200">{p.label}</td>
                        <td className="py-3 pr-4 text-slate-300">{p.recipient}</td>
                        <td className="py-3 pr-4 font-mono text-slate-200">{p.amount}</td>
                        <td className="py-3 pr-4 text-slate-300">{p.asset}</td>
                        <td className="py-3 pr-4 text-slate-300">{p.status}</td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/payments/${p.onchainIntentId}`}
                            className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-wider"
                          >
                            Continue
                          </Link>
                        </td>
                      </tr>
                    ))}

                  {mode === 'backend' && !paymentIntents?.length && (
                    <tr>
                      <td className="py-4 text-slate-500 text-sm" colSpan={6}>
                        {loading ? 'Loading…' : 'No payment intents yet.'}
                      </td>
                    </tr>
                  )}

                  {mode === 'fallback' && !fallbackPayments.rows.length && (
                    <tr>
                      <td className="py-4 text-slate-500 text-sm" colSpan={6}>
                        {loading || fallbackPayments.isLoading ? 'Loading…' : 'No on-chain intents found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

