import React, { useState } from 'react';
import { Wallet, Lock, TrendingUp, Activity, ExternalLink, ArrowRight, Zap, CreditCard } from 'lucide-react';

// --- Types ---
export interface OverviewData {
    treasuryBalance: string;
    inEscrow: string;
    inYield: string;
    pendingActions: number;
}

// --- Stats Grid Component ---
export const StatsGrid: React.FC<OverviewData> = ({ treasuryBalance, inEscrow, inYield, pendingActions }) => {
    const [showBalance, setShowBalance] = useState(true);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            {/* Balance Card */}
            <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-600 transition-all duration-300 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-slate-500/10 rounded-full blur-2xl group-hover:bg-slate-500/20 transition-all"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shadow-inner">
                            <Wallet size={18} />
                        </div>
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors border border-slate-800 px-2 py-1 rounded-lg bg-slate-900/50"
                        >
                            {showBalance ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Treasury Balance</p>
                    <h3 className="text-2xl font-black text-white tracking-tight font-mono">
                        {showBalance ? `${treasuryBalance}` : '••••••••'} <span className="text-xs text-slate-600 font-sans font-bold">IDRX</span>
                    </h3>
                </div>
            </div>

            {/* Escrow Card */}
            <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl p-4 sm:p-5 relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary-950/30 border border-primary-900/50 flex items-center justify-center text-primary-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                            <Lock size={18} />
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">In Escrow</p>
                    <h3 className="text-2xl font-black text-white tracking-tight font-mono">
                        {inEscrow} <span className="text-xs text-slate-600 font-sans font-bold">IDRX</span>
                    </h3>
                </div>
            </div>

            {/* Yield Card */}
            <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                            <TrendingUp size={18} />
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-500/20">
                            +4.2% APY
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">In Yield</p>
                    <h3 className="text-2xl font-black text-white tracking-tight font-mono flex items-center gap-2">
                        {inYield} <span className="text-xs text-slate-600 font-sans font-bold">IDRX</span>
                    </h3>
                </div>
            </div>

            {/* Pending Actions Card */}
            <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl p-4 sm:p-5 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-950/30 border border-purple-900/50 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <Activity size={18} />
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Approvals Needed</p>
                    <h3 className="text-2xl font-black text-white tracking-tight font-mono">{pendingActions}</h3>
                </div>
            </div>
        </div>
    );
};

// --- Pending Payments List Component ---
export const PendingActionsList: React.FC = () => {
    // Mock Data
    const pendingActions = [
        { id: 'PI-3921', title: 'Marketing Agency Retainer', to: 'Nusa Creative Studio', progress: 2, totalMilestones: 3, status: 'Submitted' },
        { id: 'PI-3922', title: 'Vendor Equipment Purchase', to: 'PT SatuTek', progress: 0, totalMilestones: 2, status: 'Created' },
    ];

    if (pendingActions.length === 0) {
        return (
            <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl p-1 relative overflow-hidden group min-h-[300px] shadow-xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-black"></div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Zap size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-white font-black text-xl mb-2 tracking-tight">No Approvals Needed</h3>
                    <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">All payments are up to date. Create a new payment or review activity.</p>
                    <button className="group relative px-6 py-3 bg-white text-black font-bold rounded-xl overflow-hidden hover:scale-105 transition-transform">
                        <span className="relative z-10">Create Payment</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-color-burn"></div>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden shadow-xl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-900/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
                <h4 className="text-white font-black flex items-center gap-3 text-lg">
                    <div className="w-2 h-6 bg-gradient-to-b from-primary-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                    Pending Actions
                </h4>
                <button className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors border border-transparent hover:border-slate-800 px-3 py-1 rounded-lg">View All</button>
            </div>

            <div className="space-y-4 relative z-10">
                {pendingActions.map((payment) => (
                    <div key={payment.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-primary-500/30 hover:bg-slate-900/60 transition-all group cursor-pointer relative overflow-hidden backdrop-blur-sm">

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h5 className="text-white font-bold text-base mb-2 group-hover:text-primary-400 transition-colors">{payment.title}</h5>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-black px-2 py-1 rounded-md border bg-slate-800 text-slate-300 border-slate-700">
                                        Payment Intent
                                    </span>
                                    <span className="text-slate-600 text-xs">•</span>
                                    <span className="text-slate-400 text-xs font-medium">{payment.id}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">To {payment.to}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${payment.status === 'Submitted'
                                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                                }`}>
                                {payment.status === 'Submitted' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.5)]"></span>}
                                <span className="text-[10px] font-bold uppercase tracking-wider">{payment.status}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <span>Progress</span>
                                <span>{Math.round((payment.progress / payment.totalMilestones) * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)] relative"
                                    style={{ width: `${(payment.progress / payment.totalMilestones) * 100}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Profile & Actions Component ---
interface ProfileActionsProps {
    walletAddress?: string;
}

import FuturisticProfileCard from './FuturisticProfileCard';

export const ProfileActions: React.FC<ProfileActionsProps> = ({ walletAddress }) => {
    // Determine truncated address for display
    const displayAddress = walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'UNKNOWN';

    return (
        <div className="space-y-6 flex flex-col">
            {/* Identity Card - Futuristic Design */}
            <FuturisticProfileCard
                name="Treasury Ops"
                handle="ops.gigpay"
                rank="Finance Lead"
                walletAddress={walletAddress}
                avatarUrl="/avatars/alex.png"
            />

            {/* Quick Actions */}
            <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-center shadow-xl">
                <h4 className="text-slate-500 font-bold mb-4 text-xs uppercase tracking-widest">Quick Actions</h4>
                <div className="space-y-3">
                    <a href="/#/payments/new" className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] group">
                        <span className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Zap size={16} className="text-white fill-current" />
                            </div>
                            Create Payment
                        </span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </a>

                    <button className="flex items-center justify-between w-full p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold rounded-2xl transition-all group hover:bg-slate-800">
                        <span className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-slate-700 group-hover:border-slate-600">
                                <CreditCard size={16} />
                            </div>
                            Add Funds
                        </span>
                        <ExternalLink size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Recent Activity Component ---
export const ActivityPreviewTable: React.FC = () => {
    const activities = [
        { type: 'Payment Funded', amount: '- 15.000.000 IDRX', date: '2 mins ago', status: 'Funded', icon: '🔒' },
        { type: 'Payment Submitted', amount: '—', date: '3 hours ago', status: 'Submitted', icon: '⏳' },
        { type: 'Payment Released', amount: '- 8.500.000 IDRX', date: '1 day ago', status: 'Released', icon: '✅' },
    ];

    return (
        <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden min-h-[300px] shadow-xl">
            <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
                <h4 className="text-white font-black flex items-center gap-3 text-lg">
                    <Activity size={20} className="text-slate-500" />
                    Activity
                </h4>
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <ExternalLink size={16} className="text-slate-500" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 font-bold">Transaction</th>
                            <th className="px-6 py-4 font-bold">Amount</th>
                            <th className="px-6 py-4 font-bold">Time</th>
                            <th className="px-6 py-4 text-right font-bold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                        {activities.map((item, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700">
                                            {item.icon}
                                        </div>
                                        <span className="text-white font-bold group-hover:text-cyan-400 transition-colors">{item.type}</span>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 font-mono font-bold text-base ${item.amount.startsWith('+') ? 'text-emerald-400' : 'text-slate-300'
                                    }`}>
                                    {item.amount}
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-medium text-xs font-mono">{item.date}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${item.status === 'Released'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        : item.status === 'Submitted'
                                            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const EntitiesPreviewTable: React.FC = () => {
    const entities = [
        { name: 'Nusa Creative Studio', type: 'Vendor', asset: 'IDRX', risk: 'Low', totalPaid: '225.000.000' },
        { name: 'PT SatuTek', type: 'Supplier', asset: 'USDC', risk: 'Medium', totalPaid: '480.000.000' },
        { name: 'Karsa Logistics', type: 'Partner', asset: 'IDRX', risk: 'Low', totalPaid: '95.000.000' },
    ];

    return (
        <div className="bg-[#0f172a]/30 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
                <h4 className="text-white font-black flex items-center gap-3 text-lg">
                    <div className="w-2 h-6 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.4)]"></div>
                    Entities
                </h4>
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <ExternalLink size={16} className="text-slate-500" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800/50">
                        <tr>
                            <th className="px-4 sm:px-6 py-4 font-bold">Name</th>
                            <th className="px-4 sm:px-6 py-4 font-bold">Type</th>
                            <th className="px-4 sm:px-6 py-4 font-bold">Asset</th>
                            <th className="px-4 sm:px-6 py-4 font-bold">Risk</th>
                            <th className="px-4 sm:px-6 py-4 text-right font-bold">Total Paid</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                        {entities.map((entity) => (
                            <tr key={entity.name} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 sm:px-6 py-4 text-white font-semibold">{entity.name}</td>
                                <td className="px-4 sm:px-6 py-4 text-slate-300">{entity.type}</td>
                                <td className="px-4 sm:px-6 py-4 text-slate-300">{entity.asset}</td>
                                <td className="px-4 sm:px-6 py-4 text-slate-300">{entity.risk}</td>
                                <td className="px-4 sm:px-6 py-4 text-right text-white font-mono">{entity.totalPaid}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
