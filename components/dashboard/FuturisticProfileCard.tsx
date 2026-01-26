import React, { useState } from 'react';
import { Copy, CheckCircle, Verified, Star, Hexagon, Zap } from 'lucide-react';
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
        <div className="relative group w-full">
            {/* Card Container */}
            <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden transition-all duration-500 hover:bg-[#0f172a]/60 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">

                {/* Background Ambient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

                {/* Profile Header */}
                <div className="relative z-10 flex flex-col items-center text-center">

                    {/* Avatar Ring */}
                    <div className="relative mb-6 group/avatar">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-md opacity-50 group-hover/avatar:opacity-80 transition-opacity duration-500"></div>
                        <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-blue-500 relative bg-clip-padding">
                            <div className="w-full h-full rounded-full bg-[#050505] p-1 overflow-hidden relative">
                                <img
                                    src={avatarUrl || '/avatars/alex.png'}
                                    alt={name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
                                />
                            </div>
                        </div>
                        {/* Status Dot */}
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#050505] rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </div>

                    {/* Name & Handle */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                            {name}
                            <Verified size={18} className="text-blue-400 fill-blue-500/20" />
                        </h3>
                        <p className="text-slate-400 font-medium text-sm">@{handle}</p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-center gap-8 w-full mb-8 border-y border-white/5 py-6">
                        <div className="text-center">
                            <p className="text-xl font-black text-white">Lvl 5</p>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Rank</p>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-xl font-black text-white flex items-center gap-1">
                                98%
                            </p>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Success</p>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-xl font-black text-white">4.9</p>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Rating</p>
                        </div>
                    </div>

                    {/* Copy Address Button */}
                    <button
                        onClick={handleCopy}
                        className="w-full max-w-[240px] group/btn bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl p-1.5 pr-4 flex items-center justify-between transition-all"
                    >
                        <div className="bg-[#050505] rounded-lg p-2 text-slate-400 group-hover/btn:text-white transition-colors">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {isCopied ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                        >
                                            <CheckCircle size={16} className="text-emerald-400" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                        >
                                            <Copy size={16} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-300 group-hover/btn:text-white transition-colors">
                            {displayAddress}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FuturisticProfileCard;
