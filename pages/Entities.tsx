import React from 'react';

export const Entities: React.FC = () => {
    const entities = [
        { name: 'Nusa Creative Studio', type: 'Vendor', asset: 'IDRX', risk: 'Low', totalPaid: '225.000.000' },
        { name: 'PT SatuTek', type: 'Supplier', asset: 'USDC', risk: 'Medium', totalPaid: '480.000.000' },
        { name: 'Karsa Logistics', type: 'Partner', asset: 'IDRX', risk: 'Low', totalPaid: '95.000.000' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Entities
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage recipients, payout preferences, and risk profiles.</p>
                </div>

                <div className="bg-[#0f172a]/30 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 uppercase font-bold text-[10px] tracking-widest border-b border-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Preferred Asset</th>
                                    <th className="px-6 py-4">Risk Profile</th>
                                    <th className="px-6 py-4 text-right">Total Paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {entities.map((entity) => (
                                    <tr key={entity.name} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white font-semibold">{entity.name}</td>
                                        <td className="px-6 py-4 text-slate-300">{entity.type}</td>
                                        <td className="px-6 py-4 text-slate-300">{entity.asset}</td>
                                        <td className="px-6 py-4 text-slate-300">{entity.risk}</td>
                                        <td className="px-6 py-4 text-right text-white font-mono">{entity.totalPaid}</td>
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
