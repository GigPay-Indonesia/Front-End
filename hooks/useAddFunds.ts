import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { getTokenAddress, MockUSDCABI } from '../lib/abis';
import { getContractAddress } from '../lib/abis';

export const useAddFunds = () => {
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('USDC');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const treasuryAddress = getContractAddress('CompanyTreasuryVault');
    const tokenAddress = getTokenAddress(selectedToken);

    // Fetch Balance
    const { address: userAddress } = useAccount();
    const { data: balanceData } = useBalance({
        address: userAddress,
        token: tokenAddress as `0x${string}`,
        query: {
            enabled: !!userAddress && !!tokenAddress,
        }
    });

    // Mock decimals map, ideally fetch from contract but for mocks it's fine
    const decimalsMap: Record<string, number> = {
        'IDRX': 6,
        'USDC': 6,
        'USDT': 6,
        'DAI': 18,
        'EURC': 6
    };

    const handleAddFunds = async () => {
        if (!amount || !treasuryAddress || !tokenAddress) return;

        try {
            const decimals = decimalsMap[selectedToken] || 18;
            writeContract({
                address: tokenAddress as `0x${string}`,
                abi: MockUSDCABI as any, // Generic ERC20 ABI
                functionName: 'transfer',
                args: [treasuryAddress as `0x${string}`, parseUnits(amount, decimals)],
            });
        } catch (error) {
            console.error("Add Funds Failed:", error);
        }
    };

    const handleMax = () => {
        if (balanceData) {
            setAmount(formatUnits(balanceData.value, balanceData.decimals));
        }
    };

    const reset = () => {
        setAmount('');
        setIsModalOpen(false);
        // Don't reset selectedToken, keep user preference
    };

    return {
        amount,
        setAmount,
        selectedToken,
        setSelectedToken,
        availableTokens: ['IDRX', 'USDC', 'USDT', 'DAI', 'EURC'],
        isModalOpen,
        setIsModalOpen,
        handleAddFunds,
        handleMax,
        formattedBalance: balanceData ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 })}` : '--',
        isLoading: isWritePending || isConfirming,
        isSuccess: isConfirmed,
        hash,
        error: writeError,
        reset
    };
};
