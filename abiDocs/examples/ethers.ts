/**
 * Minimal ethers v6 integration example (Base Sepolia).
 *
 * Uses ABIs exported in ../YieldModeABI/
 * This file is documentation-only; adapt into your frontend app.
 */

import { BrowserProvider, Contract, parseUnits } from "ethers";
import manifest from "../../YieldModeABI/manifest.json";
import vaultAbi from "../../YieldModeABI/BaseVaultUpgradeable.abi.json";
import idrxAbi from "../../YieldModeABI/IDRX.abi.json";
import strategyAbi from "../../YieldModeABI/MockStrategyAaveV3_IDRX_WETH.abi.json";

const vaultAddress = manifest.contracts.VaultProxy.address;
const idrxAddress = manifest.contracts.IDRX.address;

export async function connectAndRead(windowEthereum: any) {
  const provider = new BrowserProvider(windowEthereum);
  const signer = await provider.getSigner();

  const vault = new Contract(vaultAddress, vaultAbi, provider);
  const idrx = new Contract(idrxAddress, idrxAbi, provider);

  const [asset, totalAssets, totalSupply, decimals] = await Promise.all([
    vault.asset(),
    vault.totalAssets(),
    vault.totalSupply(),
    idrx.decimals(),
  ]);

  return { asset, totalAssets, totalSupply, decimals, user: await signer.getAddress() };
}

export async function deposit(windowEthereum: any, amountHuman: string) {
  const provider = new BrowserProvider(windowEthereum);
  const signer = await provider.getSigner();

  const vault = new Contract(vaultAddress, vaultAbi, signer);
  const idrx = new Contract(idrxAddress, idrxAbi, signer);

  const decimals: number = await idrx.decimals();
  const amount = parseUnits(amountHuman, decimals);

  await (await idrx.approve(vaultAddress, amount)).wait();
  await (await vault.deposit(amount, await signer.getAddress())).wait();
}

export async function harvestAll(windowEthereum: any) {
  const provider = new BrowserProvider(windowEthereum);
  const signer = await provider.getSigner();

  for (const s of manifest.contracts.Strategies) {
    const strat = new Contract(s.address, strategyAbi, signer);
    await (await strat.harvest()).wait();
  }
}

