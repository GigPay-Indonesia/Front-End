import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { useGigPayContract } from './useGigPayContract';

export const useGigPayRegistry = () => {
    const registry = useGigPayContract('GigPayRegistry');
    const enabled = Boolean(registry.address && registry.abi);

    const tokenRegistry = useReadContract({
        address: registry.address,
        abi: registry.abi,
        functionName: 'tokenRegistry',
        query: { enabled },
    });

    const routeRegistry = useReadContract({
        address: registry.address,
        abi: registry.abi,
        functionName: 'routeRegistry',
        query: { enabled },
    });

    const swapManager = useReadContract({
        address: registry.address,
        abi: registry.abi,
        functionName: 'swapManager',
        query: { enabled },
    });

    const yieldManager = useReadContract({
        address: registry.address,
        abi: registry.abi,
        functionName: 'yieldManager',
        query: { enabled },
    });

    return useMemo(() => ({
        registry,
        tokenRegistryAddress: tokenRegistry.data as `0x${string}` | undefined,
        routeRegistryAddress: routeRegistry.data as `0x${string}` | undefined,
        swapManagerAddress: swapManager.data as `0x${string}` | undefined,
        yieldManagerAddress: yieldManager.data as `0x${string}` | undefined,
        isLoading: tokenRegistry.isLoading || routeRegistry.isLoading || swapManager.isLoading || yieldManager.isLoading,
        error: tokenRegistry.error || routeRegistry.error || swapManager.error || yieldManager.error,
    }), [registry, tokenRegistry, routeRegistry, swapManager, yieldManager]);
};
