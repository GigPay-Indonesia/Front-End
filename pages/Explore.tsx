import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { JobCard } from '../components/jobs/JobCard';
import { useNavigate } from 'react-router-dom';
import { getJobs } from '../lib/api';

const FILTERS = ['All Requests', 'Yield', 'Protection', 'Split', 'FX'];

import JobDetailsModal from '../components/jobs/JobDetailsModal';

export const Explore: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('All Requests');
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRemoteOnly, setIsRemoteOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [minBudget, setMinBudget] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [jobs, setJobs] = useState<any[]>([]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                setJobs(data.jobs || []);
                setFetchError(null);
            } catch (error) {
                setFetchError('Unable to load Explore jobs.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const shortAddr = (addr?: string) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : 'Unknown');

    const toCard = (job: any) => {
        const amount = typeof job?.totalAmount === 'string' ? Number(job.totalAmount) : Number(job?.totalAmount || 0);
        const budget = Number.isFinite(amount) ? amount.toLocaleString() : '0';
        const firstIntent = job?.milestones?.[0]?.escrowIntent;
        const recipient = firstIntent?.recipient;
        const recipientName = recipient?.displayName ? String(recipient.displayName) : null;
        const recipientType = recipient?.entityType ? String(recipient.entityType) : null;
        const payout = recipient?.payout;
        const payoutMethod = payout?.payoutMethod ? String(payout.payoutMethod) : null;
        const payoutAddress = payout?.payoutAddress ? String(payout.payoutAddress) : null;

        const hasFx = Boolean(job?.fundingAsset && job?.payoutAsset && job.fundingAsset !== job.payoutAsset);
        const tags = [
            ...(Array.isArray(job?.tags) ? job.tags : []),
            job?.enableYield ? 'Yield' : null,
            job?.enableProtection ? 'Protection' : null,
            job?.fundingAsset || null,
            hasFx ? 'FX' : null,
        ].filter(Boolean);
        const postedTime = job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent';
        const type = 'Fixed Price';
        const baseNotes = job?.description || job?.notes || 'Escrow job';
        const details = [
            recipientName ? `Recipient: ${recipientName}${recipientType ? ` (${recipientType})` : ''}` : null,
            job?.fundingAsset && job?.payoutAsset ? `Assets: ${job.fundingAsset}→${job.payoutAsset}` : null,
            payoutMethod ? `Method: ${payoutMethod}${payoutAddress ? ` (${payoutAddress.slice(0, 6)}…${payoutAddress.slice(-4)})` : ''}` : null,
        ].filter(Boolean);
        const notes = details.length ? `${baseNotes} • ${details.join(' • ')}` : baseNotes;
        const client = shortAddr(job?.createdBy);
        const milestones = Array.isArray(job?.milestones) ? job.milestones : [];
        const isFullyOnchain = milestones.length > 0 && milestones.every((m: any) => m?.escrowIntent?.onchainIntentId != null);
        const onchainIntentId =
            milestones.find((m: any) => m?.escrowIntent?.onchainIntentId != null)?.escrowIntent?.onchainIntentId ?? null;

        return {
            id: job?.id || `${client}-${postedTime}`,
            title: job?.title || `Escrow Job • ${client}`,
            description: notes,
            budget,
            tags,
            client,
            clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
            bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
            postedTime,
            type,
            jobId: job?.id,
            onchainIntentId,
            isFullyOnchain,
            assetSymbol: job?.fundingAsset || undefined,
        };
    };

    const cards = useMemo(() => jobs.map(toCard).filter((job) => job.isFullyOnchain), [jobs]);

    // Filter Logic
    const filteredJobs = cards.filter(job => {
        // 1. Search Query
        const matchesSearch =
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            job.client.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Category Filter
        const matchesCategory = activeFilter === 'All Requests' ||
            (activeFilter === 'Yield' && job.tags.includes('Yield')) ||
            (activeFilter === 'Protection' && job.tags.includes('Protection')) ||
            (activeFilter === 'Split' && job.tags.includes('Split')) ||
            (activeFilter === 'FX' && job.tags.includes('FX'));

        // 3. Remote Filter
        const matchesRemote = !isRemoteOnly || true;

        // 4. Budget Filter
        const jobBudget = parseInt(job.budget.replace(/,/g, ''));
        const matchesBudget = jobBudget >= minBudget;

        return matchesSearch && matchesCategory && matchesRemote && matchesBudget;
    });

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-purple-500/10 blur-[140px]" />
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-fadeIn">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Explore Jobs
                        </h1>
                        <p className="text-slate-500 mt-2 max-w-lg">
                            Discover public escrow jobs and join to submit milestone work.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
                            {isLoading ? (
                                <span className="text-slate-400">Loading escrow feed...</span>
                            ) : fetchError ? (
                                <span className="text-red-300">Explore feed unavailable</span>
                            ) : (
                                <span className="text-emerald-300">{cards.length} jobs</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="z-30 bg-[#050505]/80 backdrop-blur-md py-4 mb-8 -mx-4 px-4 border-b border-slate-800/50">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search by request, template, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all shadow-lg"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 border rounded-xl transition-all flex items-center gap-2 font-medium whitespace-nowrap ${showFilters
                                ? 'bg-slate-800 border-slate-700 text-white'
                                : 'bg-[#0a0a0a] border-slate-800 text-slate-400 hover:bg-slate-900'
                                }`}
                        >
                            <SlidersHorizontal size={18} /> Filters
                        </button>
                        <button
                            onClick={() => setIsRemoteOnly(!isRemoteOnly)}
                            className={`px-6 py-3 border rounded-xl transition-all flex items-center gap-2 font-medium whitespace-nowrap ${isRemoteOnly
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-[#0a0a0a] border-slate-800 text-slate-400 hover:bg-slate-900'
                                }`}
                        >
                            <MapPin size={18} /> Requires Approval
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="max-w-7xl mx-auto mt-4 p-6 bg-[#0a0a0a] border border-slate-800 rounded-2xl animate-fadeInUp shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Min. Amount (IDRX)</h3>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50000000"
                                        step="1000000"
                                        value={minBudget}
                                        onChange={(e) => setMinBudget(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                                        <span>0</span>
                                        <span className="text-primary font-bold">{minBudget.toLocaleString()}</span>
                                        <span>50M+</span>
                                    </div>
                                </div>
                                {/* Additional filters could go here */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Request Type</h3>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-700">One-time</button>
                                        <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-700">Retainer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Chips */}
                    <div className="max-w-7xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jobs Grid (Using JobCard component which is Glassmorphic/Banner style) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
                    {isLoading ? (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            Loading escrow requests...
                        </div>
                    ) : fetchError ? (
                        <div className="col-span-full py-20 text-center text-red-300">
                            {fetchError}
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                title={job.title}
                                description={job.description}
                                budget={job.budget}
                                assetSymbol={job.assetSymbol}
                                tags={job.tags}
                                client={job.client}
                                clientAvatar={job.clientAvatar}
                                bannerImage={job.bannerImage}
                                postedTime={job.postedTime}
                                type={job.type as any}
                                onView={() => setSelectedJob(job)}
                                onApply={(e) => {
                                    e.stopPropagation();
                                    navigate(`/explore/${job.jobId}`);
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-slate-500" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No requests found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveFilter('All Requests'); setIsRemoteOnly(false); }}
                                className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Job Details Modal - The premium detail view */}
            <JobDetailsModal
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                job={selectedJob}
                onApply={() => {
                    if (selectedJob?.jobId) navigate(`/explore/${selectedJob.jobId}`);
                }}
            />
        </div>
    );
};
