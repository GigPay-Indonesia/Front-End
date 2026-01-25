import React, { useState, useEffect } from 'react';
import { Droplets, CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAbi, getContractAddress, getTokenAddress } from '../../lib/abis';
import { TokenLogo } from '../ui/TokenLogo';
import { TokenDropdown } from '../ui/TokenDropdown';
import { AnimatePresence, motion } from 'framer-motion';

const TOKENS = ['IDRX', 'USDC', 'USDT', 'DAI', 'EURC'];

export const FaucetWidget: React.FC = () => {
    const { address } = useAccount();
    const [selectedToken, setSelectedToken] = useState('USDC');
    const [txHash, setTxHash] = useState<string | null>(null);

    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Reset state after success or error when user changes token or manually dismisses
    useEffect(() => {
        if (isSuccess && hash) {
            setTxHash(hash);
        }
    }, [isSuccess, hash]);

    const handleClaim = () => {
        setTxHash(null);
        if (!address) return;

        const faucetAddress = getContractAddress('GigPayFaucet');
        const tokenAddress = getTokenAddress(selectedToken);
        const abi = getContractAbi('GigPayFaucet');

        if (!faucetAddress || !tokenAddress || !abi) {
            console.error('Missing configuration');
            return;
        }

        writeContract({
            address: faucetAddress as `0x${string}`,
            abi: abi as any,
            functionName: 'claim',
            args: [tokenAddress],
        });
    };

    const isLoading = isWritePending || isConfirming;

    return (
        <div className="bg-gradient-to-br from-blue-900/10 to-[#050505] border border-blue-500/20 rounded-2xl p-6 mb-8 relative animate-fadeIn">
            {/* Background Decoration Wrapper */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                            <Droplets size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                Testnet Faucet
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                    Base Sepolia
                                </span>
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-md leading-relaxed">
                                Claim free testnet tokens to experiment with GigPay. Requires a small amount of ETH for gas.
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch">
                        <div className="w-full sm:w-48">
                            <TokenDropdown
                                options={TOKENS}
                                selected={selectedToken}
                                onChange={setSelectedToken}
                            />
                        </div>
                        <button
                            onClick={handleClaim}
                            disabled={isLoading || !address}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isLoading
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/20 border border-blue-400/20'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Claim {selectedToken}</span>
                                    <ExternalLink size={16} className="opacity-60" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <AnimatePresence>
                    {(txHash || writeError) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="text-sm"
                        >
                            {txHash && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-3 items-center text-green-400">
                                    <CheckCircle2 size={18} className="shrink-0" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold">Claim Successful!</p>
                                        <a
                                            href={`https://base-sepolia.blockscout.com/tx/${txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs opacity-80 hover:opacity-100 hover:underline truncate block"
                                        >
                                            View TX: {txHash}
                                        </a>
                                    </div>
                                    <button onClick={() => setTxHash(null)} className="p-1 hover:bg-green-500/20 rounded-lg transition-colors">
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            )}

                            {writeError && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start text-red-400">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-bold">Claim Failed</p>
                                        <p className="text-xs opacity-80 mt-1">
                                            {(writeError as any).shortMessage || writeError.message || "An error occurred"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
