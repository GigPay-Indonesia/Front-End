import React from 'react';
import { TreasuryStats, TreasuryCharts, TreasuryActivity } from '../components/treasury/TreasuryComponents';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export const Treasury: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
                            Treasury
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-slate-400 flex items-center gap-2">
                                <ShieldCheck size={14} className="text-cyan-400" />
                                Managed by Treasury Policy
                            </span>
                            <span className="px-3 py-1 bg-green-900/20 border border-green-900/50 rounded-full text-xs font-mono text-green-400">
                                Protocol Solvency: 100%
                            </span>
                        </div>
                    </div>

                    {/* TVL Display */}
                    <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Value Locked (TVL)</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-bold text-white tracking-tight">1.500.000.000</h2>
                            <span className="text-sm text-slate-500 font-medium">IDRX</span>
                        </div>

                        <button className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <ArrowUpRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-bold">Asset Breakdown</h4>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">All balances in IDRX</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-3">Asset</th>
                                        <th className="px-4 py-3">Available</th>
                                        <th className="px-4 py-3">In Yield</th>
                                        <th className="px-4 py-3">In Escrow</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {[
                                        { asset: 'IDRX', available: '300.000.000', yield: '1.200.000.000', escrow: '180.000.000', total: '1.680.000.000' },
                                        { asset: 'USDC', available: '65.000', yield: '0', escrow: '12.000', total: '77.000' },
                                    ].map((row) => (
                                        <tr key={row.asset} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3 text-white font-semibold">{row.asset}</td>
                                            <td className="px-4 py-3 text-slate-300">{row.available}</td>
                                            <td className="px-4 py-3 text-slate-300">{row.yield}</td>
                                            <td className="px-4 py-3 text-slate-300">{row.escrow}</td>
                                            <td className="px-4 py-3 text-right text-white font-semibold">{row.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                        <h4 className="text-white font-bold mb-4">Treasury Actions</h4>
                        <div className="space-y-3">
                            <button className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                Add Funds
                            </button>
                            <button className="w-full py-3 bg-[#0f172a] border border-slate-700 hover:border-slate-500 text-white font-medium rounded-xl transition-all">
                                Withdraw Funds
                            </button>
                            <button className="w-full py-3 bg-[#0f172a] border border-slate-700 hover:border-slate-500 text-white font-medium rounded-xl transition-all">
                                Rebalance Treasury
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <TreasuryStats />
                <TreasuryCharts />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <TreasuryActivity />
                    </div>
                    <div className="space-y-6">
                        {/* Info Card */}
                        <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6">
                            <h4 className="text-purple-400 font-bold mb-2 text-sm uppercase tracking-wider">Yield Strategy</h4>
                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                Idle funds are automatically deployed to <strong>Thetanuts Finance</strong> options vaults to generate organic yield on IDRX stablecoins.
                            </p>
                            <a href="#" className="text-xs text-purple-400 hover:text-white underline underline-offset-2">View Strategy Contract ↗</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
