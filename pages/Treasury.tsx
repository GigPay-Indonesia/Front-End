import React from 'react';
import { TreasuryStats, TreasuryCharts, TreasuryActivity } from '../components/treasury/TreasuryComponents';
import { ArrowUpRight, TrendingUp, X, Loader2, CheckCircle } from 'lucide-react';

import { useTreasuryData } from '../hooks/useTreasuryData';
import { useTreasuryActivity } from '../hooks/useTreasuryActivity';
import { useAddFunds } from '../hooks/useAddFunds';
import { getContractAddress, getExplorerBaseUrl } from '../lib/abis';

// --- Treasury.tsx ---
export const Treasury: React.FC = () => {
    const { treasuryBalance, inYield, allocationData, assets } = useTreasuryData();
    const { activities, isLoading: isActivityLoading } = useTreasuryActivity();
    const {
        amount, setAmount, selectedToken, setSelectedToken, availableTokens, isModalOpen, setIsModalOpen, handleAddFunds,
        isLoading: isFunding, isSuccess: isFunded, hash: fundHash, reset,
        formattedBalance, handleMax
    } = useAddFunds();

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    return (
        <div className="min-h-screen text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Add Funds Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative shadow-2xl overflow-visible group">
                        {/* Background Gradients */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                        <button onClick={reset} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-20 bg-white/5 hover:bg-white/10 p-2 rounded-full">
                            <X size={20} />
                        </button>

                        {!isFunded ? (
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Add Funds</h3>
                                <p className="text-slate-400 text-sm mb-8 font-medium">Deposit assets into the Company Treasury.</p>

                                <div className="space-y-6">
                                    {/* Amount Input & Token Select */}
                                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-slate-500">Balance: {formattedBalance}</span>
                                                <button onClick={handleMax} className="text-xs font-bold text-blue-400 cursor-pointer hover:text-blue-300 uppercase">Max</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-transparent text-3xl font-black text-white placeholder:text-slate-700 outline-none"
                                            />
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl transition-all border border-white/5 whitespace-nowrap min-w-[120px] justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {selectedToken === 'IDRX' ? (
                                                            <img src="/idrx-logo.png" className="w-5 h-5 rounded-full object-cover" alt="IDRX" />
                                                        ) : (
                                                            <img
                                                                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${selectedToken.toLowerCase() === 'eurc' ? 'eur' : selectedToken.toLowerCase()}.png`}
                                                                className="w-5 h-5 rounded-full"
                                                                alt={selectedToken}
                                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }}
                                                            />
                                                        )}
                                                        {selectedToken}
                                                    </div>
                                                    {/* Chevron */}
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>

                                                {/* Dropdown Content */}
                                                {isDropdownOpen && (
                                                    <div className="absolute right-0 top-full mt-2 w-40 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                                        {availableTokens.map(token => (
                                                            <button
                                                                key={token}
                                                                onClick={() => { setSelectedToken(token); setIsDropdownOpen(false); }}
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                                            >
                                                                {token === 'IDRX' ? (
                                                                    <img src="/idrx-logo.png" className="w-5 h-5 rounded-full object-cover" alt="IDRX" />
                                                                ) : (
                                                                    <img
                                                                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${token.toLowerCase() === 'eurc' ? 'eur' : token.toLowerCase()}.png`}
                                                                        className="w-5 h-5 rounded-full"
                                                                        alt={token}
                                                                    />
                                                                )}
                                                                {token}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Backdrop to close dropdown */}
                                                {isDropdownOpen && (
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info details */}
                                    <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10">
                                        <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                                            <span>Exchange Rate</span>
                                            <span className="text-slate-300">1 {selectedToken} = 1 {selectedToken}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-slate-400">
                                            <span>Network Fee</span>
                                            <span className="text-slate-300">~0.0001 ETH</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddFunds}
                                        disabled={isFunding || !amount}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                    >
                                        {isFunding ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Deposit'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Success Receipt UI
                            <div className="relative z-10 text-center py-6">
                                <div className="mb-8 relative flex items-center justify-center">
                                    {/* Animated Background Glow */}
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="w-24 h-24 bg-[#0a0a0a] rounded-full flex items-center justify-center relative z-10 border-4 border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.5)] animate-in zoom-in-50 duration-500">
                                        {/* Token Logo */}
                                        {selectedToken === 'IDRX' ? (
                                            <img src="/idrx-logo.png" className="w-14 h-14 object-cover rounded-full drop-shadow-2xl" alt="IDRX" />
                                        ) : (
                                            <img
                                                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${selectedToken.toLowerCase() === 'eurc' ? 'eur' : selectedToken.toLowerCase()}.png`}
                                                className="w-14 h-14 rounded-full drop-shadow-2xl"
                                                alt={selectedToken}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }}
                                            />
                                        )}
                                        {/* Success Badge Overlay */}
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-[#0f172a] shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                                            <CheckCircle size={16} strokeWidth={4} />
                                        </div>
                                    </div>
                                </div>
                                <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">Deposit Successful!</h4>
                                <p className="text-slate-400 text-sm mb-8">Your assets have been secured in the vault.</p>

                                {/* Receipt Ticket */}
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>

                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Amount</span>
                                        <span className="text-white font-black text-xl tracking-tight">{amount} <span className="text-base text-slate-400">{selectedToken}</span></span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Transaction Hash</span>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`${getExplorerBaseUrl()}/tx/${fundHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-400 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                                            >
                                                {fundHash?.substring(0, 6)}...{fundHash?.substring(fundHash?.length - 4)}
                                                <ArrowUpRight size={10} />
                                            </a>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(fundHash || '');
                                                    // Optional: You could add a toast here, but for now the action is enough
                                                }}
                                                className="text-slate-500 hover:text-white transition-colors"
                                                title="Copy Hash"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={reset} className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Background Ambient Effects */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none translate-y-1/2"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header & TVL Command Center */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div className="space-y-4">

                        <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-600 tracking-tighter drop-shadow-2xl">
                            Treasury
                        </h1>
                        <p className="text-slate-400 max-w-lg leading-relaxed text-sm font-medium">
                            Real-time monitoring of all protocol assets, yield strategies, and liquid allocations. Managed by the GigPay DAO Policy.
                        </p>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-2xl hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:-translate-y-1 active:translate-y-0 text-sm flex items-center gap-2"
                        >
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Add Funds
                        </button>
                        <button className="px-8 py-4 bg-white/[0.05] text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-sm backdrop-blur-md hover:-translate-y-1 border border-white/5">
                            Manage Strategy
                        </button>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <TreasuryStats treasuryBalance={treasuryBalance} inYield={inYield} />

                {/* Charts Section */}
                <TreasuryCharts allocationData={allocationData} />

                {/* Lower Section: Activity & Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Activity Feed */}
                    <div className="lg:col-span-2">
                        <TreasuryActivity activities={activities} isLoading={isActivityLoading} />
                    </div>

                    {/* Breakdown & Info Side Panel */}
                    <div className="space-y-8">
                        {/* Compact Asset Breakdown */}
                        <div className="bg-[#0a0a0a]/40 rounded-[2rem] p-8 backdrop-blur-sm hover:bg-[#0a0a0a]/60 transition-all duration-500 group">
                            <h4 className="text-white font-black mb-6 flex items-center gap-3 text-sm uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-white group-hover:scale-150 transition-all"></div>
                                Asset Breakdown
                            </h4>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {assets && assets.length > 0 ? (
                                    assets.map((asset) => (
                                        <div key={asset.symbol} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all hover:scale-[1.02] cursor-default group/item">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0 overflow-hidden shadow-lg group-hover/item:shadow-blue-500/30 transition-shadow">
                                                    <img
                                                        src={asset.logo}
                                                        alt={asset.symbol}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm group-hover/item:text-blue-200 transition-colors">{asset.symbol}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{asset.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white font-mono text-sm">
                                                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: "compact", compactDisplay: "short" }).format(asset.balance)}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold">
                                                    ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: "compact" }).format(asset.usdValue)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 text-xs font-medium">
                                        No assets found in treasury.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-[2rem] p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/20 transition-all duration-500"></div>

                            <h4 className="text-purple-300 font-black mb-4 text-xs uppercase tracking-widest flex items-center gap-2 relative z-10">
                                <TrendingUp size={16} className="text-purple-400" /> Yield Strategy
                            </h4>
                            <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium relative z-10">
                                Idle funds are deployed to <span className="text-white font-bold">Thetanuts Finance</span> option vaults. API3 is used for oracle feeds.
                            </p>
                            <a
                                href={`${getExplorerBaseUrl()}/address/${getContractAddress('ThetanutsVaultStrategyV2')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="relative z-10 inline-flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-wider transition-all bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25"
                            >
                                View Contract <ArrowUpRight size={12} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
