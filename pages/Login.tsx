import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import SpotlightCard from '../components/SpotlightCard';
import { Mail, ArrowRight, Wallet as WalletIcon, AtSign, Lock } from 'lucide-react';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import { hasOnchainKit } from '../lib/onchainkit';

interface LoginProps {
    onConnectWallet: () => void;
}

export const Login: React.FC<LoginProps> = ({ onConnectWallet }) => {
    const navigate = useNavigate();
    const { isConnected, address } = useAccount();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect or handle login if wallet connects
    useEffect(() => {
        if (isConnected && address) {
            // NOTE: In a real app we'd check if user has a registered role
            // For now, we connect wallet but don't auto-redirect to dashboard 
            // because we need the 'userRole' state in App.tsx to be set.
            // The user only asked to "make the connect button function using OnchainKit".
            // We'll keep the button and let it handle the connection state.
            console.log("Wallet connected:", address);
        }
    }, [isConnected, address]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate loading
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            {/* Main Card */}
            <SpotlightCard className="w-full max-w-md p-8 pointer-events-auto" spotlightColor="rgba(59, 130, 246, 0.2)">
                <div className="text-center mb-8 relative z-10">
                    <div className="flex justify-center mb-4 cursor-pointer" onClick={() => navigate('/')}>
                        <Logo className="h-12 w-auto animate-fade-in" />
                    </div>
                    <h2 className="text-3xl font-bold font-display text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {isLogin ? 'Sign in to access your dashboard' : 'Join the decentralized workforce'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-white/5 rounded-xl mb-8 relative z-10 border border-white/5">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isLogin ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${!isLogin ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-4">
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full bg-black hover:bg-black border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all group-hover:border-white/20 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#000000_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                                style={{ backgroundColor: '#000000' }}
                                required
                            />
                            <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                                <AtSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="relative group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-black hover:bg-black border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all group-hover:border-white/20 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#000000_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                                style={{ backgroundColor: '#000000' }}
                                required
                            />
                            <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                                <Lock className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="glow"
                        className="w-full py-3 text-base flex justify-center items-center gap-2 group"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Processing...</span>
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="my-6 flex items-center gap-4 relative z-10">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-xs text-slate-500 uppercase tracking-widest">Or continue with</span>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                <div className="space-y-3 relative z-10">
                    {/* Google Button */}
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.7)] border border-blue-400/20">
                        <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Google</span>
                    </button>

                    {/* OnchainKit Connect Wallet Button */}
                    {hasOnchainKit ? (
                        <Wallet className="w-full">
                            <ConnectWallet
                                className="w-full bg-[#111] hover:bg-blue-600/10 border border-white/10 hover:border-blue-500/50 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-all"
                            >
                                <span className="text-white">Connect Wallet</span>
                            </ConnectWallet>
                        </Wallet>
                    ) : (
                        <div className="w-full bg-[#111] border border-white/10 text-slate-400 font-medium py-3 rounded-xl flex items-center justify-center gap-3">
                            <span>Set VITE_ONCHAINKIT_API_KEY to enable wallet</span>
                        </div>
                    )}
                </div>

                <p className="mt-8 text-center text-xs text-slate-500 relative z-10">
                    By continuing, you agree to our <a href="#" className="underline hover:text-white">Terms of Service</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>.
                </p>
            </SpotlightCard>
        </div>
    );
};
