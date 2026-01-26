import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, ShieldCheck, Zap, Share2, Bookmark } from 'lucide-react';

interface JobDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: any; // We'll refine this type later
    onApply?: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, job, onApply }) => {
    if (!job) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors z-20"
                            >
                                <X size={20} />
                            </button>

                            {/* Header Image/Pattern */}
                            <div className="h-48 relative">
                                <div className="absolute inset-0">
                                    <img
                                        src={job.bannerImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800"}
                                        alt="Banner"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>
                                </div>

                                <div className="absolute -bottom-10 left-8 flex items-end gap-6 text-left">
                                    <div className="w-24 h-24 rounded-2xl bg-[#0a0a0a] border-4 border-[#0a0a0a] shadow-2xl flex items-center justify-center relative overflow-hidden group">
                                        <img
                                            src={job.clientAvatar || `https://ui-avatars.com/api/?name=${job.client}`}
                                            alt={job.client}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="pb-4">
                                        <h2 className="text-3xl font-bold text-white leading-tight shadow-black drop-shadow-md">{job.title}</h2>
                                        <div className="flex items-center gap-3 text-slate-300 text-sm mt-1 font-medium">
                                            <span className="text-white font-bold">{job.client}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                            <span className="flex items-center gap-1"><MapPin size={12} /> Remote</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs box-content"><ShieldCheck size={12} /> Verified Entity</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 pt-14 space-y-8">

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Escrow Amount</p>
                                        <p className="text-white font-mono font-bold flex items-center gap-1">
                                            {job.budget} <span className="text-xs font-normal text-slate-500">IDRX</span>
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Escrow Type</p>
                                        <p className="text-white font-bold">{job.type}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Requested</p>
                                        <p className="text-white font-bold">{job.postedTime}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                        <p className="text-xs text-emerald-500 uppercase font-bold mb-1">Automation Level</p>
                                        <p className="text-emerald-400 font-bold flex items-center gap-1">
                                            <Zap size={14} className="fill-emerald-400" /> High
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        Escrow Overview
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                                        {job.description}
                                    </p>
                                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                                        Use this request as a template to configure recipients, assets, and release conditions for a new payment intent.
                                    </p>
                                </div>

                                {/* Skills */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Included Features</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.tags.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer Actions */}
                            <div className="p-6 border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur flex flex-col sm:flex-row items-center gap-4 justify-between z-10">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors">
                                        <Bookmark size={20} />
                                    </button>
                                    <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={onApply}
                                    className="w-full sm:w-auto flex-1 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Zap size={18} className="fill-white" />
                                    Start Escrow
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default JobDetailsModal;
