import React from 'react';
import { CheckCircle2, FileText, Layers, Wallet, ShieldCheck } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';

interface Step5Props {
    data: PaymentData;
}

export const Step5Review: React.FC<Step5Props> = ({ data }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-primary">❖</span> Review & Confirm
            </h2>

            <div className="space-y-6">
                {/* Recipient Summary */}
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="bg-[#0a0a0a] rounded-xl p-4 border border-slate-800 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Recipient</h4>
                            <p className="text-lg font-bold text-white mb-2 underline decoration-blue-500/30 underline-offset-4 decoration-2">
                                {data.recipient.name || 'Unnamed Entity'}
                            </p>
                            <p className="text-slate-400 text-sm mb-2">{data.recipient.type} • {data.recipient.email}</p>
                            <p className="text-slate-500 text-xs font-mono break-all">{data.recipient.payoutAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Timing Summary */}
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
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
                                    <span className="text-slate-500">Release Deadline</span>
                                    <span>{data.timing.deadline}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Yield Enabled</span>
                                    <span>{data.timing.enableYield ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Protection Enabled</span>
                                    <span>{data.timing.enableProtection ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-[#0f172a]/30 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-800 rounded-lg text-green-400">
                            <Wallet size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Summary</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-slate-300">Total Amount</span>
                                <p className="text-2xl font-bold text-white mt-1">{data.amount.value} <span className="text-primary text-lg">{data.amount.fundingAsset}</span></p>
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

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-center">
                <CheckCircle2 className="text-blue-400 shrink-0" size={24} />
                <div>
                    <h4 className="text-sm font-bold text-white">Ready to Create</h4>
                    <p className="text-xs text-slate-400">
                        Clicking "Confirm" will create the payment intent with these parameters.
                    </p>
                </div>
            </div>
        </div>
    );
};
