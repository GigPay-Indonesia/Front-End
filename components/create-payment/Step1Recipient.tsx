import React from 'react';
import { Mail, User, Wallet } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';

interface Step1Props {
    data: PaymentData;
    updateFields: (field: keyof PaymentData, value: any) => void;
}

export const Step1Recipient: React.FC<Step1Props> = ({ data, updateFields }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recipient Name
                </label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={data.recipient.name}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, name: e.target.value })}
                        placeholder="e.g. Nusa Creative Studio"
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Entity Type
                    </label>
                    <select
                        value={data.recipient.type}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, type: e.target.value })}
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    >
                        <option>Vendor</option>
                        <option>Partner</option>
                        <option>Agency</option>
                        <option>Contractor</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Preferred Asset
                    </label>
                    <select
                        value={data.recipient.preferredAsset}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, preferredAsset: e.target.value })}
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    >
                        <option>IDRX</option>
                        <option>USDC</option>
                        <option>USD</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recipient Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="email"
                        value={data.recipient.email}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, email: e.target.value })}
                        placeholder="finance@company.com"
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Payout Address
                </label>
                <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={data.recipient.payoutAddress}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, payoutAddress: e.target.value })}
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-sm"
                    />
                </div>
            </div>
        </div>
    );
};
