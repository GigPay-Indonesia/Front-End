# Frontend ABI Calls: ERC4626 Vault + YieldManagerV2 Adapter

This document covers the frontend calls for the ERC4626 vault proxy and the
YieldManagerV2 + adapter flow. It is written for Base Sepolia (chainId 84532).

## Contracts (Base Sepolia)

- Vault proxy (ERC4626): `0xCFB357fae5e5034cCfA0649b711a2897e685D14a`
- Yield Aggregator Adapter (IYieldStrategyV2): `0x3AD2D40a516eCa9C34DcE24BefD4B8dF50641855`
- Yield Manager V2: `0x22c94123e60fA65D742a5872a45733154834E4b0`
- IDRX (asset): `0x20Abd5644f1f77155c63A8818C75540F770ae223`

Blockscout links:
- Vault proxy: https://base-sepolia.blockscout.com/address/0xCFB357fae5e5034cCfA0649b711a2897e685D14a
- Adapter: https://base-sepolia.blockscout.com/address/0x3AD2D40a516eCa9C34DcE24BefD4B8dF50641855
- YieldManagerV2: https://base-sepolia.blockscout.com/address/0x22c94123e60fA65D742a5872a45733154834E4b0
- IDRX: https://base-sepolia.blockscout.com/address/0x20Abd5644f1f77155c63A8818C75540F770ae223

## ABIs you need

[
  {"inputs":[],"name":"asset","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalAssets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"},{"internalType":"address","name":"receiver","type":"address"}],"name":"deposit","outputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"address","name":"owner","type":"address"}],"name":"withdraw","outputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"address","name":"owner","type":"address"}],"name":"redeem","outputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"name":"previewDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"name":"previewWithdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"name":"previewRedeem","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"name":"previewMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]

Minimal interfaces for frontend:

### ERC4626 Vault (proxy)
- `asset() -> address`
- `totalAssets() -> uint256`
- `balanceOf(address) -> uint256` (ERC20 shares)
- `decimals() -> uint8` (shares decimals, typically 18)
- `deposit(uint256 assets, address receiver) -> uint256 shares`
- `withdraw(uint256 assets, address receiver, address owner) -> uint256 shares`
- `redeem(uint256 shares, address receiver, address owner) -> uint256 assets`
- `previewDeposit(uint256 assets) -> uint256 shares`
- `previewWithdraw(uint256 assets) -> uint256 shares`
- `previewRedeem(uint256 shares) -> uint256 assets`
- `previewMint(uint256 shares) -> uint256 assets`

### ERC20 (IDRX asset)
- `decimals() -> uint8`
- `balanceOf(address) -> uint256`
- `allowance(address owner, address spender) -> uint256`
- `approve(address spender, uint256 amount) -> bool`

### YieldManagerV2 (operator/owner only)
- `depositFromTreasury(uint32 strategyId, address asset, uint256 amount, address treasury) -> uint256 shares`
- `withdrawTo(uint256 intentId, uint32 strategyId, address asset, uint256 shares, address to) -> uint256 assetsOut`
- `setStrategy(uint32 id, address strategy, bool allowed)` (owner only)

### Adapter (IYieldStrategyV2)
- `deposit(address asset, uint256 assets) -> uint256 shares`
- `redeem(address asset, uint256 shares) -> uint256 assetsOut`
- `totalValue(address asset) -> uint256 assetsValue`

Note: the adapter is used by `YieldManagerV2`. A normal user UI should not call
the adapter directly.

## ERC4626 frontend buttons (vault proxy)

Use the vault proxy as the user-facing ERC4626 entrypoint. The adapter and
YieldManagerV2 are for treasury / ops.

### 1) Approve IDRX (required for deposit/mint)
- Contract: IDRX
- Method: `approve(spender, amount)`
- Spender: vault proxy address
- Amount: user-selected amount (or max)

### 2) Deposit (assets -> shares)
- Contract: vault proxy
- Method: `deposit(assets, receiver)`
- Inputs:
  - `assets`: amount of IDRX
  - `receiver`: user wallet address
- UI: show `previewDeposit(assets)` for estimated shares

### 3) Mint (shares -> assets)
- Contract: vault proxy
- Method: `mint(shares, receiver)`
- Inputs:
  - `shares`: desired share amount
  - `receiver`: user wallet address
- UI: show `previewMint(shares)` for required assets

### 4) Withdraw (assets out)
- Contract: vault proxy
- Method: `withdraw(assets, receiver, owner)`
- Inputs:
  - `assets`: desired IDRX amount
  - `receiver`: user wallet address
  - `owner`: user wallet address
- UI: show `previewWithdraw(assets)` for share burn estimate

### 5) Redeem (shares out)
- Contract: vault proxy
- Method: `redeem(shares, receiver, owner)`
- Inputs:
  - `shares`: shares to burn
  - `receiver`: user wallet address
  - `owner`: user wallet address
- UI: show `previewRedeem(shares)` for asset estimate

### 6) Read-only widgets
- `totalAssets()` to show TVL
- `balanceOf(user)` to show share balance
- `asset()` to display underlying
- `decimals()` for UI formatting

## Treasury/YieldManagerV2 flow (operator only)

These calls are typically **not exposed to end users**. They are for treasury
ops or a backend/admin panel.

### Deposit treasury to yield
- Contract: YieldManagerV2
- Method: `depositFromTreasury(strategyId, asset, amount, treasury)`
- Notes:
  - `strategyId` must be registered to the adapter.
  - Treasury must approve YieldManagerV2 for IDRX first.

### Withdraw from yield
- Contract: YieldManagerV2
- Method: `withdrawTo(intentId, strategyId, asset, shares, to)`
- Notes:
  - `intentId` is 0 for treasury flows.
  - `to` is treasury vault address or escrow address.

## Recommended frontend validation

- Check `allowance` and prompt approval before deposit/mint.
- Validate `assets > 0` / `shares > 0`.
- Use `preview*` to estimate outputs before sending a tx.
- Catch revert errors and show user-friendly messages (insufficient liquidity,
  max deposit exceeded, etc.).

## When to use the adapter ABI

Only use adapter ABI if you are building an **admin/ops panel** that directly
tests strategy behavior. Regular users should interact with the ERC4626 vault
proxy only.
