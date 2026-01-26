import React from 'react';
import { Clock, ArrowUpRight, Wallet, Eye, Zap } from 'lucide-react';

interface JobCardProps {
    title: string;
    description: string;
    budget: string;
    tags: string[];
    client: string;
    clientAvatar?: string;
    bannerImage?: string;
    postedTime: string;
    type: 'Fixed Price' | 'Hourly';
    onView?: () => void;
    onApply?: (e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
    title, description, budget, tags, client, clientAvatar, bannerImage, postedTime, type, onView, onApply
}) => {
    return (
        <div className="group relative bg-[#0f172a]/30 border border-slate-800 hover:border-blue-500/50 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:-translate-y-1 backdrop-blur-sm flex flex-col h-full">

            {/* Banner Image */}
            <div className="h-28 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 to-transparent z-10" />
                <img
                    src={bannerImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800"}
                    alt="Job Banner"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Type Badge (Overlaid on Banner) */}
                <div className="absolute top-4 right-4 z-20">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-lg ${type === 'Fixed Price'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        }`}>
                        {type}
                    </span>
                </div>
            </div>

            {/* Avatar & Header */}
            <div className="px-6 relative z-20 -mt-8 flex justify-between items-end">
                <div className="relative">
                    <img
                        src={clientAvatar || `https://ui-avatars.com/api/?name=${client}&background=random`}
                        alt={client}
                        className="w-14 h-14 rounded-2xl border-4 border-[#0f172a] shadow-lg object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0f172a]" title="Verified Client"></div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-1">
                    <Clock size={10} /> {postedTime}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 pt-3 flex-1 flex flex-col">
                <div className="mb-4">
                    <p className="text-xs text-slate-500 font-medium mb-1">Requested by <span className="text-white hover:underline cursor-pointer">{client}</span></p>
                    <h3
                        onClick={onView}
                        className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2 cursor-pointer leading-tight"
                    >
                        {title}
                    </h3>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    {tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/5 rounded-lg text-xs text-slate-300 border border-white/5 group-hover:border-primary/20 transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-5 border-t border-white/5 flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Escrow Amount</p>
                        <div className="flex items-center gap-1.5 text-white font-black font-mono text-lg">
                            <span className="text-primary text-sm">IDRX</span> {budget}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onView}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 hover:border-white/20"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>
                        <button
                            onClick={onApply}
                            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        >
                            <Zap size={16} className="fill-black" />
                            <span className="text-xs uppercase tracking-wide">Start Escrow</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
