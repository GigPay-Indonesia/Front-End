# Strategies (MockStrategy* ABI)

ABI files: `YieldModeABI/MockStrategy*.abi.json`  
All 10 strategies share the same callable surface (inherited from the mock base).

## Key idea (demo yield)

Each strategy holds the vault’s underlying token (IDRX). On `harvest()` it:
1. Checks the public faucet cooldown via `faucet.canClaim(strategy, IDRX)`
2. Calls `faucet.claim(IDRX)` (mints/transfers IDRX to the strategy)
3. Transfers the claimed IDRX to the vault
4. Calls `vault.report(gain, 0, debtPayment)` so the vault’s accounting updates

So your dApp can show yield growth without integrating a real DeFi protocol.

## Reads (UI)

- `strategyName() -> string`
- `want() -> address` (must equal vault `asset()`)
- `vault() -> address`
- `faucet() -> address`
- `management() -> address`
- `estimatedTotalAssets() -> uint256` (strategy-held IDRX)
- `maxLiquidatable() -> uint256`
- `estimatedApy() -> uint256` (WAD, 1e18 = 100% APR)
- `riskScore() -> uint256` (1..10)

## Writes (ops UI)

- `harvest() -> (profit, loss, debtPayment)`
  - **Permissionless** (anyone can call)
  - In normal mode it tries to claim faucet yield and report it.

Vault-only (your UI should not call these unless you’re acting as vault):
- `withdraw(uint256 amount) -> uint256 loss`
- `setEmergencyExit(bool enabled)`
- `migrate(address newStrategy)`

Management-only (useful for demo tuning):
- `setApyConfig(uint256 baseApyWad, uint256 jitterApyWad)`

## Frontend display recommendations

- **Strategy cards**: show `strategyName`, `estimatedApy`, `riskScore`, `estimatedTotalAssets`
- **Health**: show `maxLiquidatable` and whether vault withdrawal queue includes the strategy
- **Yield action**: add a “Harvest” button (anyone can click)

## Common pitfalls

- **Harvest may produce 0 profit**: faucet can be out of funds or still in cooldown; this is expected.
- **Rebalance is required to deploy treasury funds**: strategies only receive capital when vault `executeRebalance()` allocates to them.

