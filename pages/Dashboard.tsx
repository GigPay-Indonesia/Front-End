import React from 'react';
import { StatsGrid, PendingActionsList, ProfileActions, ActivityPreviewTable, EntitiesPreviewTable } from '../components/dashboard/DashboardComponents';
import { ShieldCheck } from 'lucide-react';
import { useAccount } from 'wagmi';
import { FaucetWidget } from '../components/dashboard/FaucetWidget';
import { useTreasuryData } from '../hooks/useTreasuryData';

export const Overview: React.FC = () => {
    const { address } = useAccount();

    // Real Data from Contracts
    const { treasuryBalance, inYield, inEscrow } = useTreasuryData();

    const dashboardData = {
        treasuryBalance: treasuryBalance || '0.00',
        inEscrow: inEscrow || '0.00',
        inYield: inYield || '0.00',
        pendingActions: 3 // Mock for now
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Overview
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Treasury status and approvals in one view.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-slate-400 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-green-400" />
                            Network Healthy
                        </span>
                    </div>
                </div>

                {/* Faucet Widget */}
                <FaucetWidget />

                {/* 1. Stats Grid */}
                <StatsGrid {...dashboardData} />

                {/* 2. Main Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Left Column (Active Work) - Spans 2 cols */}
                    <div className="lg:col-span-2">
                        <PendingActionsList />
                    </div>

                    {/* Right Column (Profile & Actions) - Spans 1 col */}
                    <div className="lg:col-span-1 space-y-6">
                        <ProfileActions walletAddress={address} />
                    </div>
                </div>

                {/* 3. Bottom Section (Activity + Entities) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityPreviewTable />
                    <EntitiesPreviewTable />
                </div>

            </div>
        </div>
    );
};
