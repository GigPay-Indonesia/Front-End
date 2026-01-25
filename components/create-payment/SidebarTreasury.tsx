import React from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';
interface SidebarTreasuryProps {
    amount: string;
}

export const SidebarTreasury: React.FC<SidebarTreasuryProps> = ({ amount }) => {
    // Determine amount safely
    const amountVal = parseInt(amount.replace(/\./g, '')) || 0;

    // Fixed treasury balance for demo simulation (e.g. 5M IDRX)
    const SIMULATED_TREASURY_BALANCE = 5000000000;
    const remainingBalance = SIMULATED_TREASURY_BALANCE - amountVal;

    // Formatting
    const fmt = (n: number) => n.toLocaleString('id-ID');

    // Chart logic: Just a simple visual representation
    // We'll scale the "impact" bar based on amount vs treasury (capped for visual reasons)
    const percentage = Math.min((amountVal / 100000000) * 100, 100); // Arbitrary scale for visuals

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Treasury Preview</h4>
                    <BarChart3 size={16} className="text-slate-500" />
                </div>

                {/* Simulated Bar Chart */}
                <div className="flex items-end gap-2 h-32 mb-6 px-2">
                    <div className="w-1/6 bg-slate-800 h-[40%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-slate-800 h-[60%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-slate-800 h-[50%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-slate-700 h-[70%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-slate-700 h-[80%] rounded-t-sm"></div>
                    <div
                        className={amountVal > 0 ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_-3px_rgba(0,82,255,0.3)] relative transition-all duration-500' : 'w-1/6 bg-slate-700 rounded-t-sm relative transition-all duration-500'}
                        style={{ height: `${Math.max(20, Math.min(95, 40 + (amountVal / 5000000)))}%` }}
                    >
                        {amountVal > 0 && <div className="absolute inset-0 bg-primary/40 blur-[2px]" />}
                        <div className="absolute -top-1 w-full h-0.5 bg-white shadow-[0_0_10px_white]"></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">TOTAL TREASURY BALANCE</span>
                        <span className="text-white font-bold">{fmt(SIMULATED_TREASURY_BALANCE)} IDRX</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">ALLOCATION IMPACT</span>
                        <span className="text-red-400 font-bold">- {amount || '0'} IDRX</span>
                    </div>
                    <div className="h-px bg-slate-800 my-2"></div>
                    <div className="flex justify-between text-xs pt-1">
                        <span className="text-slate-300 font-bold">Remaining</span>
                        <span className="text-primary font-bold">{fmt(remainingBalance)} IDRX</span>
                    </div>
                </div>

                <div className="mt-6 bg-primary/20 border border-primary/50 rounded-xl p-4 flex gap-3">
                    <ShieldCheck className="text-primary shrink-0" size={20} />
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Upon confirmation, <span className="text-primary">{amount || '0'} IDRX</span> will be securely held in escrow until release conditions are met.
                    </p>
                </div>
            </div>
        </div>
    );
};
