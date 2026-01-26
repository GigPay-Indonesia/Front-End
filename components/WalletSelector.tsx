import React, { useState } from 'react';
import { useConnect } from 'wagmi';
import { X, Wallet } from 'lucide-react';
import { Button } from './Button';

export const WalletSelector: React.FC = () => {
    const { connectors, connect } = useConnect();
    const [isOpen, setIsOpen] = useState(false);

    const handleConnect = (connector: any) => {
        connect({ connector });
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                variant="glow"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-medium"
            >
                <Wallet className="w-5 h-5" />
                Connect Web3
            </Button>
        );
    }

    // Filter connectors
    const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');
    const otherConnectors = connectors.filter(c => c.id !== 'coinbaseWalletSDK');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal Card */}
            <div className="relative bg-[#0d1117] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 flex flex-col items-center">
                    {/* Logo Area */}
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-black font-bold text-xl">
                        <div className="w-8 h-8 bg-black rounded-full" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-8">GigPay ID</h3>

                    {/* Primary Action: Sign Up (Coinbase Smart Wallet) */}
                    {coinbaseConnector && (
                        <div className="w-full space-y-3 mb-6">
                            <button
                                onClick={() => handleConnect(coinbaseConnector)}
                                className="w-full bg-[#344bfd] hover:bg-[#2b3ed6] text-white rounded-2xl py-4 font-semibold text-lg transition-all flex items-center justify-between px-6 group"
                            >
                                <span>Sign up</span>
                                <div className="bg-white rounded-full p-0.5">
                                    <div className="w-4 h-4 rounded-full bg-[#0052ff]" />
                                </div>
                            </button>

                            <button
                                onClick={() => handleConnect(coinbaseConnector)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-3 font-bold text-md transition-all flex items-center justify-center gap-3"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                Log in with Google
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="flex items-center w-full gap-4 mb-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-sm text-slate-500 font-medium">or continue with an existing wallet</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    {/* Other Wallets List */}
                    <div className="w-full space-y-3">
                        {coinbaseConnector && (
                            <button
                                key="cb-existing"
                                onClick={() => handleConnect(coinbaseConnector)}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1e2329] hover:bg-[#2a3038] transition-all border border-transparent hover:border-white/10 group"
                            >
                                <span className="font-semibold text-white">Coinbase Wallet</span>
                                <img src="https://avatars.githubusercontent.com/u/18067904?s=200&v=4" alt="Coinbase" className="w-6 h-6 rounded-md" />
                            </button>
                        )}

                        {otherConnectors.map((connector) => (
                            <button
                                key={connector.uid}
                                onClick={() => handleConnect(connector)}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1e2329] hover:bg-[#2a3038] transition-all border border-transparent hover:border-white/10 group"
                            >
                                <span className="font-semibold text-white">
                                    {connector.name === 'MetaMask' ? 'MetaMask' : connector.name}
                                </span>
                                {connector.name === 'MetaMask' ? (
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-700" />
                                )}
                            </button>
                        ))}

                        {/* Phantom Placeholder (Manual Visual) */}
                        <button
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1e2329] hover:bg-[#2a3038] transition-all border border-transparent hover:border-white/10 group opacity-50 cursor-not-allowed"
                            title="Phantom not detected"
                        >
                            <span className="font-semibold text-white">Phantom</span>
                            <div className="w-6 h-6 rounded-full bg-[#ab9ff2] flex items-center justify-center">
                                <span className="text-[10px] text-black font-bold">P</span>
                            </div>
                        </button>
                    </div>

                    <p className="mt-8 text-center text-xs text-slate-600 max-w-xs">
                        By connecting a wallet, you agree to our <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};
