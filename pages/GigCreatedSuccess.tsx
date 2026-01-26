import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ExternalLink, FileText, ArrowLeft, ShieldCheck } from 'lucide-react';
import { PaymentData } from './CreatePayment';

export const GigCreatedSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state?.data as PaymentData | undefined;

    useEffect(() => {
        if (!data) {
            navigate('/payments/new');
        }
    }, [data, navigate]);

    if (!data) return null;

    const handleViewOnBaseScan = () => {
        // Since we don't have a real TX hash, we'll open the recipient's address
        window.open(`https://basescan.org/address/${data.recipient.payoutAddress}`, '_blank');
    };

    const handleDownloadReceipt = () => {
        alert("Receipt download simulation: Receipt_Payment_3923.pdf");
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-2xl w-full z-10 text-center animate-fadeInUp">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/50 mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Payment Created</h1>
                <p className="text-slate-400 mb-10 max-w-lg mx-auto">
                    The payment intent is ready. Funds will be reserved and released based on your conditions.
                </p>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 text-left mb-8 max-w-lg mx-auto shadow-2xl">
                    <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-800/50">
                        <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">TOTAL DEPOSIT</p>
                            <p className="text-3xl font-bold text-white">{data.amount.value} <span className="text-sm text-slate-500">{data.amount.fundingAsset}</span></p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 uppercase tracking-wider text-xs font-bold">Recipient</span>
                            <span className="font-mono text-white text-right break-words max-w-[200px]">{data.recipient.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 uppercase tracking-wider text-xs font-bold">Recipient</span>
                            <span className="font-mono text-blue-400 flex items-center gap-2 cursor-pointer hover:text-white transition-colors truncate max-w-[150px]" title={data.recipient.payoutAddress}>
                                {data.recipient.payoutAddress.slice(0, 6)}...{data.recipient.payoutAddress.slice(-4)} <ExternalLink size={12} />
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 uppercase tracking-wider text-xs font-bold">Escrow Status</span>
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold border border-blue-500/30">CREATED</span>
                        </div>
                    </div>

                    <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-3 text-sm">
                        <ShieldCheck className="text-blue-400 shrink-0" size={20} />
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Funds are reserved for <strong>{data.timing.deadline}</strong>. You can edit conditions before release.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleViewOnBaseScan}
                        className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    >
                        View on BaseScan
                    </button>
                    <button
                        onClick={handleDownloadReceipt}
                        className="px-6 py-3 bg-[#0f172a] border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText size={18} /> PDF Receipt
                    </button>
                </div>

                <button
                    onClick={() => navigate('/overview')}
                    className="mt-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 mx-auto text-sm"
                >
                    <ArrowLeft size={16} /> Back to Overview
                </button>
            </div>
        </div>
    );
};
