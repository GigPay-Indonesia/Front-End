import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { useReadContract } from 'wagmi';
import type { Abi } from 'viem';
import { PaymentData } from '../../pages/CreatePayment';
import { TokenDropdown } from '../ui/TokenDropdown';
import { getTokenAddress } from '../../lib/abis';
import { ROUTE_PREFERENCE_UINT8, type SwapRoutePreference } from '../../lib/swapRoute';
import SwapRouteRegistryAbi from '../../abis/SwapRouteRegistry.abi.json';

interface Step2Props {
    data: PaymentData;
    updateFields: (field: keyof PaymentData, value: any) => void;
    routeRegistryAddress?: `0x${string}`;
}

export const Step2Amount: React.FC<Step2Props> = ({ data, updateFields, routeRegistryAddress }) => {
    const { amount } = data;
    const payout = data.recipient.payout;
    // Defensive: older saved drafts / partial state may not include `swap`.
    // Default to allow-fallback so UI remains usable.
    const swap = data.swap || ({ preference: 'ALLOW_FALLBACK' } as { preference: SwapRoutePreference });

    const assetInAddr = getTokenAddress(amount.fundingAsset) as `0x${string}` | undefined;
    const assetOutAddr = getTokenAddress(amount.payoutAsset) as `0x${string}` | undefined;
    const swapRequired = Boolean(assetInAddr && assetOutAddr && assetInAddr.toLowerCase() !== assetOutAddr.toLowerCase());

    const routeRead = useReadContract({
        address: routeRegistryAddress,
        abi: SwapRouteRegistryAbi as Abi,
        functionName: 'getRoute',
        args: swapRequired ? [assetInAddr!, assetOutAddr!] : undefined,
        query: { enabled: Boolean(routeRegistryAddress && swapRequired) },
    });

    const route = routeRead.data as
        | { rfqAllowed: boolean; fallbackAllowed: boolean; rfqVenue: string; fallbackVenue: string }
        | undefined;

    const isRouteValid = !swapRequired ? true : Boolean(route && (route.rfqAllowed || route.fallbackAllowed));
    const canFallbackOnly = Boolean(swapRequired && route?.fallbackAllowed);

    const shortAddr = (a?: string) => {
        if (!a) return '—';
        if (a.length < 12) return a;
        return `${a.slice(0, 6)}…${a.slice(-4)}`;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        updateFields('amount', { ...amount, value: formatted });
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <span className="text-primary">❖</span> Amount & Assets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <TokenDropdown
                        label="Preferred Payout Asset"
                        options={['IDRX', 'USDC', 'USDT', 'DAI', 'EURC']}
                        selected={payout.preferredAsset}
                        onChange={(asset) => {
                            updateFields('recipient', {
                                ...data.recipient,
                                payout: { ...payout, preferredAsset: asset },
                            });
                            updateFields('amount', { ...amount, payoutAsset: asset });
                        }}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Payout Method
                    </label>
                    <select
                        value={payout.payoutMethod}
                        onChange={(e) => updateFields('recipient', {
                            ...data.recipient,
                            payout: { ...payout, payoutMethod: e.target.value as PaymentData['recipient']['payout']['payoutMethod'] },
                        })}
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="ONCHAIN">Onchain</option>
                        <option value="BANK">Bank</option>
                        <option value="HYBRID">Hybrid</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Payout Address
                    </label>
                    <input
                        type="text"
                        value={payout.payoutAddress}
                        onChange={(e) => updateFields('recipient', {
                            ...data.recipient,
                            payout: { ...payout, payoutAddress: e.target.value },
                        })}
                        placeholder="0x..."
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Bank Account Reference
                    </label>
                    <input
                        type="text"
                        value={payout.bankAccountRef}
                        onChange={(e) => updateFields('recipient', {
                            ...data.recipient,
                            payout: { ...payout, bankAccountRef: e.target.value },
                        })}
                        placeholder="Optional for bank or hybrid payout"
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Settlement Preference
                </label>
                <select
                    value={payout.settlementPreference}
                    onChange={(e) => updateFields('recipient', {
                        ...data.recipient,
                        payout: { ...payout, settlementPreference: e.target.value as PaymentData['recipient']['payout']['settlementPreference'] },
                    })}
                    className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                >
                    <option value="INSTANT">Instant</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Amount
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={amount.value}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-primary/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold bg-[#1e293b] px-2 py-1 rounded text-xs">{amount.fundingAsset}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <TokenDropdown
                        label="Funding Asset"
                        options={['IDRX', 'USDC', 'USDT', 'DAI', 'EURC']}
                        selected={amount.fundingAsset}
                        onChange={(asset) => updateFields('amount', { ...amount, fundingAsset: asset })}
                    />
                </div>
                <div>
                    <TokenDropdown
                        label="Payout Asset"
                        options={['IDRX', 'USDC', 'USDT', 'DAI', 'EURC']}
                        selected={amount.payoutAsset}
                        onChange={(asset) => {
                            updateFields('amount', { ...amount, payoutAsset: asset });
                            updateFields('recipient', {
                                ...data.recipient,
                                payout: { ...payout, preferredAsset: asset },
                            });
                        }}
                    />
                </div>
            </div>

            {swapRequired && (
                <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Swap Route</div>
                            <div className="text-sm text-slate-300 mt-1">
                                Funding <span className="text-white font-bold">{amount.fundingAsset}</span> → Payout{' '}
                                <span className="text-white font-bold">{amount.payoutAsset}</span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                            {routeRead.isLoading ? 'Checking…' : isRouteValid ? 'Route OK' : 'No route'}
                        </div>
                    </div>

                    {route && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                                <div className="text-slate-500 font-bold uppercase tracking-wider">RFQ</div>
                                <div className="mt-1 text-slate-300">
                                    {route.rfqAllowed ? (
                                        <span className="text-emerald-400 font-bold">Allowed</span>
                                    ) : (
                                        <span className="text-red-300 font-bold">Not allowed</span>
                                    )}
                                </div>
                                <div className="mt-1 text-slate-500 font-mono">Venue: {shortAddr(route.rfqVenue)}</div>
                            </div>
                            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                                <div className="text-slate-500 font-bold uppercase tracking-wider">Fallback</div>
                                <div className="mt-1 text-slate-300">
                                    {route.fallbackAllowed ? (
                                        <span className="text-emerald-400 font-bold">Allowed</span>
                                    ) : (
                                        <span className="text-red-300 font-bold">Not allowed</span>
                                    )}
                                </div>
                                <div className="mt-1 text-slate-500 font-mono">Venue: {shortAddr(route.fallbackVenue)}</div>
                            </div>
                        </div>
                    )}

                    {!routeRead.isLoading && !isRouteValid && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 text-xs">
                            This payout asset is not routable from the selected funding asset. Choose another payout asset or match funding and payout.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Route Preference
                            </label>
                            <select
                                value={swap.preference}
                                onChange={(e) => {
                                    const next = e.target.value as SwapRoutePreference;
                                    updateFields('swap', { ...swap, preference: next });
                                }}
                                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 disabled:opacity-60"
                                disabled={!isRouteValid}
                            >
                                <option value="FALLBACK_ONLY" disabled={!canFallbackOnly}>
                                    Fallback only
                                </option>
                                <option value="RFQ_ONLY" disabled={!route?.rfqAllowed}>
                                    RFQ only
                                </option>
                                <option value="ALLOW_FALLBACK" disabled={!route?.fallbackAllowed}>
                                    RFQ then fallback
                                </option>
                            </select>
                            <div className="mt-2 text-[11px] text-slate-500">
                                Stored on-chain as <span className="font-mono text-slate-300">{ROUTE_PREFERENCE_UINT8[swap.preference]}</span>.
                                {swap.preference === 'FALLBACK_ONLY' && (
                                    <span className="ml-2">(Implemented via fallback-enabled route; backend supplies fallback swapData.)</span>
                                )}
                            </div>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-400">
                            <div className="text-slate-500 font-bold uppercase tracking-wider">How this works</div>
                            <div className="mt-2 leading-relaxed">
                                The escrow is created in the funding asset. If payout differs, the release uses <span className="text-slate-200 font-bold">releaseWithSwap</span> and the backend provides
                                swap payloads aligned with the route registry policy.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6 flex gap-3 items-center">
                <BadgeCheck className="text-primary shrink-0" size={20} />
                <p className="text-xs text-slate-400 leading-relaxed">
                    The payout asset determines what the recipient receives. Funding is reserved from the treasury when the payment is created.
                </p>
            </div>
        </div>
    );
};
