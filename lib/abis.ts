import CompanyTreasuryVaultAbi from '../abis/CompanyTreasuryVault.abi.json';
import CompositeSwapManagerAbi from '../abis/CompositeSwapManager.abi.json';
import GigPayEscrowCoreV2Abi from '../abis/GigPayEscrowCoreV2.abi.json';
import GigPayFaucetAbi from '../abis/GigPayFaucet.abi.json';
import GigPayRegistryAbi from '../abis/GigPayRegistry.abi.json';
import MockDAIAbi from '../abis/MockDAI.abi.json';
import MockEURCAbi from '../abis/MockEURC.abi.json';
import MockIDRXAbi from '../abis/MockIDRX.abi.json';
import MockUSDCAbi from '../abis/MockUSDC.abi.json';
import MockUSDTAbi from '../abis/MockUSDT.abi.json';
import SwapRouteRegistryAbi from '../abis/SwapRouteRegistry.abi.json';
import TokenRegistryAbi from '../abis/TokenRegistry.abi.json';
import YieldManagerV2ABI from '../abis/YieldManagerV2.abi.json';
import ThetanutsVaultStrategyV2ABI from '../abis/ThetanutsVaultStrategyV2.abi.json';
import { BASE_SEPOLIA_CHAIN_ID, CONTRACTS_BY_CHAIN } from './contracts';

export {
    GigPayRegistryAbi as GigPayRegistryABI,
    GigPayEscrowCoreV2Abi as GigPayEscrowCoreV2ABI,
    CompanyTreasuryVaultAbi as CompanyTreasuryVaultABI,
    MockUSDCAbi as MockUSDCABI, // Export this
    YieldManagerV2ABI,
    ThetanutsVaultStrategyV2ABI
};

type NetworkConfig = {
    chainId: number;
    explorerBaseUrl: string;
};

const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
    'base-sepolia': {
        chainId: BASE_SEPOLIA_CHAIN_ID,
        explorerBaseUrl: 'https://base-sepolia.blockscout.com',
    },
};

const DEFAULT_NETWORK_KEY = 'base-sepolia';

const TOKEN_CONTRACTS: Record<string, string> = {
    IDRX: 'MockIDRX',
    USDC: 'MockUSDC',
    USDT: 'MockUSDT',
    DAI: 'MockDAI',
    EURC: 'MockEURC',
};

const normalizeAddress = (address?: string) => (address || '').toLowerCase();

const resolveNetworkKey = (chainId?: number) => {
    if (chainId) {
        const match = Object.keys(NETWORK_CONFIGS).find(
            (key) => NETWORK_CONFIGS[key].chainId === chainId
        );
        if (match) return match;
    }

    const envNetwork = import.meta.env.VITE_GIGPAY_NETWORK?.trim();
    if (envNetwork && NETWORK_CONFIGS[envNetwork]) {
        return envNetwork;
    }

    const envChainId = Number(import.meta.env.VITE_GIGPAY_CHAIN_ID);
    if (!Number.isNaN(envChainId)) {
        const match = Object.keys(NETWORK_CONFIGS).find(
            (key) => NETWORK_CONFIGS[key].chainId === envChainId
        );
        if (match) return match;
    }

    return DEFAULT_NETWORK_KEY;
};

export const getNetworkConfig = (chainId?: number): NetworkConfig => {
    const key = resolveNetworkKey(chainId);
    return NETWORK_CONFIGS[key];
};

const ABI_MAP: Record<string, unknown> = {
    GigPayRegistry: GigPayRegistryAbi,
    GigPayEscrowCoreV2: GigPayEscrowCoreV2Abi,
    CompanyTreasuryVault: CompanyTreasuryVaultAbi,
    TokenRegistry: TokenRegistryAbi,
    SwapRouteRegistry: SwapRouteRegistryAbi,
    CompositeSwapManager: CompositeSwapManagerAbi,
    YieldManagerV2: YieldManagerV2ABI,
    ThetanutsVaultStrategyV2: ThetanutsVaultStrategyV2ABI,
    GigPayFaucet: GigPayFaucetAbi,
    MockIDRX: MockIDRXAbi,
    MockUSDC: MockUSDCAbi,
    MockUSDT: MockUSDTAbi,
    MockDAI: MockDAIAbi,
    MockEURC: MockEURCAbi,
};

export const getContractAddress = (name: string, chainId?: number) => {
    const resolvedChainId = chainId || getNetworkConfig().chainId;
    // @ts-ignore
    return CONTRACTS_BY_CHAIN[resolvedChainId]?.[name];
};

export const getContractAbi = (name: string) => {
    return ABI_MAP[name];
};

export const getTokenAddress = (symbol: string, chainId?: number) => {
    const contractName = TOKEN_CONTRACTS[symbol];
    if (!contractName) return undefined;
    return getContractAddress(contractName, chainId);
};

export const getTokenSymbolByAddress = (address?: string, chainId?: number) => {
    const normalized = normalizeAddress(address);
    if (!normalized) return 'UNKNOWN';

    const resolvedChainId = chainId || getNetworkConfig().chainId;
    const entries = Object.entries(TOKEN_CONTRACTS);
    for (const [symbol, contractName] of entries) {
        // @ts-ignore
        const contractAddress = CONTRACTS_BY_CHAIN[resolvedChainId]?.[contractName];
        if (contractAddress && normalizeAddress(contractAddress) === normalized) {
            return symbol;
        }
    }
    return 'UNKNOWN';
};

export const getExplorerBaseUrl = (chainId?: number) => {
    return getNetworkConfig(chainId).explorerBaseUrl;
};
