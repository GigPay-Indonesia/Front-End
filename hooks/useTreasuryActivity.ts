import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem, formatUnits } from 'viem';
import { getContractAddress, getTokenAddress } from '../lib/abis';
import { CompanyTreasuryVaultABI } from '../lib/abis';

export interface ActivityItem {
    date: string;
    action: string;
    amount: string;
    hash: string;
    blockNumber: bigint;
}

export const useTreasuryActivity = () => {
    const publicClient = usePublicClient();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const treasuryAddress = getContractAddress('CompanyTreasuryVault');

    useEffect(() => {
        const fetchLogs = async () => {
            if (!publicClient || !treasuryAddress) return;

            try {
                const currentBlock = await publicClient.getBlockNumber();
                const fromBlock = currentBlock - 2000000n; // Look back ~2M blocks (approx 2 months on Base)

                // Define events to fetch
                const escrowFundedEvent = parseAbiItem('event EscrowFunded(address indexed escrow, uint256 indexed intentId, address indexed asset, uint256 amount)');
                const yieldDepositedEvent = parseAbiItem('event TreasuryYieldDeposited(address indexed asset, uint32 strategyId, uint256 amount, uint256 shares)');
                const yieldWithdrawnEvent = parseAbiItem('event TreasuryYieldWithdrawn(address indexed asset, uint32 strategyId, uint256 shares, uint256 assetsOut)');
                const refundReceivedEvent = parseAbiItem('event RefundReceived(address indexed escrow, uint256 indexed intentId, address indexed asset, uint256 amount)');

                const treasuryAddressVal = treasuryAddress as `0x${string}`;

                // Topics for Transfer(from, to, value)
                // We want: all transfers TO treasuryAddress
                // Topic0: Transfer event hash
                // Topic1: from (any)
                // Topic2: to (treasuryAddress)
                const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

                // Tokens to check
                const tokens = ['IDRX', 'USDC', 'USDT', 'DAI', 'EURC'];

                // Create promises for fetching transfer logs for each token
                // This is a bit heavy but ensures we catch all "Add Funds"
                const transferLogPromises = tokens.map(symbol => {
                    const tokenAddress = getTokenAddress(symbol as any);
                    if (!tokenAddress) return Promise.resolve([]);
                    return publicClient.getLogs({
                        address: tokenAddress as `0x${string}`,
                        event: transferEvent,
                        args: { to: treasuryAddressVal },
                        fromBlock
                    }).then(logs => logs.map(l => ({ ...l, tokenSymbol: symbol })));
                });

                const [fundedLogs, depositLogs, withdrawLogs, refundLogs, ...transferLogsGroups] = await Promise.all([
                    publicClient.getLogs({
                        address: treasuryAddressVal,
                        event: escrowFundedEvent,
                        fromBlock
                    }),
                    publicClient.getLogs({
                        address: treasuryAddressVal,
                        event: yieldDepositedEvent,
                        fromBlock
                    }),
                    publicClient.getLogs({
                        address: treasuryAddressVal,
                        event: yieldWithdrawnEvent,
                        fromBlock
                    }),
                    publicClient.getLogs({
                        address: treasuryAddressVal,
                        event: refundReceivedEvent,
                        fromBlock
                    }),
                    ...transferLogPromises
                ]);

                // Flatten transfer logs
                const transferLogs = transferLogsGroups.flat();

                const formattedLogs: ActivityItem[] = [];

                // Helper to format logs
                const formatLog = async (log: any, action: string, amount: bigint) => {
                    // We skip block fetching for speed for now, just use current date or mock date if needed
                    // For better UX, we'd batch fetch block timestamps
                    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                    const date = new Date(Number(block.timestamp) * 1000).toLocaleDateString('en-CA'); // YYYY-MM-DD

                    return {
                        date,
                        action,
                        amount: amount ? `${amount > 0n ? '+' : ''}${formatUnits(amount, 6)}` : '0', // Assuming USDC 6 decimals mostly
                        hash: `${log.transactionHash.substring(0, 4)}...${log.transactionHash.substring(log.transactionHash.length - 4)}`,
                        blockNumber: log.blockNumber
                    };
                };

                // Process logs (limit to last 5 of each for performance if needed, but here we process all found in range)
                // Note: Promise.all might be heavy if heavily used, sequential or batched is safer for many logs.
                // For "Recent Activity", we just take the latest ones.

                // We'll just define a helper to map and push
                for (const log of fundedLogs) {
                    formattedLogs.push(await formatLog(log, 'Escrow Funded', -(log.args.amount || 0n)));
                }
                for (const log of depositLogs) {
                    formattedLogs.push(await formatLog(log, 'Yield Deposit', -(log.args.amount || 0n)));
                }
                for (const log of withdrawLogs) {
                    // withdraw means assets come back to treasury
                    formattedLogs.push(await formatLog(log, 'Yield Harvest/Withdraw', (log.args.assetsOut || 0n)));
                }
                for (const log of refundLogs) {
                    formattedLogs.push(await formatLog(log, 'Refund Received', (log.args.amount || 0n)));
                }
                for (const log of transferLogs) {
                    // Check if filter wasn't perfect or just double check
                    if (log.args.to === treasuryAddressVal) {
                        const amount = log.args.value || 0n;
                        // Use token symbol in action
                        formattedLogs.push(await formatLog(log, `Add Funds (${(log as any).tokenSymbol})`, amount));
                    }
                }

                // Sort by block number descending
                formattedLogs.sort((a, b) => Number(b.blockNumber - a.blockNumber));

                setActivities(formattedLogs.slice(0, 10)); // Keep top 10
            } catch (error) {
                console.error("Error fetching treasury logs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Poll every 5 seconds for real-time updates

        return () => clearInterval(interval);
    }, [publicClient, treasuryAddress]);

    return { activities, isLoading };
};
