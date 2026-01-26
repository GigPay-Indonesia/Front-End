import { useGigPayContract } from './useGigPayContract';

export const useEscrowCoreContract = () => useGigPayContract('GigPayEscrowCoreV2');
export const useTreasuryVaultContract = () => useGigPayContract('CompanyTreasuryVault');
export const useTokenRegistryContract = () => useGigPayContract('TokenRegistry');
export const useThetanutsStrategyContract = () => useGigPayContract('ThetanutsVaultStrategyV2');
