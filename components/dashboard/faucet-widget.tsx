import React, { useState } from 'react';
import { Droplets, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from '@coinbase/onchainkit/transaction';
import { useAccount, useWriteContract } from 'wagmi';
import { toast } from 'sonner';
import { FAUCET_CONTRACT_ADDRESS, TOKENS, TokenType } from '../../lib/contracts';
import { hasOnchainKit } from '../../lib/onchainkit';

// Minimal ABI for requestTokens
const FAUCET_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "name": "requestTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export default function FaucetWidget() {
    const { address } = useAccount();
    const [selectedToken, setSelectedToken] = useState<TokenType>('IDRX');

    const calls = [
        {
            address: FAUCET_CONTRACT_ADDRESS as `0x${string}`,
            abi: FAUCET_ABI,
            functionName: 'requestTokens',
            args: [TOKENS[selectedToken]],
        },
    ];

    const handleSuccess = () => {
        toast.success(`Successfully claimed ${selectedToken}! Check your wallet.`);
    };

    const handleError = (err: any) => {
        console.error("Faucet Error Details:", err);

        // Try to extract a readable message
        const errorMessage = err?.shortMessage || err?.message || "Unknown error";

        if (errorMessage.includes("User denied")) {
            toast.error("Transaction cancelled.");
        } else if (errorMessage.includes("cooldown")) {
            toast.error("Cooldown active! Please wait 24h.");
        } else if (errorMessage.includes("insufficient funds")) {
            toast.error("Insufficient ETH for gas on Base Sepolia.");
        } else {
            toast.error(`Failed: ${errorMessage.slice(0, 50)}...`);
        }
    };

    // Fallback component for standard writeContract

    function FaucetFallbackButton({ selectedToken, contractAddress }: { selectedToken: TokenType, contractAddress: `0x${string}` }) {
        const { writeContract, isPending } = useWriteContract();

        return (
            <button
                onClick={() => {
                    writeContract({
                        address: contractAddress,
                        abi: FAUCET_ABI,
                        functionName: 'requestTokens',
                        args: [TOKENS[selectedToken]],
                    }, {
                        onSuccess: () => toast.success(`Claimed ${selectedToken}!`),
                        onError: (err) => toast.error(err.message.split('.')[0])
                    });
                }}
                disabled={isPending}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isPending ? 'Claiming...' : `Claim ${selectedToken}`}
            </button>
        );
    }

    return (
        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/30 transition-colors w-full max-w-md mx-auto shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Droplets size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Testnet Faucet</h3>
                    <p className="text-xs text-slate-400">Claim test tokens every 24 hours</p>
                </div>
            </div>

            {/* Token Selector (Custom Tailwind Select to mimic Shadcn) */}
            <div className="space-y-4 mb-6">
                <label className="text-sm font-medium text-slate-300 ml-1">Select Token</label>
                <div className="relative group">
                    <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value as TokenType)}
                        className="w-full appearance-none bg-[#0a0f1e] text-white border border-slate-700 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer hover:bg-[#0f172a]"
                    >
                        {Object.keys(TOKENS).map((token) => (
                            <option key={token} value={token}>
                                {token}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-blue-400 transition-colors" size={16} />
                </div>

                {/* Address Display */}
                <div className="bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-800/50 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Contract</span>
                    <code className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {TOKENS[selectedToken].slice(0, 6)}...{TOKENS[selectedToken].slice(-4)}
                    </code>
                </div>
            </div>

            {/* OnchainKit Transaction Button */}
            <div className="relative">
                {hasOnchainKit && address ? (
                    <Transaction
                        calls={calls}
                        chainId={84532} // Base Sepolia
                        onSuccess={handleSuccess}
                        onError={handleError}
                    >
                        <TransactionButton
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
                            text={`Claim ${selectedToken}`}
                        />
                        <TransactionStatus>
                            <TransactionStatusLabel />
                            <TransactionStatusAction />
                        </TransactionStatus>
                    </Transaction>
                ) : address ? (
                    // Fallback for when OnchainKit is missing but wallet is connected
                    <button
                        onClick={() => {
                            // Basic toast for now, can implement standard writeContract later if needed
                            // But usually if OnchainKit missing, we just want to show "Not available" 
                            // unless we implement the full useWriteContract hook here.
                            toast.error("Faucet requires OnchainKit (VITE_ONCHAINKIT_API_KEY)");
                        }}
                        className="w-full py-3 bg-slate-800 text-slate-400 font-medium rounded-lg text-center border border-slate-700 select-none cursor-not-allowed"
                    >
                        Faucet Unavailable (Missing API Key)
                    </button>
                ) : (
                    <div className="w-full py-3 bg-slate-800 text-slate-400 font-medium rounded-lg text-center border border-slate-700 select-none">
                        Connect Wallet to Claim
                    </div>
                )}
            </div>

            {/* Footer Note */}
            <div className="mt-4 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed bg-yellow-500/5 p-2 rounded border border-yellow-500/10">
                <AlertCircle size={12} className="text-yellow-500 shrink-0 mt-0.5" />
                <p>Ensure you are on Base Sepolia testnet. You need a small amount of ETH for gas fees.</p>
            </div>
        </div>
    );
}
