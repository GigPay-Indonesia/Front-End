import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import SettingsProfile from '../components/settings/SettingsProfile';
import SettingsWallet from '../components/settings/SettingsWallet';
import SettingsPreferences from '../components/settings/SettingsPreferences';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'preferences'>('profile');

    const tabs = [
        { id: 'profile', label: 'General', icon: User, color: 'blue' },
        { id: 'wallet', label: 'Wallet & Security', icon: Wallet, color: 'emerald' },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon, color: 'purple' },
    ] as const;

    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Settings</h1>
                    <p className="text-slate-400">Manage your profile, wallet connection, and app preferences.</p>
                </header>

                <div className="space-y-6">
                    {/* Top Navigation (Responsive) */}
                    <nav className="flex flex-wrap gap-2 bg-[#0a0a0a]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group ${isActive
                                        ? `bg-slate-900/80 border border-slate-700 text-white shadow-lg`
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg transition-colors ${isActive ? `bg-${tab.color}-500/20 text-${tab.color}-400` : 'bg-slate-800/50 text-slate-500 group-hover:text-slate-300'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <span className={`font-bold text-sm ${isActive ? 'text-white' : ''}`}>{tab.label}</span>
                                    {isActive && <ChevronRight size={16} className={`text-${tab.color}-500`} />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Content Area */}
                    <div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="bg-[#050505]/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden min-h-[600px]"
                            >
                                {/* Background Noise & Glow */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                                <div className="relative z-10">
                                    {activeTab === 'profile' && <SettingsProfile />}
                                    {activeTab === 'wallet' && <SettingsWallet />}
                                    {activeTab === 'preferences' && <SettingsPreferences />}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
