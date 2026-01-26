import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Truck, Flag } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';

interface Step3Props {
    data: PaymentData;
    updateFields: (field: keyof PaymentData, value: any) => void;
}

export const Step3Timing: React.FC<Step3Props> = ({ data, updateFields }) => {
    const [isCustomDate, setIsCustomDate] = useState(false);
    const { timing } = data;
    const profile = data.recipient.profile;
    const policy = data.recipient.policy;

    const handleChange = (field: keyof PaymentData['timing'], value: string | boolean) => {
        updateFields('timing', { ...timing, [field]: value });
    };

    const updatePolicy = (field: keyof PaymentData['recipient']['policy'], value: string | boolean) => {
        updateFields('recipient', {
            ...data.recipient,
            policy: { ...policy, [field]: value },
        });
    };

    const updateProfile = (patch: Partial<PaymentData['recipient']['profile']>) => {
        updateFields('recipient', {
            ...data.recipient,
            profile: { ...profile, ...patch } as PaymentData['recipient']['profile'],
        });
    };

    const handleWindowSelect = (days: string) => {
        setIsCustomDate(false);
        handleChange('deadline', `${days} Days`);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-primary">❖</span> Timing & Conditions
            </h2>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Release Condition
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { id: 'ON_APPROVAL', label: 'On Approval', desc: 'Funds released when you approve', icon: CheckCircle2 },
                        { id: 'ON_DELIVERY', label: 'On Delivery', desc: 'Released upon verified delivery', icon: Truck },
                        { id: 'ON_MILESTONE', label: 'On Milestone', desc: 'Released per completed milestone', icon: Flag }
                    ].map((condition) => (
                        <div
                            key={condition.id}
                            onClick={() => handleChange('releaseCondition', condition.id)}
                            className={`cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all duration-200 group ${timing.releaseCondition === condition.id
                                ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_-3px_rgba(0,82,255,0.3)]'
                                : 'bg-[#0f172a]/30 border-slate-800 hover:bg-[#0f172a]/50 hover:border-slate-700'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${timing.releaseCondition === condition.id ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'}`}>
                                <condition.icon size={20} />
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold ${timing.releaseCondition === condition.id ? 'text-white' : 'text-slate-300'}`}>
                                    {condition.label}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">{condition.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Release Deadline
                </label>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        {['3', '7', '14'].map((day) => (
                            <button
                                key={day}
                                onClick={() => handleWindowSelect(day)}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${timing.deadline === `${day} Days` && !isCustomDate
                                    ? 'bg-primary/20 border-primary/50 text-primary'
                                    : 'bg-[#0a0a0a] border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                {day} Days
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setIsCustomDate(true);
                                handleChange('deadline', '');
                            }}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${isCustomDate
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                : 'bg-[#0a0a0a] border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            Custom
                        </button>
                    </div>

                    {isCustomDate && (
                        <div className="relative animate-fadeIn">
                            <input
                                type="number"
                                value={timing.deadline.replace(' Days', '')}
                                onChange={(e) => handleChange('deadline', `${e.target.value} Days`)}
                                placeholder="Enter days"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Days</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={timing.enableYield}
                        onChange={(e) => handleChange('enableYield', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable Yield While Waiting</span>
                </label>
                <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={timing.enableProtection}
                        onChange={(e) => handleChange('enableProtection', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable Protection</span>
                </label>
            </div>

            <div className="bg-[#0f172a]/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Business Profile</h3>

                {profile.type === 'VENDOR' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Vendor Category
                            </label>
                            <select
                                value={profile.vendorCategory}
                                onChange={(e) => updateProfile({ vendorCategory: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['SOFTWARE', 'HARDWARE', 'SERVICES', 'LOGISTICS', 'MARKETING', 'OTHER'].map(option => (
                                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Payment Terms
                            </label>
                            <select
                                value={profile.paymentTerms}
                                onChange={(e) => {
                                    const paymentTerms = e.target.value as 'NET0' | 'NET7' | 'NET14' | 'NET30' | 'MILESTONE_BASED';
                                    updateProfile({ paymentTerms });
                                    if (paymentTerms === 'MILESTONE_BASED') {
                                        handleChange('releaseCondition', 'ON_MILESTONE');
                                    }
                                }}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['NET0', 'NET7', 'NET14', 'NET30', 'MILESTONE_BASED'].map(option => (
                                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={profile.invoiceRequired}
                                onChange={(e) => updateProfile({ invoiceRequired: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-300">Invoice Required</span>
                        </label>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Invoice Email
                            </label>
                            <input
                                type="email"
                                value={profile.invoiceEmail}
                                onChange={(e) => updateProfile({ invoiceEmail: e.target.value })}
                                placeholder="ap@vendor.com"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Supported Documents
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['Invoice', 'PO', 'DeliveryProof'].map(doc => (
                                    <label key={doc} className="flex items-center gap-2 text-xs text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={profile.supportedDocuments.includes(doc as 'Invoice')}
                                            onChange={(e) => {
                                                const exists = profile.supportedDocuments.includes(doc as 'Invoice');
                                                const updated = exists
                                                    ? profile.supportedDocuments.filter(item => item !== doc)
                                                    : [...profile.supportedDocuments, doc as 'Invoice'];
                                                updateProfile({ supportedDocuments: updated });
                                            }}
                                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                                        />
                                        {doc}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Bill To Entity
                            </label>
                            <input
                                type="text"
                                value={profile.billToEntityName}
                                onChange={(e) => updateProfile({ billToEntityName: e.target.value })}
                                placeholder="Billing entity name"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Tax Treatment
                            </label>
                            <input
                                type="text"
                                value={profile.taxTreatment}
                                onChange={(e) => updateProfile({ taxTreatment: e.target.value })}
                                placeholder="VAT included, etc."
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>
                )}

                {profile.type === 'PARTNER' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Partnership Model
                            </label>
                            <select
                                value={profile.partnerModel}
                                onChange={(e) => updateProfile({ partnerModel: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['REVENUE_SHARE', 'PROFIT_SHARE', 'COST_SHARE', 'AFFILIATE', 'REFERRAL'].map(option => (
                                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Settlement Cycle
                            </label>
                            <select
                                value={profile.settlementCycle}
                                onChange={(e) => updateProfile({ settlementCycle: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'PER_CAMPAIGN'].map(option => (
                                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Default Split (bps)
                            </label>
                            <input
                                type="number"
                                value={profile.defaultSplitBps}
                                onChange={(e) => updateProfile({ defaultSplitBps: Number(e.target.value) })}
                                placeholder="0"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Program / Campaign ID
                            </label>
                            <input
                                type="text"
                                value={profile.programId}
                                onChange={(e) => updateProfile({ programId: e.target.value })}
                                placeholder="Campaign ID"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Tracking Method
                            </label>
                            <select
                                value={profile.trackingMethod}
                                onChange={(e) => updateProfile({ trackingMethod: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['OFFCHAIN_REPORT', 'ONCHAIN_METRICS', 'MANUAL_APPROVAL'].map(option => (
                                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                KPI Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                value={profile.kpiTags.join(', ')}
                                onChange={(e) => updateProfile({ kpiTags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })}
                                placeholder="MRR, signups, conversions"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>
                )}

                {profile.type === 'AGENCY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Payout Mode
                            </label>
                            <select
                                value={profile.payoutMode}
                                onChange={(e) => updateProfile({ payoutMode: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['MASTER_PAYEE', 'SPLIT_TO_TEAM', 'HYBRID'].map(option => (
                                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Acceptance Window Default (days)
                            </label>
                            <input
                                type="number"
                                value={profile.acceptanceWindowDefault}
                                onChange={(e) => updateProfile({ acceptanceWindowDefault: Number(e.target.value) })}
                                placeholder="7"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={profile.hasSubRecipients}
                                onChange={(e) => updateProfile({ hasSubRecipients: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-300">Has Sub-Recipients</span>
                        </label>
                        <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={profile.requiresMilestones}
                                onChange={(e) => {
                                    updateProfile({ requiresMilestones: e.target.checked });
                                    if (e.target.checked) {
                                        handleChange('releaseCondition', 'ON_MILESTONE');
                                    }
                                }}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-300">Requires Milestones</span>
                        </label>
                    </div>
                )}

                {profile.type === 'CONTRACTOR' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Engagement Type
                            </label>
                            <select
                                value={profile.engagementType}
                                onChange={(e) => updateProfile({ engagementType: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['FIXED', 'HOURLY', 'RETAINER'].map(option => (
                                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Preferred Payout Asset
                            </label>
                            <select
                                value={profile.preferredPayoutAsset}
                                onChange={(e) => updateProfile({ preferredPayoutAsset: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['IDRX', 'USDC', 'USDT', 'DAI', 'EURC'].map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                KYC Level
                            </label>
                            <select
                                value={profile.kycLevel}
                                onChange={(e) => updateProfile({ kycLevel: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['NONE', 'BASIC', 'VERIFIED'].map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Dispute Preference
                            </label>
                            <select
                                value={profile.disputePreference}
                                onChange={(e) => updateProfile({ disputePreference: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                {['AUTO_ARBITRATION', 'MANUAL_REVIEW'].map(option => (
                                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Scope Summary
                            </label>
                            <textarea
                                value={profile.scopeSummary}
                                onChange={(e) => updateProfile({ scopeSummary: e.target.value })}
                                placeholder="Short description of work scope"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 min-h-[90px]"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[#0f172a]/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Accounting & Ops</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Vendor / Partner Code
                        </label>
                        <input
                            type="text"
                            value={data.recipient.accounting.counterpartyCode}
                            onChange={(e) => updateFields('recipient', {
                                ...data.recipient,
                                accounting: { ...data.recipient.accounting, counterpartyCode: e.target.value },
                            })}
                            placeholder="Optional code"
                            className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Cost Center / Project Code
                        </label>
                        <input
                            type="text"
                            value={data.recipient.accounting.costCenter}
                            onChange={(e) => updateFields('recipient', {
                                ...data.recipient,
                                accounting: { ...data.recipient.accounting, costCenter: e.target.value },
                            })}
                            placeholder="Optional cost center"
                            className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            value={data.recipient.accounting.tags.join(', ')}
                            onChange={(e) => updateFields('recipient', {
                                ...data.recipient,
                                accounting: {
                                    ...data.recipient.accounting,
                                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean),
                                },
                            })}
                            placeholder="Campaign, department, project"
                            className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#0f172a]/30 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Risk & Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Risk Tier
                        </label>
                        <select
                            value={policy.riskTier}
                            onChange={(e) => updatePolicy('riskTier', e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        >
                            {['LOW', 'MEDIUM', 'HIGH'].map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Approval Policy
                        </label>
                        <select
                            value={policy.approvalPolicy}
                            onChange={(e) => updatePolicy('approvalPolicy', e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        >
                            {['AUTO', 'SINGLE', 'MULTI', 'THRESHOLD'].map(option => (
                                <option key={option} value={option}>{option.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Max Single Payment
                        </label>
                        <input
                            type="text"
                            value={policy.maxSinglePayment}
                            onChange={(e) => updatePolicy('maxSinglePayment', e.target.value)}
                            placeholder="Optional limit"
                            className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Max Monthly Limit
                        </label>
                        <input
                            type="text"
                            value={policy.maxMonthlyLimit}
                            onChange={(e) => updatePolicy('maxMonthlyLimit', e.target.value)}
                            placeholder="Optional limit"
                            className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={policy.requiresEscrowDefault}
                            onChange={(e) => updatePolicy('requiresEscrowDefault', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-300">Escrow Required by Default</span>
                    </label>
                    <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={policy.requiresMilestonesDefault}
                            onChange={(e) => updatePolicy('requiresMilestonesDefault', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-300">Milestones Required by Default</span>
                    </label>
                </div>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 flex gap-3 items-start">
                <ShieldCheck className="text-primary shrink-0" size={20} />
                <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Automatic Safeguards</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Yield can be applied to escrowed funds, and protection can be added for FX or delivery risk.
                    </p>
                </div>
            </div>
        </div>
    );
};
