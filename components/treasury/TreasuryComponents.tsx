import React from 'react';
import { Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- Treasury Stats Component ---
export const TreasuryStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-primary-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet size={64} className="text-primary-400" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-xl bg-primary/20 text-primary`}>
                        <Wallet size={20} />
                    </div>
                    <span className="text-slate-400 font-bold text-sm tracking-wider uppercase">Liquid Buffer</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">300.000.000 IDRX</h3>
                <p className="text-slate-500 text-xs">Available for withdrawals</p>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={64} className="text-purple-400" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <TrendingUp size={20} />
                    </div>
                    <span className="text-slate-400 font-bold text-sm tracking-wider uppercase">Active Yield Strategy</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-white mb-1">1.200.000.000 IDRX</h3>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs font-bold border border-purple-500/30">APY: 5.4%</span>
                </div>
                <p className="text-slate-500 text-xs">Deployed to Aave / Thetanuts</p>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign size={64} className="text-green-400" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                        <DollarSign size={20} />
                    </div>
                    <span className="text-slate-400 font-bold text-sm tracking-wider uppercase">All-Time Earnings</span>
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-1">+45.000.000 IDRX</h3>
                <p className="text-slate-500 text-xs">Total yield generated</p>
            </div>
        </div>
    );
};

// --- Treasury Charts Component ---
const dataGrowth = [
    { name: 'Jan', principal: 1000, yield: 5 },
    { name: 'Feb', principal: 1100, yield: 12 },
    { name: 'Mar', principal: 1150, yield: 25 },
    { name: 'Apr', principal: 1300, yield: 45 },
    { name: 'May', principal: 1400, yield: 80 },
    { name: 'Jun', principal: 1500, yield: 120 },
];

const dataAllocation = [
    { name: 'Liquid Buffer', value: 20, color: '#06b6d4' }, // Cyan 500
    { name: 'Yield Strategy', value: 80, color: '#a855f7' }, // Purple 500
];

export const TreasuryCharts: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Growth Chart */}
            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-cyan-400 rounded-full"></span>
                    Treasury Growth
                </h4>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataGrowth}>
                            <defs>
                                <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m IDRX`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="principal" stackId="1" stroke="#06b6d4" fill="url(#colorPrincipal)" name="Principal" />
                            <Area type="monotone" dataKey="yield" stackId="1" stroke="#22c55e" fill="url(#colorYield)" name="Yield" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Allocation Chart */}
            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-400 rounded-full"></span>
                    Asset Allocation
                </h4>
                <div className="h-[300px] w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dataAllocation}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dataAllocation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-3xl font-bold text-white">80%</p>
                        <p className="text-xs text-slate-400 uppercase">Deployed</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Treasury Activity Component ---
export const TreasuryActivity: React.FC = () => {
    const activities = [
        { date: '2025-05-20', action: 'Yield Harvest', amount: '+12,500,000', hash: '0x8f...2a91' },
        { date: '2025-05-18', action: 'Strategy Rebalance', amount: '0', hash: '0x1b...9c33' },
        { date: '2025-05-15', action: 'Deposit', amount: '+300,000,000', hash: '0xe4...11f0' },
        { date: '2025-05-12', action: 'Yield Harvest', amount: '+8,200,000', hash: '0x3d...77e2' },
        { date: '2025-05-01', action: 'Deposit', amount: '+500,000,000', hash: '0x9a...55b1' },
    ];

    return (
        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
                <h4 className="text-white font-bold flex items-center gap-2">
                    <span className="w-1 h-5 bg-slate-500 rounded-full"></span>
                    Recent Activity
                </h4>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">View All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#0f172a] text-slate-400 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4 text-right">Amount (IDRX)</th>
                            <th className="px-6 py-4 text-right">Tx Hash</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {activities.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                                <td className="px-6 py-4 text-slate-300 font-mono">{item.date}</td>
                                <td className="px-6 py-4 text-white font-medium">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.action.includes('Harvest') ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        item.action.includes('Deposit') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                        }`}>
                                        {item.action}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-mono font-bold ${item.amount.startsWith('+') ? 'text-green-400' : 'text-slate-300'
                                    }`}>
                                    {item.amount}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a href="#" className="text-cyan-400 hover:text-cyan-300 font-mono text-xs">{item.hash}</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
