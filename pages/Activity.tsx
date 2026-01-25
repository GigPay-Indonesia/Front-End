import React from 'react';

export const Activity: React.FC = () => {
    const activities = [
        { action: 'Payment Funded', amount: '- 15.000.000 IDRX', time: '2 mins ago', status: 'Funded' },
        { action: 'Payment Submitted', amount: '—', time: '3 hours ago', status: 'Submitted' },
        { action: 'Payment Released', amount: '- 8.500.000 IDRX', time: '1 day ago', status: 'Released' },
        { action: 'Payment Refunded', amount: '+ 5.000.000 IDRX', time: '3 days ago', status: 'Refunded' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Activity
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Audit trail for treasury, payments, and approvals.</p>
                </div>

                <div className="bg-[#0f172a]/30 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {activities.map((item, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white font-semibold">{item.action}</td>
                                        <td className="px-6 py-4 font-mono text-slate-300">{item.amount}</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs font-mono">{item.time}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${item.status === 'Released'
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                : item.status === 'Submitted'
                                                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                    : item.status === 'Funded'
                                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                        : 'bg-slate-500/10 border-slate-500/20 text-slate-300'
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
            </div>
        </div>
    );
};
