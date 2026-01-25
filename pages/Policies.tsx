import React from 'react';

export const Policies: React.FC = () => {
    const policies = [
        { name: 'Approval Threshold', description: 'Payments above 50.000.000 IDRX require CFO approval.', status: 'Active' },
        { name: 'Yield Automation', description: 'Enable yield when review windows exceed three days.', status: 'Active' },
        { name: 'FX Protection', description: 'Attach protection for swaps above 10.000 USDC.', status: 'Draft' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Policies
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Automate approvals, limits, and safeguards.</p>
                </div>

                <div className="space-y-4">
                    {policies.map((policy) => (
                        <div key={policy.name} className="bg-[#0f172a]/30 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-white font-bold">{policy.name}</h4>
                                <p className="text-slate-400 text-sm mt-1">{policy.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${policy.status === 'Active'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-500/10 border-slate-500/20 text-slate-300'
                                }`}>
                                {policy.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
