import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';

interface Step4Props {
    split: PaymentData['split'];
    updateSplit: (split: PaymentData['split']) => void;
}

export const Step4Split: React.FC<Step4Props> = ({ split, updateSplit }) => {
    const updateRecipient = (id: number, field: 'name' | 'percentage' | 'address', value: string) => {
        const updated = split.recipients.map((r) =>
            r.id === id ? { ...r, [field]: field === 'percentage' ? Number(value) : value } : r
        );
        updateSplit({ recipients: updated });
    };

    const addRecipient = () => {
        const nextId = split.recipients.length + 1;
        updateSplit({
            recipients: [...split.recipients, { id: nextId, name: '', address: '', percentage: 0 }],
        });
    };

    const removeRecipient = (id: number) => {
        if (split.recipients.length === 1) return;
        updateSplit({ recipients: split.recipients.filter((r) => r.id !== id) });
    };

    const total = split.recipients.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">❖</span> Split Rules
                </h2>
                <button
                    onClick={addRecipient}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-cyan-400 text-sm font-bold border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all"
                >
                    <Plus size={16} /> ADD RECIPIENT
                </button>
            </div>

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
                                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
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
                                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-sm"
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
                                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
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
        </div>
    );
};
