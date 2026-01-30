import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, FileText, ShieldCheck } from 'lucide-react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { getJob, joinJob } from '../lib/api';

const shortAddr = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—');

export const ExploreJob: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [pollingOnchain, setPollingOnchain] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getJob(jobId);
        if (!mounted) return;
        setJob(data.job);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Unable to load job.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  const refreshJob = async () => {
    if (!jobId) return null;
    const data = await getJob(jobId);
    setJob(data.job);
    return data.job;
  };

  const milestones = useMemo(() => {
    const rows = Array.isArray(job?.milestones) ? job.milestones : [];
    return rows.slice().sort((a: any, b: any) => Number(a.index || 0) - Number(b.index || 0));
  }, [job]);

  const recipient = useMemo(() => {
    const first = milestones[0]?.escrowIntent?.recipient;
    return first || null;
  }, [milestones]);

  const firstOnchain = useMemo(() => {
    for (const m of milestones) {
      const id = m?.escrowIntent?.onchainIntentId;
      if (id != null) return String(id);
    }
    return null;
  }, [milestones]);

  const handleJoin = async () => {
    if (!jobId) return;
    if (!isConnected || !address) {
      toast.error('Connect your wallet to join.');
      return;
    }
    try {
      setJoining(true);
      await joinJob(jobId, { address });
      toast.success('Joined. Opening the first milestone…');
      if (firstOnchain) {
        navigate(`/payments/${firstOnchain}`);
        return;
      }

      // Auto-poll until the on-chain intent is linked, then route to it.
      setPollingOnchain(true);
      toast.message('Waiting for on-chain escrow intent…');
      let attempts = 0;
      const maxAttempts = 20;
      while (attempts < maxAttempts) {
        // eslint-disable-next-line no-await-in-loop
        const nextJob = await refreshJob();
        const rows = Array.isArray(nextJob?.milestones) ? nextJob.milestones : [];
        const onchain = rows.find((m: any) => m?.escrowIntent?.onchainIntentId != null)?.escrowIntent?.onchainIntentId;
        if (onchain != null) {
          setPollingOnchain(false);
          navigate(`/payments/${String(onchain)}`);
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 2500));
        attempts += 1;
      }
      setPollingOnchain(false);
      toast.message('This job is not on-chain yet. Try again soon.');
    } catch (e: any) {
      toast.error(e?.message || 'Unable to join.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-slate-400">Loading…</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-300">{error || 'Job not found.'}</div>
          <div className="mt-6">
            <Link to="/explore" className="text-blue-400 hover:text-blue-300 text-sm font-bold">
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/explore" className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} className="text-slate-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <p className="text-slate-500 text-sm">
              Created by {shortAddr(job.createdBy)} · {milestones.length} milestones
            </p>
          </div>
          <button
            onClick={handleJoin}
            disabled={joining || pollingOnchain}
            className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all disabled:opacity-60"
          >
            {joining ? 'Joining…' : pollingOnchain ? 'Waiting for on-chain…' : 'Join & Open'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800 rounded-lg text-cyan-300">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overview</div>
                  <div className="mt-2 text-slate-200 text-sm leading-relaxed">{job.description || job.notes || '—'}</div>
                  {recipient && (
                    <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient</div>
                      <div className="mt-2 text-sm text-slate-200 font-bold">
                        {recipient.displayName} <span className="text-slate-500 font-normal">({recipient.entityType})</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Method: {recipient?.payout?.payoutMethod || '—'}{' '}
                        {recipient?.payout?.payoutAddress ? (
                          <span className="font-mono text-slate-300">({String(recipient.payout.payoutAddress).slice(0, 6)}…{String(recipient.payout.payoutAddress).slice(-4)})</span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Preferred asset: <span className="text-slate-300 font-bold">{recipient?.payout?.preferredAsset || job.payoutAsset || '—'}</span>
                      </div>
                    </div>
                  )}
                  {!!job.tags?.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.slice(0, 10).map((t: string) => (
                        <span key={t} className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-blue-500/10 border-blue-500/20 text-blue-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-bold">Milestones</h4>
                <div className="text-xs text-slate-500 font-mono">{milestones.length} total</div>
              </div>

              <div className="mt-4 space-y-3">
                {milestones.map((m: any) => {
                  const onchain = m?.escrowIntent?.onchainIntentId != null ? String(m.escrowIntent.onchainIntentId) : null;
                  const status = m?.escrowIntent?.status || '—';
                  return (
                    <div key={m.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-200">
                            {m.index}. {m.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {m.percentage}% · due {m.dueDays ?? '—'} days · status {String(status)}
                          </div>
                        </div>
                        <button
                          disabled={!onchain}
                          onClick={() => onchain && navigate(`/payments/${onchain}`)}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition-all disabled:opacity-60 flex items-center gap-2"
                        >
                          {onchain ? `Open PI-${onchain}` : 'Not on-chain'}
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-white font-bold mb-4">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Total</span>
                  <span className="text-white font-mono">{String(job.totalAmount)} {job.fundingAsset}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payout Asset</span>
                  <span className="text-white">{job.payoutAsset}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Yield</span>
                  <span className="text-white">{job.enableYield ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Protection</span>
                  <span className="text-white">{job.enableProtection ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 flex gap-3">
              <ShieldCheck className="text-blue-400 shrink-0" size={20} />
              <p className="text-xs text-slate-400 leading-relaxed">
                Joining is off-chain (for discovery). Escrow actions happen on-chain per milestone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

