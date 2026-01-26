import { useReadContract, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { useTreasuryVaultContract, useThetanutsStrategyContract } from '../lib/hooks/useGigPayContracts';
import { getTokenAddress } from '../lib/abis';

export const useTreasuryData = () => {
    const treasuryVault = useTreasuryVaultContract();
    const strategy = useThetanutsStrategyContract();

    const usdcAddress = getTokenAddress('USDC');
    const idrxAddress = getTokenAddress('IDRX');
    const usdtAddress = getTokenAddress('USDT');
    const daiAddress = getTokenAddress('DAI');
    const eurcAddress = getTokenAddress('EURC');

    // Fetch Balances for all assets (Only when vault address is ready)
    const vaultAddress = treasuryVault?.address;
    const isVaultReady = !!vaultAddress;

    const { data: usdcBalance } = useBalance({
        address: vaultAddress,
        token: usdcAddress as `0x${string}`,
        query: { refetchInterval: 3000, enabled: isVaultReady }
    });
    const { data: idrxBalance } = useBalance({
        address: vaultAddress,
        token: idrxAddress as `0x${string}`,
        query: { refetchInterval: 3000, enabled: isVaultReady }
    });
    const { data: usdtBalance } = useBalance({
        address: vaultAddress,
        token: usdtAddress as `0x${string}`,
        query: { refetchInterval: 3000, enabled: isVaultReady }
    });
    const { data: daiBalance } = useBalance({
        address: vaultAddress,
        token: daiAddress as `0x${string}`,
        query: { refetchInterval: 3000, enabled: isVaultReady }
    });
    const { data: eurcBalance } = useBalance({
        address: vaultAddress,
        token: eurcAddress as `0x${string}`,
        query: { refetchInterval: 3000, enabled: isVaultReady }
    });

    // 2. Yield Position (Shares in Vault -> Assets)
    // First get shares amount from Treasury Vault
    const { data: yieldShares } = useReadContract({
        ...treasuryVault,
        abi: treasuryVault?.abi as any,
        functionName: 'yieldShares',
        args: usdcAddress ? [usdcAddress] : undefined,
        query: {
            enabled: !!treasuryVault && !!usdcAddress,
        }
    });

    // Then convert shares to assets using Strategy
    const { data: yieldBalance } = useReadContract({
        ...strategy,
        abi: strategy?.abi as any,
        functionName: 'convertToAssets',
        args: yieldShares ? [yieldShares] : undefined,
        query: {
            enabled: !!strategy && !!yieldShares,
        }
    });



    const usdcVal = usdcBalance?.value || 0n;
    const idrxVal = idrxBalance?.value || 0n;
    const yieldVal = (yieldBalance as bigint) || 0n;

    // Helper to process balance with dynamic decimals
    const processBalance = (balance: any, rateToUsd: number = 1) => {
        const val = balance?.value || 0n;
        const decimals = balance?.decimals || 18;
        const floatVal = parseFloat(formatUnits(val, decimals));
        const usdVal = floatVal * rateToUsd;
        return { val, decimals, floatVal, usdVal };
    };

    const IDR_RATE = 16300;
    const EUR_RATE = 1.08; // Mock

    const usdcData = processBalance(usdcBalance, 1);
    const idrxData = processBalance(idrxBalance, 1 / IDR_RATE);
    const usdtData = processBalance(usdtBalance, 1);
    const daiData = processBalance(daiBalance, 1);
    const eurcData = processBalance(eurcBalance, EUR_RATE);

    // Yield is in Asset (USDC) terms, so use USDC decimals
    const yieldDecimals = usdcBalance?.decimals || 18;
    const yieldFloat = parseFloat(formatUnits(yieldVal, yieldDecimals));

    const totalLiquidUsd = usdcData.usdVal + idrxData.usdVal + usdtData.usdVal + daiData.usdVal + eurcData.usdVal;
    const totalAssetsUsd = totalLiquidUsd + yieldFloat;

    // Format for display
    const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

    // Dynamic Asset List
    const assets = [
        { symbol: 'IDRX', name: 'Rupiah Stable', balance: idrxData.floatVal, usdValue: idrxData.usdVal, logo: '/idrx-logo.png' },
        { symbol: 'USDC', name: 'USD Coin', balance: usdcData.floatVal, usdValue: usdcData.usdVal, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdc.png' },
        { symbol: 'USDT', name: 'Tether USD', balance: usdtData.floatVal, usdValue: usdtData.usdVal, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png' },
        { symbol: 'DAI', name: 'Dai Stablecoin', balance: daiData.floatVal, usdValue: daiData.usdVal, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dai.png' },
        { symbol: 'EURC', name: 'Euro Coin', balance: eurcData.floatVal, usdValue: eurcData.usdVal, logo: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eur.png' },
    ].filter(a => a.balance > 0).sort((a, b) => b.usdValue - a.usdValue); // Only show assets with balance > 0

    // Allocation Data for Pie Chart
    const allocationData = [
        { name: 'USDC (Liquid)', value: usdcData.floatVal, color: '#3b82f6' }, // Blue
        { name: 'IDRX (Liquid)', value: idrxData.usdVal, color: '#ef4444' }, // Red
        { name: 'Yield Strategy', value: yieldFloat, color: '#a855f7' }, // Purple
    ];

    return {
        treasuryBalance: formatUSD(totalAssetsUsd), // Total USD Value
        liquidBalance: formatUSD(totalLiquidUsd),
        inYield: formatUSD(yieldFloat),
        inEscrow: '0.00',
        allocationData,
        assets,
        raw: {
            usdcVal,
            idrxVal,
            yieldVal,
            totalLiquidUsd,
            totalAssetsUsd
        },
        isLoading: !treasuryVault || !strategy,
        refetch: () => {
            // Optional: trigger refetch if needed, though wagmi handles this mostly
        }
    };
};
