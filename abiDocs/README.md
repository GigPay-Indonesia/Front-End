# YieldMode ABI Docs (Frontend Integration)

This folder documents how to build a **Yield Aggregator dApp** using the ABIs exported in [`YieldModeABI/`](../YieldModeABI/).

## What you get

- **Ready-to-use ABIs** for:
  - Vault proxy (ERC4626, upgradeable): `BaseVaultUpgradeable.abi.json`
  - Oracle: `StrategySelfReportedYieldOracle.abi.json`
  - 10 demo strategies (faucet-yield): `MockStrategy*.abi.json`
  - External contracts: `IDRX.abi.json`, `GigPayFaucet.abi.json`
- **Manifest** of addresses + ABI filenames: [`YieldModeABI/manifest.json`](../YieldModeABI/manifest.json)

## Network (Base Sepolia)

- **Chain**: Base Sepolia (84532)
- **RPC**: `https://sepolia.base.org/`
- **Explorer**: `https://base-sepolia.blockscout.com/`

## Start here

1. Read [`./contracts/Vault.md`](./contracts/Vault.md)
2. Read [`./contracts/Strategies.md`](./contracts/Strategies.md)
3. Read [`./contracts/Oracle.md`](./contracts/Oracle.md)
4. Read [`./contracts/TokenAndFaucet.md`](./contracts/TokenAndFaucet.md)
5. Follow end-to-end UI flow in [`./frontendFlows.md`](./frontendFlows.md)
6. Copy/paste examples:
   - [`./examples/viem.ts`](./examples/viem.ts)
   - [`./examples/ethers.ts`](./examples/ethers.ts)

