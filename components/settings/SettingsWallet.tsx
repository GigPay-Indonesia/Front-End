import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Copy, CheckCircle, Wallet, ShieldCheck, AlertCircle } from 'lucide-react';

const SettingsWallet: React.FC = () => {
    const { address, connector } = useAccount();
    const [isCopied, setIsCopied] = useState(false);
    const [basename, setBasename] = useState<string | null>(null);
    const [isSmartWallet, setIsSmartWallet] = useState(false);

    useEffect(() => {
        // Mock Basename and Smart Wallet Check
        if (address) {
            // Simulator: 50% chance of having a basename
            setTimeout(() => setBasename(Math.random() > 0.5 ? 'zennz.base' : null), 800);

            // Check if connected via Coinbase Smart Wallet (simplified check)
            if (connector?.id === 'coinbaseWalletSDK') {
                setIsSmartWallet(true);
            }
        }
    }, [address, connector]);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-black text-white mb-1">Wallet & Security</h2>
                <p className="text-slate-400 text-sm">Manage your connected wallet and identity.</p>
            </div>

            {/* Smart Wallet Alert */}
            {isSmartWallet && (
                <div className="bg-gradient-to-r from-blue-600/10 to-blue-400/10 border border-blue-500/20 rounded-2xl p-6 flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Wallet className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-blue-400 font-bold text-lg mb-1">Passkey Enabled</h3>
                        <p className="text-blue-200/60 text-sm leading-relaxed">
                            You are securely connected using a **Coinbase Smart Wallet**. Your account is protected by your device's biometric passkey.
                        </p>
                    </div>
                </div>
            )}

            {/* Active Wallet Card */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-50"></div>

                <div className="relative z-10">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                        Connected Address
                    </label>
                    <div className="flex items-center gap-3">
                        <code className="flex-1 bg-black/50 border border-slate-800 rounded-xl px-4 py-3 font-mono text-slate-300 text-sm break-all">
                            {address || 'Not Connected'}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                            {isCopied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Basename Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Basename Identity</label>
                        {basename ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-white tracking-tight">{basename}</span>
                                <CheckCircle size={16} className="text-blue-500 fill-blue-500/20" />
                            </div>
                        ) : (
                            <span className="text-slate-500 font-mono text-sm">No basename found</span>
                        )}
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${basename ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                        <ShieldCheck className={basename ? 'text-blue-500' : 'text-slate-600'} size={20} />
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-center justify-between opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">KYC Status</label>
                        <span className="text-slate-500 font-mono text-sm flex items-center gap-2">
                            <AlertCircle size={14} /> Unverified
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsWallet;
