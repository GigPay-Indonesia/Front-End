# Vault (BaseVaultUpgradeable ABI)

ABI file: `YieldModeABI/BaseVaultUpgradeable.abi.json`  
Address to use: **Vault Proxy** `0xCFB357fae5e5034cCfA0649b711a2897e685D14a`

This vault is an **ERC4626** vault with a **strategy registry + debt accounting**, and a management-controlled **rebalance** function.

## Core ERC4626 reads (UI)

- **Asset token**: `asset() -> address`
- **Totals**: `totalAssets()`, `totalSupply()`
- **User share balance**: `balanceOf(address)`
- **Previews**: `previewDeposit(assets)`, `previewWithdraw(assets)` (or `previewRedeem(shares)` if you use it)

## Core ERC4626 writes (UI)

- **Deposit**: `deposit(uint256 assets, address receiver) -> uint256 shares`
- **Mint**: `mint(uint256 shares, address receiver) -> uint256 assets` (optional UI path)
- **Withdraw**: `withdraw(uint256 assets, address receiver, address owner) -> uint256 shares`
- **Redeem**: `redeem(uint256 shares, address receiver, address owner) -> uint256 assets`

### Allowance requirements

Before calling `deposit`/`mint`, the user must approve IDRX to the vault:
- call `IDRX.approve(vaultProxy, amount)`

## Strategy registry (admin / ops UI)

These are not typically exposed to normal users, but are useful for an admin panel:

- `addStrategy(address strategy, uint256 debtRatioBps, uint256 minDebt, uint256 maxDebt, uint256 perfFeeBps)`
- `setWithdrawalQueue(address[] newQueue)`
- `withdrawalQueue() -> address[]`
- `creditAvailable(address strategy) -> uint256`
- `debtOutstanding(address strategy) -> uint256`

## Rebalancing (ops UI)

The rebalance uses oracle candidates and **moves funds**:

- `shouldRebalance() -> (bool ok, uint256 improvementBps)`
- `calculateOptimalAllocation() -> (address[] targets, uint256[] allocBps)`
- `executeRebalance() -> bool`

Notes:
- `executeRebalance()` is gated to `governance` or `management`.
- It is rate-limited (default `minRebalanceInterval` is 1 day). If called too soon it reverts (`RM_RebalanceTooSoon`).

## Reporting (strategy-only)

Strategies call:
- `report(address strategy, uint256 gain, uint256 loss, uint256 debtPayment)`

Your frontend usually doesn’t call this; it’s emitted as `Reported(...)` events and is key for analytics.

## Events (indexer / analytics)

At minimum, index:
- **ERC4626**: `Deposit`, `Withdraw`
- **Strategy**: `StrategyAdded`, `StrategyRevoked`, `WithdrawalQueueUpdated`
- **Rebalance**: `RebalanceInitiated`, `RebalanceExecuted`
- **Yield accounting**: `Reported`, `FeesMinted`
- **Emergency**: `EmergencyShutdownSet`

Blockscout contract page (proxy): `https://base-sepolia.blockscout.com/address/0xCFB357fae5e5034cCfA0649b711a2897e685D14a`

