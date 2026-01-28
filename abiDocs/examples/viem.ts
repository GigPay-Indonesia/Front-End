/**
 * Minimal viem integration example (Base Sepolia).
 *
 * Uses ABIs exported in ../YieldModeABI/
 * - manifest.json provides addresses + abi filenames
 *
 * This file is documentation-only; adapt into your frontend app.
 */

import { createPublicClient, createWalletClient, custom, http, parseUnits, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";

import manifest from "../../YieldModeABI/manifest.json";
import vaultAbi from "../../YieldModeABI/BaseVaultUpgradeable.abi.json";
import idrxAbi from "../../YieldModeABI/IDRX.abi.json";
import strategyAbi from "../../YieldModeABI/MockStrategyAaveV3_IDRX_WETH.abi.json"; // all mock strategies share this surface

const vaultAddress = manifest.contracts.VaultProxy.address as `0x${string}`;
const idrxAddress = manifest.contracts.IDRX.address as `0x${string}`;

export async function readDashboard() {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org/"),
  });

  const [asset, totalAssets, totalSupply] = await Promise.all([
    publicClient.readContract({ address: vaultAddress, abi: vaultAbi as any, functionName: "asset" }),
    publicClient.readContract({ address: vaultAddress, abi: vaultAbi as any, functionName: "totalAssets" }),
    publicClient.readContract({ address: vaultAddress, abi: vaultAbi as any, functionName: "totalSupply" }),
  ]);

  return { asset, totalAssets, totalSupply };
}

export async function deposit(windowEthereum: any, amountHuman: string) {
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(windowEthereum),
  });
  const [account] = await walletClient.getAddresses();
  const publicClient = createPublicClient({ chain: baseSepolia, transport: custom(windowEthereum) });

  // read decimals
  const decimals = await publicClient.readContract({
    address: idrxAddress,
    abi: idrxAbi as any,
    functionName: "decimals",
  });

  const amount = parseUnits(amountHuman, Number(decimals));

  // approve
  const approveHash = await walletClient.writeContract({
    account,
    address: idrxAddress,
    abi: idrxAbi as any,
    functionName: "approve",
    args: [vaultAddress, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  // deposit
  const depositHash = await walletClient.writeContract({
    account,
    address: vaultAddress,
    abi: vaultAbi as any,
    functionName: "deposit",
    args: [amount, account],
  });
  await publicClient.waitForTransactionReceipt({ hash: depositHash });
}

export async function harvestAll(windowEthereum: any) {
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(windowEthereum),
  });
  const [account] = await walletClient.getAddresses();
  const publicClient = createPublicClient({ chain: baseSepolia, transport: custom(windowEthereum) });

  for (const s of manifest.contracts.Strategies) {
    const hash = await walletClient.writeContract({
      account,
      address: s.address as `0x${string}`,
      abi: strategyAbi as any,
      functionName: "harvest",
      args: [],
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }
}

export async function readStrategies() {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org/"),
  });

  const rows = await Promise.all(
    manifest.contracts.Strategies.map(async (s) => {
      const addr = s.address as `0x${string}`;
      const [name, apyWad, risk, assets] = await Promise.all([
        publicClient.readContract({ address: addr, abi: strategyAbi as any, functionName: "strategyName" }),
        publicClient.readContract({ address: addr, abi: strategyAbi as any, functionName: "estimatedApy" }),
        publicClient.readContract({ address: addr, abi: strategyAbi as any, functionName: "riskScore" }),
        publicClient.readContract({ address: addr, abi: strategyAbi as any, functionName: "estimatedTotalAssets" }),
      ]);
      return { addr, name, apyWad, risk, assets };
    })
  );

  return rows;
}

