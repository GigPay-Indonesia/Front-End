import React, { useState } from 'react';
import { Copy, CheckCircle, Wifi, Hexagon, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FuturisticProfileCardProps {
    walletAddress?: string;
    avatarUrl?: string;
    name?: string;
    handle?: string;
    rank?: string;
}

const FuturisticProfileCard: React.FC<FuturisticProfileCardProps> = ({
    walletAddress,
    avatarUrl = '/avatars/alex.png',
    name = 'Zennz',
    handle = 'zennz.base',
    rank = 'Elite'
}) => {
    const [isCopied, setIsCopied] = useState(false);

    // Format address
    const displayAddress = walletAddress
        ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
        : '0x...';

    const handleCopy = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="relative group perspective-1000 w-full min-h-[320px]">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700"></div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-[#050505] border border-slate-800 hover:border-slate-700 rounded-[32px] overflow-hidden flex flex-col transition-colors duration-300"
            >
                {/* Top Section - Signal & Chip */}
                <div className="p-6 pb-0 flex justify-between items-start z-10">
                    {/* Chip Graphic */}
                    <div className="w-12 h-9 bg-gradient-to-br from-amber-200 to-amber-500 rounded-md border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-900/40"></div>
                        <div className="absolute bottom-1/3 left-0 right-0 h-[1px] bg-amber-900/40"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-amber-900/40"></div>
                    </div>
                </div>

                {/* Cyber Avatar Section */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-6">
                    {/* Rotating Rings */}
                    <div className="absolute w-40 h-40 border border-dashed border-slate-800 rounded-full animate-[spin_10s_linear_infinite] opacity-30"></div>
                    <div className="absolute w-36 h-36 border border-slate-800 rounded-full animate-[spin_15s_linear_infinite_reverse] opacity-20"></div>

                    {/* Avatar Hexagon */}
                    <div className="relative w-28 h-28">
                        {/* Hexagon Clip Path */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative w-24 h-24 rounded-full p-1 bg-surface">
                            <img
                                src="https://pbs.twimg.com/profile_images/1699968415714488320/2X_7j8-a_400x400.jpg"
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-2 border-primary/50"
                            />
                            {/* Glitch Overlay Effect on Hover */}
                            <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors duration-300 pointer-events-none mix-blend-overlay"></div>
                        </div>
                    </div>

                    {/* Rank Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-black border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                        <Hexagon size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[9px] font-black uppercase text-amber-100 tracking-wider">Lvl 5</span>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <h3 className="text-white font-black text-2xl tracking-tight mb-1">{name}</h3>
                    <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">{rank} Member</p>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">98<span className="text-primary text-sm">%</span></div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Success Rate</div>
                    </div>
                </div>

                {/* Bottom Section - Address & Actions */}
                <div className="p-4 bg-slate-900/50 border-t border-slate-800/50 backdrop-blur-sm z-10">
                    <button
                        onClick={handleCopy}
                        className="w-full group/btn relative overflow-hidden bg-black border border-slate-800 hover:border-primary/50 rounded-xl p-3 flex items-center justify-between transition-all duration-300"
                    >
                        <div className="flex flex-col items-start pl-1">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Wallet ID</span>
                            <span className="font-mono text-sm text-slate-300 font-bold tracking-wider group-hover/btn:text-white transition-colors">
                                {displayAddress}
                            </span>
                        </div>

                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover/btn:bg-primary/10 group-hover/btn:border-primary/30 transition-all">
                            <AnimatePresence mode="wait">
                                {isCopied ? (
                                    <motion.div
                                        key="check"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                    >
                                        <CheckCircle size={18} className="text-emerald-400" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="copy"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                    >
                                        <Copy size={16} className="text-slate-500 group-hover/btn:text-primary" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </button>

                    {/* Decorative bottom lines */}
                    <div className="flex gap-1 mt-3 justify-center opacity-30">
                        <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                        <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                        <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                        <div className="w-12 h-1 rounded-full bg-slate-800"></div>
                    </div>
                </div>

                {/* Holographic Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"></div>
            </motion.div>
        </div>
    );
};

export default FuturisticProfileCard;
