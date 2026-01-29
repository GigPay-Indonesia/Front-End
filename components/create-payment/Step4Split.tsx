import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';

interface Step4Props {
    data: PaymentData;
    updateFields: (field: keyof PaymentData, value: any) => void;
}

export const Step4Split: React.FC<Step4Props> = ({ data, updateFields }) => {
    const { split, milestones } = data;
    const profile = data.recipient.profile;

    const updateRecipient = (id: number, field: 'name' | 'percentage' | 'address', value: string) => {
        const updated = split.recipients.map((r) =>
            r.id === id ? { ...r, [field]: field === 'percentage' ? Number(value) : value } : r
        );
        updateFields('split', { ...split, recipients: updated });
    };

    const addRecipient = () => {
        const nextId = split.recipients.length + 1;
        updateFields('split', {
            ...split,
            recipients: [...split.recipients, { id: nextId, name: '', address: '', percentage: 0 }],
        });
    };

    const removeRecipient = (id: number) => {
        if (split.recipients.length === 1) return;
        updateFields('split', { ...split, recipients: split.recipients.filter((r) => r.id !== id) });
    };

    const total = split.recipients.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0);
    const milestoneTotal = milestones.items.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);
    const isSplitRequired = profile.type === 'AGENCY'
        ? profile.payoutMode !== 'MASTER_PAYEE'
        : profile.type === 'PARTNER' && (profile.defaultSplitBps || 0) > 0;
    const isSplitEnabled = isSplitRequired || split.enabled;
    const isMilestoneRequired = profile.type === 'AGENCY'
        ? profile.requiresMilestones
        : profile.type === 'VENDOR'
            ? profile.paymentTerms === 'MILESTONE_BASED'
            : data.recipient.policy.requiresMilestonesDefault;

    const updateMilestone = (id: number, field: 'title' | 'dueDays' | 'percentage', value: string) => {
        const updated = milestones.items.map((item) =>
            item.id === id ? { ...item, [field]: field === 'percentage' ? Number(value) : value } : item
        );
        updateFields('milestones', { items: updated });
    };

    const addMilestone = () => {
        const nextId = milestones.items.length + 1;
        updateFields('milestones', {
            items: [...milestones.items, { id: nextId, title: '', dueDays: '', percentage: 0 }],
        });
    };

    const removeMilestone = (id: number) => {
        if (milestones.items.length === 1) return;
        updateFields('milestones', { items: milestones.items.filter((item) => item.id !== id) });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-primary">❖</span> Payment Split Rules
                </h2>
                {isSplitEnabled && (
                    <button
                        onClick={addRecipient}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-primary text-sm font-bold border border-slate-700 hover:border-primary/50 rounded-lg transition-all"
                    >
                        <Plus size={16} /> ADD RECIPIENT
                    </button>
                )}
            </div>

            {!isSplitRequired && (
                <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={split.enabled}
                        onChange={(e) => {
                            const enabled = e.target.checked;
                            updateFields('split', {
                                ...split,
                                enabled,
                                recipients: enabled
                                    ? split.recipients
                                    : [{ ...split.recipients[0], percentage: 100 }],
                            });
                        }}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable Split Payouts</span>
                </label>
            )}

            {isSplitEnabled ? (
                <>
                    <div className="space-y-4">
                        {split.recipients.map((recipient) => (
                            <div key={recipient.id} className="bg-[#0f172a]/30 border border-slate-700/50 rounded-2xl p-5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Recipient Name
                                            </label>
                                            <input
                                                type="text"
                                                value={recipient.name}
                                                onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                                                placeholder="e.g. Primary Recipient"
                                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Recipient Address
                                            </label>
                                            <input
                                                type="text"
                                                value={recipient.address}
                                                onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-mono text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Allocation %
                                            </label>
                                            <input
                                                type="number"
                                                value={recipient.percentage}
                                                onChange={(e) => updateRecipient(recipient.id, 'percentage', e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    {split.recipients.length > 1 && (
                                        <button
                                            onClick={() => removeRecipient(recipient.id)}
                                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-6"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`rounded-xl p-4 border ${total === 100 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'}`}>
                        <div className="flex items-center justify-between text-sm font-bold">
                            <span>Total Allocation</span>
                            <span>{total}%</span>
                        </div>
                        {total !== 100 && (
                            <p className="text-xs mt-2 opacity-80">
                                Splits should total 100% before creating the payment.
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
                    Split payouts are optional for this recipient type.
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-primary">❖</span> Milestones
                </h2>
                {isMilestoneRequired && (
                    <button
                        onClick={addMilestone}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-primary text-sm font-bold border border-slate-700 hover:border-primary/50 rounded-lg transition-all"
                    >
                        <Plus size={16} /> ADD MILESTONE
                    </button>
                )}
            </div>

            {isMilestoneRequired ? (
                <>
                    <div className="space-y-4">
                        {milestones.items.map((item) => (
                            <div key={item.id} className="bg-[#0f172a]/30 border border-slate-700/50 rounded-2xl p-5">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Milestone Title
                                            </label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateMilestone(item.id, 'title', e.target.value)}
                                                placeholder="e.g. Design delivery"
                                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Due Days
                                            </label>
                                            <input
                                                type="text"
                                                value={item.dueDays}
                                                onChange={(e) => updateMilestone(item.id, 'dueDays', e.target.value)}
                                                placeholder="e.g. 14"
                                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Allocation %
                                            </label>
                                            <input
                                                type="number"
                                                value={item.percentage}
                                                onChange={(e) => updateMilestone(item.id, 'percentage', e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    {milestones.items.length > 1 && (
                                        <button
                                            onClick={() => removeMilestone(item.id)}
                                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-6"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`rounded-xl p-4 border ${milestoneTotal === 100 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'}`}>
                        <div className="flex items-center justify-between text-sm font-bold">
                            <span>Milestone Allocation</span>
                            <span>{milestoneTotal}%</span>
                        </div>
                        {milestoneTotal !== 100 && (
                            <p className="text-xs mt-2 opacity-80">
                                Milestones should total 100% before creating the payment.
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
                    Milestones are optional for this recipient type.
                </div>
            )}
        </div>
    );
};
