import { Mail, User, Wallet, Building2, Briefcase, Warehouse } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';
import { TokenLogo } from '../ui/TokenLogo';
import { TokenDropdown } from '../ui/TokenDropdown';

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
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Entity Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'Vendor', icon: Warehouse, label: 'Vendor' },
                            { id: 'Partner', icon: User, label: 'Partner' },
                            { id: 'Agency', icon: Building2, label: 'Agency' },
                            { id: 'Contractor', icon: Briefcase, label: 'Contractor' }
                        ].map((type) => (
                            <div
                                key={type.id}
                                onClick={() => updateFields('recipient', { ...data.recipient, type: type.id })}
                                className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${data.recipient.type === type.id
                                    ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_-3px_rgba(0,82,255,0.3)]'
                                    : 'bg-[#0f172a]/30 border-slate-800 text-slate-400 hover:bg-[#0f172a]/50 hover:border-slate-700'
                                    }`}
                            >
                                <type.icon size={18} />
                                <span className="text-xs font-semibold">{type.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Preferred Asset
                    </label>
                    <TokenDropdown
                        options={['IDRX', 'USDC', 'USDT', 'DAI', 'EURC']}
                        selected={data.recipient.preferredAsset}
                        onChange={(asset) => updateFields('recipient', { ...data.recipient, preferredAsset: asset })}
                    />
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
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
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
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-mono text-sm"
                    />
                </div>
            </div>
        </div>
    );
};
