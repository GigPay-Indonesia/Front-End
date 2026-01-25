import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import { getContractAbi, getContractAddress } from '../abis';

export const useGigPayContract = (name: string) => {
    const chainId = useChainId();

    return useMemo(() => {
        const address = getContractAddress(name, chainId);
        const abi = getContractAbi(name);
        return {
            chainId,
            address: address as `0x${string}` | undefined,
            abi,
        };
    }, [chainId, name]);
};
