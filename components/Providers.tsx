import { OnchainKitProvider } from '@coinbase/onchainkit';
import { defineChain } from 'viem';
import { base, baseSepolia } from 'wagmi/chains';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { hasOnchainKit, onchainApiKey } from '../lib/onchainkit';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
    chains: [base, baseSepolia],
    transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
    },
});

export function Providers({ children }: { children: ReactNode }) {
    if (!hasOnchainKit) {
        console.warn(
            'VITE_ONCHAINKIT_API_KEY is not set. OnchainKit components are disabled.'
        );
    }

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {hasOnchainKit ? (
                    <OnchainKitProvider apiKey={onchainApiKey!} chain={baseSepolia}>
                        {children}
                    </OnchainKitProvider>
                ) : (
                    children
                )}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
