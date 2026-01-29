import { http, createConfig, createStorage } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, metaMask } from 'wagmi/connectors';

export const config = createConfig({
    // Option A: lock dApp to Base Sepolia to avoid cross-chain mismatch (TVL showing as 0).
    chains: [baseSepolia],
    multiInjectedProviderDiscovery: false,
    storage: createStorage({
        storage: window.localStorage,
        key: 'gigpay-v3-fix', // Force new session to clear auto-connect cache
    }),
    connectors: [
        coinbaseWallet({
            appName: 'GigPay Indonesia',
            // Force Smart Wallet (Account Abstraction) flow (supports Google/social login).
            // Coinbase Wallet browser extension/mobile app remains accessible via the generic injected connector.
            preference: {
                options: 'smartWalletOnly',
            },
            version: '4',
        }),
        metaMask(),
        // Generic injected connector for other browser wallets (Rabby, Brave, OKX, etc.)
        injected(),
    ],
    transports: {
        [baseSepolia.id]: http(),
    },
});