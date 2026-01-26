import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import { getContractAbi, getContractAddress } from '../abis';

export const useGigPayContract = (name: string) => {
    const chainId = useChainId();

    return useMemo(() => {
        let address = getContractAddress(name, chainId);

        // Fallback to Base Sepolia if not found on current chain (e.g. user on Mainnet)
        // This ensures Read hooks still work by pointing to the correct deployment
        if (!address) {
            address = getContractAddress(name, 84532); // BASE_SEPOLIA_CHAIN_ID
        }

        const abi = getContractAbi(name);
        return {
            chainId,
            address: address as `0x${string}` | undefined,
            abi,
        };
    }, [chainId, name]);
};
