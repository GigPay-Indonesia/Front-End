# Frontend flows (Yield Aggregator dApp)

This is a complete, practical flow for a Yield Aggregator UI using the `YieldModeABI/` ABIs.

## 1) App bootstrap

- Load `YieldModeABI/manifest.json`
- Pick `contracts.VaultProxy.address` as **the vault address**
- Load ABIs from `YieldModeABI/*.abi.json`

Recommended runtime config object:
- `vaultAddress`
- `oracleAddress`
- `assetAddress` (IDRX)
- `faucetAddress`
- `strategies[]` (address + display name)

## 2) Read-only dashboard

### Vault header

Read:
- `vault.asset()` → IDRX address (sanity check)
- `vault.totalAssets()` and `vault.totalSupply()`
- `vault.depositLimit()` (optional)
- `vault.emergencyShutdown()` (banner)

Compute:
- price per share (simple): \(pps = totalAssets / totalSupply\) when supply > 0

### User position

Read:
- `vault.balanceOf(user)` → shares
- `vault.previewRedeem(shares)` → assets estimate
- `IDRX.balanceOf(user)` → available funds
- `IDRX.allowance(user, vault)` → “Approve” state

### Strategies table

For each strategy address:
- `strategy.strategyName()`
- `strategy.estimatedApy()`
- `strategy.riskScore()`
- `strategy.estimatedTotalAssets()`
- `strategy.maxLiquidatable()`

Optional:
- `vault.creditAvailable(strategy)` / `vault.debtOutstanding(strategy)` (ops / advanced UI)

## 3) User deposit flow

1. `IDRX.approve(vault, amount)` (if allowance < amount)
2. `vault.deposit(amount, user)`
3. Refresh `vault.totalAssets`, `vault.balanceOf(user)`

Events you can listen to:
- `Deposit(sender, owner, assets, shares)`

## 4) Rebalance flow (ops / admin)

1. Call `vault.shouldRebalance()` → show whether it’s worth executing
2. Call `vault.calculateOptimalAllocation()` → show targets + BPS allocations
3. Call `vault.executeRebalance()` (only governance/management can)

Rebalance will revert if:
- too soon (`RM_RebalanceTooSoon`)
- oracle has no valid candidates
- strategy quotes are stale/low confidence

Events:
- `RebalanceInitiated(targets, allocBps, improvementBps)`
- `RebalanceExecuted(executor)`

## 5) Harvest flow (public “simulate yield”)

Each strategy has a permissionless `harvest()` method.

UI pattern:
- Show “Harvest” button for each strategy
- Show “Harvest all” (batch on the client using multiple txs)

After harvesting, refresh:
- `vault.totalAssets()`
- `IDRX.balanceOf(vault)` (vault idle)
- per-strategy `estimatedTotalAssets()`

Why vault grows:
- strategy claims IDRX from faucet → transfers to vault → calls `vault.report(...)`

Events:
- Faucet: `Claimed(user=strategy, token=IDRX, amount)`
- Vault: `Reported(strategy, gain, loss, debtPayment, newDebt)` (and potentially `FeesMinted`)

## 6) Withdraw flow

1. `vault.previewWithdraw(assets)` → shares estimate
2. `vault.withdraw(assets, user, user)`

If vault idle is low, it liquidates via the queue; may revert if loss exceeds max allowed.

Events:
- `Withdraw(caller, receiver, owner, assets, shares)`

## 7) “Full dApp” recommendations

### Minimal indexer (optional but recommended)

Index these events:
- Vault: `Deposit`, `Withdraw`, `Reported`, `RebalanceExecuted`, `WithdrawalQueueUpdated`
- IDRX: `Transfer` (optional analytics)
- Faucet: `Claimed`

From these you can build:
- APY timeline (derived from reported gains / time)
- Strategy leaderboard (harvest frequency, gains)
- TVL history (vault.totalAssets sampled per block or per event)

### UI pages

- **Dashboard**: TVL, PPS, user shares, “Deposit / Withdraw”
- **Strategies**: cards/table, “Harvest”, “Harvest all”, show faucet cooldown status (optional)
- **Rebalance (admin)**: show suggested allocations + one-click execute

