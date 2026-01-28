# Oracle (StrategySelfReportedYieldOracle ABI)

ABI file: `YieldModeABI/StrategySelfReportedYieldOracle.abi.json`  
Address: `0x826bFa587332002f35fd0240285dEd6C134E95dB`

This oracle is a **demo/orchestration oracle**:
- It does **not** compute APY from external markets.
- It reads each strategy’s `estimatedApy()` + `riskScore()` and returns them as `IYieldOracle` quotes.
- The vault uses these quotes during `calculateOptimalAllocation()` / `executeRebalance()`.

## Reads (UI)

- `description() -> string`
- `version() -> uint256`
- `owner() -> address`
- `maxQuoteAge(address asset) -> uint256`
- `getCandidates(address asset) -> (address[] strategies, YieldQuote[] quotes)`
- `latestYield(address asset, address strategy) -> YieldQuote`

`YieldQuote` fields:
- `apyWad` (1e18 = 100% APR)
- `riskScore` (1..10)
- `confidenceBps` (0..10000)
- `updatedAt`
- `roundId`, `answeredInRound`

## Writes (admin)

- `setCandidates(address asset, address[] strategies)`
- `setMaxQuoteAge(address asset, uint256 age)`
- `transferOwnership(address newOwner)`

## Frontend use

For a user UI you usually don’t need the oracle directly, because the vault already exposes:
- `calculateOptimalAllocation()`

But it’s useful for:
- Showing “why” an allocation happened (APY/risk per strategy)
- Debugging candidate sets

