import React from 'react';
import { CheckCircle2, FileText, Layers, Wallet, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';

type QueueItem = { milestoneIndex: number; escrowIntentId: string; amountRaw: string; deadlineDays: number };
type LinkedItem = { milestoneIndex: number; escrowIntentId: string; onchainIntentId: string; txHash: string };

interface Step5Props {
    data: PaymentData;
    onConfirm: () => void | Promise<void>;
    confirmDisabled: boolean;
    isProcessing: boolean;
    error?: string | null;
    jobId?: string | null;
    queue: QueueItem[];
    linked: LinkedItem[];
}

export const Step5Review: React.FC<Step5Props> = ({ data, onConfirm, confirmDisabled, isProcessing, error, jobId, queue, linked }) => {
    const isMilestoneFlow = data.timing.releaseCondition === 'ON_MILESTONE';
    const nextMilestone = linked.length + 1;
    const totalMilestones = queue.length || (isMilestoneFlow ? data.milestones.items.length : 1);

    const ctaLabel =
        queue.length > 0
            ? linked.length >= queue.length
                ? 'Completed'
                : `Confirm Milestone ${nextMilestone}/${queue.length}`
            : isProcessing
                ? 'Processing…'
                : 'Confirm';

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-primary">❖</span> Review & Confirm
            </h2>

            {data.job.publish && (
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-slate-800 text-cyan-300">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Explore Listing</h4>
                            <div className="text-lg font-bold text-white">{data.job.title}</div>
                            <div className="text-xs text-slate-400 mt-1">{data.job.description}</div>
                            {!!data.job.tags.length && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {data.job.tags.slice(0, 6).map((t) => (
                                        <span key={t} className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-500/20 bg-blue-500/10 text-blue-300">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {jobId && (
                                <div className="mt-3 text-xs text-slate-500">
                                    Job ID: <span className="font-mono text-slate-300">{jobId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-2xl p-6">
                    <div className="bg-[#0a0a0a] rounded-xl p-4 border border-slate-800 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Recipient</h4>
                            <p className="text-lg font-bold text-white mb-1 underline decoration-blue-500/30 underline-offset-4 decoration-2">
                                {data.recipient.identity.displayName || 'Unnamed Entity'}
                            </p>
                            <p className="text-slate-400 text-sm mb-2">{data.recipient.identity.entityType} • {data.recipient.identity.email}</p>
                            <p className="text-slate-500 text-xs font-mono break-all">{data.recipient.payout.payoutAddress || '—'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-purple-400">
                            <Layers size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Timing & Conditions</h4>
                            <div className="space-y-2 text-sm text-slate-300">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Release Condition</span>
                                    <span>{data.timing.releaseCondition}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Deadline</span>
                                    <span>{data.timing.deadline}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Yield</span>
                                    <span>{data.timing.enableYield ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Protection</span>
                                    <span>{data.timing.enableProtection ? 'Enabled' : 'Disabled'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-green-400">
                            <Wallet size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Summary</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-slate-300">Total Amount</span>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {data.amount.value}{' '}
                                    <span className="text-primary text-lg">{data.amount.fundingAsset}</span>
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span className="text-slate-500">Funding Asset</span>
                                <span className="text-white">{data.amount.fundingAsset}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span className="text-slate-500">Payout Asset</span>
                                <span className="text-white">{data.amount.payoutAsset}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span className="text-slate-500">Split Recipients</span>
                                <span className="text-white">{data.split.recipients.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isMilestoneFlow && (
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-bold text-slate-300 uppercase tracking-wider">Milestones</div>
                        <div className="text-xs text-slate-500 font-mono">
                            {linked.length}/{totalMilestones} linked
                        </div>
                    </div>
                    <div className="mt-4 space-y-3">
                        {(queue.length ? queue.map((q) => ({
                            idx: q.milestoneIndex,
                            title: data.milestones.items[q.milestoneIndex - 1]?.title || `Milestone ${q.milestoneIndex}`,
                            pct: data.milestones.items[q.milestoneIndex - 1]?.percentage ?? 0,
                            dueDays: data.milestones.items[q.milestoneIndex - 1]?.dueDays ?? '',
                            linked: linked.find((x) => x.milestoneIndex === q.milestoneIndex),
                        })) : data.milestones.items.map((m, i) => ({
                            idx: i + 1,
                            title: m.title || `Milestone ${i + 1}`,
                            pct: m.percentage,
                            dueDays: m.dueDays,
                            linked: linked.find((x) => x.milestoneIndex === i + 1),
                        }))).map((m) => (
                            <div key={m.idx} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="font-bold text-slate-200 text-sm">
                                        {m.idx}. {m.title}
                                    </div>
                                    <div className="text-xs text-slate-500">{m.pct}% {m.dueDays ? `· ${m.dueDays} days` : ''}</div>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <div className="text-slate-400">
                                        {m.linked?.onchainIntentId && m.linked.onchainIntentId !== '—'
                                            ? `On-chain PI-${m.linked.onchainIntentId}`
                                            : 'Pending on-chain intent'}
                                    </div>
                                    {m.linked?.onchainIntentId && m.linked.onchainIntentId !== '—' && (
                                        <div className="text-blue-400 flex items-center gap-1">
                                            View <ArrowUpRight size={14} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-center">
                <CheckCircle2 className="text-blue-400 shrink-0" size={24} />
                <div>
                    <h4 className="text-sm font-bold text-white">Ready to Create</h4>
                    <p className="text-xs text-slate-400">
                        {data.job.publish
                            ? 'Confirm will create a public job and then create one on-chain escrow per milestone.'
                            : 'Confirm will create the payment intent and link it to the backend.'}
                    </p>
                </div>
            </div>

            <button
                onClick={onConfirm}
                disabled={confirmDisabled || (queue.length > 0 && linked.length >= queue.length)}
                className="w-full px-8 py-3 rounded-xl font-bold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-60"
            >
                {isProcessing ? 'Processing…' : ctaLabel}
            </button>
        </div>
    );
};
