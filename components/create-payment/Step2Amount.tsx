import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';

interface Step2Props {
    amount: PaymentData['amount'];
    updateAmount: (amount: PaymentData['amount']) => void;
}

export const Step2Amount: React.FC<Step2Props> = ({ amount, updateAmount }) => {
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        updateAmount({ ...amount, value: formatted });
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-cyan-400">❖</span> Amount & Assets
            </h2>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Amount
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={amount.value}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-cyan-500/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold bg-[#1e293b] px-2 py-1 rounded text-xs">{amount.fundingAsset}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Funding Asset
                    </label>
                    <select
                        value={amount.fundingAsset}
                        onChange={(e) => updateAmount({ ...amount, fundingAsset: e.target.value })}
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    >
                        <option>IDRX</option>
                        <option>USDC</option>
                        <option>USD</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Payout Asset
                    </label>
                    <select
                        value={amount.payoutAsset}
                        onChange={(e) => updateAmount({ ...amount, payoutAsset: e.target.value })}
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    >
                        <option>IDRX</option>
                        <option>USDC</option>
                        <option>USD</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 flex gap-3 items-center">
                <BadgeCheck className="text-cyan-400 shrink-0" size={20} />
                <p className="text-xs text-slate-400 leading-relaxed">
                    The payout asset determines what the recipient receives. Funding is reserved from the treasury when the payment is created.
                </p>
            </div>
        </div>
    );
};
