import React, { useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, Truck, Flag } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';

interface Step3Props {
    timing: PaymentData['timing'];
    updateTiming: (timing: PaymentData['timing']) => void;
}

export const Step3Timing: React.FC<Step3Props> = ({ timing, updateTiming }) => {
    const [isCustomDate, setIsCustomDate] = useState(false);

    const handleChange = (field: keyof PaymentData['timing'], value: string | boolean) => {
        updateTiming({ ...timing, [field]: value });
    };

    const handleWindowSelect = (days: string) => {
        setIsCustomDate(false);
        handleChange('deadline', `${days} Days`);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-primary">❖</span> Timing & Conditions
            </h2>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Release Condition
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { id: 'On approval', label: 'On Approval', desc: 'Funds released when you approve', icon: CheckCircle2 },
                        { id: 'On delivery confirmation', label: 'On Delivery', desc: 'Released upon verified delivery', icon: Truck },
                        { id: 'On milestone completion', label: 'On Milestone', desc: 'Released per completed milestone', icon: Flag }
                    ].map((condition) => (
                        <div
                            key={condition.id}
                            onClick={() => handleChange('releaseCondition', condition.id)}
                            className={`cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all duration-200 group ${timing.releaseCondition === condition.id
                                ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_-3px_rgba(0,82,255,0.3)]'
                                : 'bg-[#0f172a]/30 border-slate-800 hover:bg-[#0f172a]/50 hover:border-slate-700'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${timing.releaseCondition === condition.id ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'}`}>
                                <condition.icon size={20} />
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold ${timing.releaseCondition === condition.id ? 'text-white' : 'text-slate-300'}`}>
                                    {condition.label}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">{condition.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Release Deadline
                </label>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        {['3', '7', '14'].map((day) => (
                            <button
                                key={day}
                                onClick={() => handleWindowSelect(day)}
                                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${timing.deadline === `${day} Days` && !isCustomDate
                                    ? 'bg-primary/20 border-primary/50 text-primary'
                                    : 'bg-[#0a0a0a] border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                {day} Days
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setIsCustomDate(true);
                                handleChange('deadline', '');
                            }}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${isCustomDate
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                : 'bg-[#0a0a0a] border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            Custom
                        </button>
                    </div>

                    {isCustomDate && (
                        <div className="relative animate-fadeIn">
                            <input
                                type="number"
                                value={timing.deadline.replace(' Days', '')}
                                onChange={(e) => handleChange('deadline', `${e.target.value} Days`)}
                                placeholder="Enter days"
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Days</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={timing.enableYield}
                        onChange={(e) => handleChange('enableYield', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable Yield While Waiting</span>
                </label>
                <label className="flex items-center gap-3 bg-[#0f172a]/40 border border-slate-800 rounded-xl px-4 py-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={timing.enableProtection}
                        onChange={(e) => handleChange('enableProtection', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-300">Enable Protection</span>
                </label>
            </div>

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 flex gap-3 items-start">
                <ShieldCheck className="text-primary shrink-0" size={20} />
                <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Automatic Safeguards</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Yield can be applied to escrowed funds, and protection can be added for FX or delivery risk.
                    </p>
                </div>
            </div>
        </div>
    );
};
