import React, { useState } from 'react';
import { CircleDollarSign } from 'lucide-react';

interface TokenLogoProps {
    currency: string;
    size?: number;
}

export const TokenLogo: React.FC<TokenLogoProps> = ({ currency, size = 24 }) => {
    const [error, setError] = useState(false);

    // Logos from TrustWallet assets or stable sources
    const LOGO_URLS: Record<string, string> = {
        'USDC': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        'USDT': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
        'DAI': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
        'EURC': 'https://assets.coingecko.com/coins/images/25927/small/EURC.png',
        'IDRX': '/idrx-logo.png', // Custom local asset
        'USD': 'https://flagcdn.com/w80/us.png',
    };

    if (!error && LOGO_URLS[currency.toUpperCase()]) {
        return (
            <img
                src={LOGO_URLS[currency.toUpperCase()]}
                alt={`${currency} logo`}
                width={size}
                height={size}
                className="rounded-full"
                onError={() => setError(true)}
            />
        );
    }

    // Fallback or default for USD/others
    switch (currency.toUpperCase()) {
        case 'USDC': // Fallback if image fails
            return (
                <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20"></div>
                    <div className="z-10 bg-blue-500 rounded-full flex items-center justify-center text-white" style={{ width: size, height: size }}>
                        <span className="font-bold text-[10px]">$</span>
                    </div>
                </div>
            );
        case 'IDRX': // Fallback if image fails
            return (
                <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                    <div className="absolute inset-0 bg-red-600 rounded-full opacity-20"></div>
                    <div className="z-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white" style={{ width: size, height: size }}>
                        <span className="font-bold text-[8px] tracking-tighter">Rp</span>
                    </div>
                </div>
            );
        case 'USD':
            return (
                <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                    <div className="absolute inset-0 bg-green-500 rounded-full opacity-20"></div>
                    <div className="z-10 bg-green-500 rounded-full flex items-center justify-center text-white" style={{ width: size, height: size }}>
                        <span className="font-bold text-[10px]">$</span>
                    </div>
                </div>
            );
        default:
            return <CircleDollarSign size={size} className="text-slate-400" />;
    }
};
