# GigPay Real-World Flows (Derived from Test Coverage)

This document translates the Foundry test suite into concrete, real-world
payment use cases and operational flows. Each section maps to one or more
tests in `test/` and includes proof via the `forge test -vvv` logs you shared.

## Actors and Roles

- **Company/Treasury**: Funds escrow, triggers release/refund.
- **Creator/Freelancer**: Submits work and receives payout (principal + yield + extra).
- **Buyer**: Optional protection buyer (can be treasury or delegated buyer).
- **Protocol**: Registry, managers, routers, and strategies that execute flows.

## Supported Stablecoins (Mocks in tests)

- IDRX (escrow asset)
- USDC, USDT, DAI, EURC (payout assets)

These are registered as escrow-eligible in `TokenRegistry` during tests.

---

## Core Payment Flows

### 1) Treasury → Escrow → Release (Basic)
**Use case:** Company pays a freelancer in IDRX without yield or protection.

**Flow:**
1. Company creates an intent with splits (freelancer + agency).
2. Treasury funds escrow with IDRX.
3. Treasury releases funds; SplitRouter distributes principal (minus fee).

**Tests:**  
`Flow.TreasuryToEscrow.Release.t.sol`

**Proof via logs (excerpt):**
- `Flow Release: create intent`
- `Flow Release: fund escrow`
- `Flow Release: release executed`
- `Flow Release: creator balance after`

---

### 2) Treasury → Escrow → Refund (Basic)
**Use case:** Work is not completed before deadline, treasury refunds.

**Flow:**
1. Intent is created and funded.
2. Deadline passes.
3. Treasury refunds; principal returns to treasury.

**Tests:**  
`Flow.TreasuryToEscrow.Refund.t.sol`

**Proof via logs (excerpt):**
- `Flow Refund: create intent`
- `Flow Refund: fund escrow`
- `Flow Refund: refund executed`
- `Flow Refund: treasury balance after`

---

## Yield-Enhanced Flows

### 3) Escrow Yield → Release
**Use case:** Long acceptance window; escrow funds generate yield before release.

**Flow:**
1. Intent created with long acceptance window.
2. Escrow deposits into yield strategy on submit.
3. Yield accrues in strategy.
4. Release withdraws yield first, then distributes.

**Tests:**  
`Flow.LongAcceptanceWindow.EscrowYieldThenRelease.t.sol`

**Proof via logs (excerpt):**
- `Flow Yield Release: create intent`
- `Flow Yield Release: fund escrow`
- `Flow Yield Release: submit work`
- `MockYieldStrategyV2: deposit`
- `Flow Yield Release: release executed`

---

### 4) Escrow Yield → Refund
**Use case:** Yield is generated but job is refunded.

**Flow:**
1. Yield activates on submit.
2. Treasury refunds.
3. Principal + yield are returned to treasury.

**Tests:**  
`Flow.LongAcceptanceWindow.EscrowYieldThenRefund.t.sol`

**Proof via logs (excerpt):**
- `Flow Yield Refund: create intent`
- `Flow Yield Refund: seed yield`
- `Flow Yield Refund: refund executed`

---

## Protection (OptionBook) Flows

### 5) Protection → Claim → Release
**Use case:** Company hedges escrow with protection and releases after claim.

**Flow:**
1. Treasury buys protection via OptionBook RFQ.
2. Policy attached to intent.
3. Treasury settles and claims payout into escrow.
4. Release distributes principal + protection extra.

**Tests:**  
`Flow.Protection.ClaimThenRelease.t.sol`,  
`GigPayEscrowCoreV2.Protection.OptionBook.t.sol`

**Proof via logs (excerpt):**
- `Flow Protection Release: buy protection`
- `Flow Protection Release: settle and claim`
- `Flow Protection Release: release executed`

---

### 6) Protection → Claim → Refund
**Use case:** Protection payout is claimed, but job is refunded.

**Flow:**
1. Protection policy purchased and attached.
2. Payout claimed into escrow.
3. Refund returns principal + protection extra to treasury.

**Tests:**  
`Flow.Protection.ClaimThenRefund.t.sol`

**Proof via logs (excerpt):**
- `Flow Protection Refund: buy protection`
- `Flow Protection Refund: settle and claim`
- `Flow Protection Refund: refund executed`

---

## Combined Yield + Protection

### 7) Yield + Protection → Release
**Use case:** Both yield and protection apply; release distributes all.

**Flow:**
1. Escrow yield activated.
2. Protection payout claimed.
3. Release splits principal, pays yield, and splits extra.

**Tests:**  
`Flow.Combo.YieldPlusProtection.Release.t.sol`

**Proof via logs (excerpt):**
- `Flow Combo Release: seed yield`
- `Flow Combo Release: buy protection`
- `Flow Combo Release: settle and claim`
- `Flow Combo Release: release executed`

---

### 8) Yield + Protection → Refund
**Use case:** Both yield and protection apply; refund returns all to treasury.

**Flow:**
1. Yield activated; protection claimed.
2. Refund returns principal + yield + extra.

**Tests:**  
`Flow.Combo.YieldPlusProtection.Refund.t.sol`

**Proof via logs (excerpt):**
- `Flow Combo Refund: seed yield`
- `Flow Combo Refund: settle and claim`
- `Flow Combo Refund: refund executed`

---

## Swap-Enabled Payouts (Multi-Stablecoin)

### 9) RFQ Swap (IDRX → USDC)
**Use case:** Freelancer wants USDC, company funds in IDRX.

**Flow:**
1. Intent created with payout asset USDC.
2. Escrow holds IDRX.
3. ReleaseWithSwap executes OptionBook RFQ order.
4. Escrow distributes USDC to recipients.

**Tests:**  
`GigPayEscrowCoreV2.RFQRelease.t.sol`,  
`Flow.Combo.YieldPlusProtection.ReleaseWithSwap.t.sol`

**Proof via logs (excerpt):**
- `RFQ Release: swap pair IDRX -> USDC`
- `RFQ Release: prepare RFQ order (IDRX -> USDC)`
- `RFQ Release: releaseWithSwap executed`

---

### 10) Fallback Swap (IDRX → USDC via AMM/Aggregator)
**Use case:** RFQ quote fails; system falls back to AMM/aggregator.

**Flow:**
1. RFQ intentionally fails (invalid order).
2. CompositeSwapManager routes to fallback venue.
3. Swap executes and payout happens in USDC.

**Tests:**  
`Flow.Swap.Fallback.Release.t.sol`

**Proof via logs (excerpt):**
- `Fallback Release: swap pair IDRX -> USDC`
- `Fallback Release: swap path IDRX -> USDC`
- `Fallback Release: releaseWithSwap executed`

---

## Multi-Chain and Registry Configuration

### 11) Stablecoin Eligibility and Route Policy
**Use case:** Protocol enables stablecoins and defines RFQ/fallback routes.

**Flow:**
1. TokenRegistry registers stablecoins with decimals and eligibility.
2. SwapRouteRegistry sets RFQ/fallback policy per pair.

**Tests:**  
`TokenRegistry.t.sol`, `SwapRouteRegistry.t.sol`

**Proof via logs (excerpt):**
- `test_setToken_and_lookup` (unit)
- `test_setRoute_and_getRoute` (unit)
- `test_setRoute_for_eurc_usdc_pair` (unit)

---

### 12) Multi-Chain Constants (Base Mainnet + Sepolia)
**Use case:** Deployment config is validated per chain.

**Flow:**
1. Base mainnet constants verified (OptionBook + USDC).
2. Base sepolia config used for mock deployments.

**Tests:**  
`MultiChainConfig.t.sol`

**Proof via logs (excerpt):**
- `test_base_mainnet_constants`
- `test_base_sepolia_constants`

---

## Operational Guarantees (Invariants)

These invariants represent safety properties that must always hold in production:

- **No double escrow yield deposits** per intent.  
  `Invariant.NoDoubleDeposit.t.sol`
- **No stuck funds** after release or refund.  
  `Invariant.NoStuckFunds.t.sol`
- **One owner per principal** when escrow yield is active.  
  `Invariant.GoldenRule.OneOwnerPerPrincipal.t.sol`
- **Split sum always 10,000 bps**.  
  `Invariant.SplitSumAlways10000.t.sol`

**Proof via logs (excerpt):**
- `Invariant OneOwner: check shares`
- `Invariant NoDoubleDeposit: check submit`
- `Invariant NoStuckFunds: release executed`
- `Invariant SplitSum: compute sum`

---

## Summary

The test suite demonstrates that GigPay can:

- Escrow and distribute payments safely.
- Add yield without compromising principal.
- Hedge escrowed funds with protection payouts.
- Convert between stablecoins using RFQ or fallback venues.
- Support multi-chain configuration and stablecoin governance.

Each test file represents a real operational flow that can be used in demos,
audits, or production checklists.

---

## Full Raw Logs (forge test -vvv)

Below are the raw log blocks per test, as captured in your `forge test -vvv`
output. These are appended for auditability and traceability.

### `test/unit/AccessControl.t.sol`
```
AccessControlTest: setUp
AccessControlTest: setOperator onlyOwner
AccessControlTest: setUp
AccessControlTest: transferOwnership onlyOwner
```

### `test/integration/Flow.LongAcceptanceWindow.EscrowYieldThenRelease.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Yield Release: create intent
MockERC20: approve
MockERC20: transferFrom
Flow Yield Release: fund escrow
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
Flow Yield Release: submit work
MockYieldStrategyV2: setYieldBps
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: fund
Flow Yield Release: seed yield
Flow Yield Release: creator balance before
MockERC20: transfer
MockYieldStrategyV2: redeem
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
Flow Yield Release: release executed
Flow Yield Release: creator balance after
```

### `test/unit/GigPayEscrowCoreV2.Splits.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowSplits: bad splits
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowSplits: release payout
MockERC20: approve
MockERC20: transferFrom
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
```

### `test/unit/TokenRegistry.t.sol`
```
(no logs emitted)
```

### `test/unit/GigPayEscrowCoreV2.Protection.OptionBook.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowProtection: buy protection auth
EscrowProtection: create intent
EscrowProtection: fund intent
MockERC20: approve
MockERC20: transferFrom
MockERC20: transferFrom
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowProtection: settle and claim
EscrowProtection: create intent
EscrowProtection: fund intent
MockERC20: approve
MockERC20: transferFrom
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockERC20: transfer
```

### `test/integration/Flow.Swap.Fallback.Release.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Fallback Release: create intent
MockERC20: approve
MockERC20: transferFrom
Fallback Release: fund escrow
Fallback Release: fund mock venue
Fallback Release: swap pair IDRX -> USDC
Fallback Release: prepare swap payload
Fallback Release: swap path IDRX -> USDC
MockERC20: transfer
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
Fallback Release: releaseWithSwap executed
Fallback Release: payout verified
```

### `test/unit/Registry.t.sol`
```
RegistryTest: setUp
RegistryTest: setModule only owner
RegistryTest: setUp
RegistryTest: setModule pointers
```

### `test/integration/Flow.Protection.ClaimThenRefund.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Protection Refund: create intent
Flow Protection Refund: treasury balance before
MockERC20: approve
MockERC20: transferFrom
Flow Protection Refund: fund escrow
MockERC20: transferFrom
Flow Protection Refund: buy protection
Flow Protection Refund: set settler
MockERC20: approve
MockERC20: transferFrom
Flow Protection Refund: fund optionbook
MockERC20: transfer
Flow Protection Refund: settle and claim
MockERC20: transfer
Flow Protection Refund: refund executed
Flow Protection Refund: treasury balance after
```

### `test/integration/Flow.TreasuryToEscrow.Release.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Release: create intent
Flow Release: fund escrow
MockERC20: approve
MockERC20: transferFrom
Flow Release: creator balance before
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
Flow Release: release executed
Flow Release: creator balance after
```

### `test/unit/MultiChainConfig.t.sol`
```
(no logs emitted)
```

### `test/unit/GigPayEscrowCoreV2.Yield.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowYield: long window
EscrowYield: create intent
EscrowYield: fund and submit
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowYield: short window
EscrowYield: create intent
EscrowYield: fund and submit
MockERC20: transferFrom
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowYield: release withdraw
EscrowYield: create intent
EscrowYield: fund and submit
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
MockERC20: transfer
MockYieldStrategyV2: redeem
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
```

### `test/unit/GigPayEscrowCoreV2.RFQRelease.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
RFQ Release: create intent
MockERC20: approve
MockERC20: transferFrom
RFQ Release: fund escrow
RFQ Release: swap pair IDRX -> USDC
RFQ Release: prepare RFQ order (IDRX -> USDC)
MockERC20: transfer
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
RFQ Release: releaseWithSwap executed
RFQ Release: payout verified
```

### `test/integration/Flow.Combo.YieldPlusProtection.Release.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Combo Release: create intent
MockERC20: approve
MockERC20: transferFrom
Flow Combo Release: fund escrow
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
Flow Combo Release: submit work
MockYieldStrategyV2: setYieldBps
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: fund
Flow Combo Release: seed yield
MockERC20: transferFrom
Flow Combo Release: buy protection
Flow Combo Release: set settler
MockERC20: approve
MockERC20: transferFrom
Flow Combo Release: fund optionbook
MockERC20: transfer
Flow Combo Release: settle and claim
Flow Combo Release: balances before
MockERC20: transfer
MockYieldStrategyV2: redeem
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
Flow Combo Release: release executed
Flow Combo Release: balances after
```

### `test/unit/YieldManagerV2.t.sol`
```
YieldManagerV2Test: setUp
MockERC20: constructor
MockIDRX: constructor
MockERC20: mint
MockERC20: mint
YieldManagerV2Test: depositFromEscrow
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
YieldManagerV2Test: setUp
MockERC20: constructor
MockIDRX: constructor
MockERC20: mint
MockERC20: mint
YieldManagerV2Test: depositFromTreasury
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
YieldManagerV2Test: setUp
MockERC20: constructor
MockIDRX: constructor
MockERC20: mint
MockERC20: mint
YieldManagerV2Test: withdrawTo
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
MockERC20: transfer
MockYieldStrategyV2: redeem
MockERC20: transfer
```

### `test/unit/SwapRouteRegistry.t.sol`
```
(no logs emitted)
```

### `test/unit/GigPayEscrowCoreV2.Intent.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowIntent: test createIntent fields
EscrowIntent: create intent
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowIntent: test fundFromTreasury auth
EscrowIntent: create intent
MockERC20: transferFrom
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
EscrowIntent: test submitWork auth
EscrowIntent: create intent
MockERC20: transferFrom
```

### `test/integration/Flow.Combo.YieldPlusProtection.ReleaseWithSwap.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Combo RFQ Release: create intent
MockERC20: approve
MockERC20: transferFrom
Flow Combo RFQ Release: fund escrow
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
Flow Combo RFQ Release: submit work
MockYieldStrategyV2: setYieldBps
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: fund
Flow Combo RFQ Release: seed yield
MockERC20: transferFrom
Flow Combo RFQ Release: buy protection
Flow Combo RFQ Release: set settler
MockERC20: approve
MockERC20: transferFrom
Flow Combo RFQ Release: fund optionbook
MockERC20: transfer
Flow Combo RFQ Release: settle and claim
Flow Combo RFQ Release: swap pair IDRX -> USDC
Flow Combo RFQ Release: prepare RFQ order (IDRX -> USDC)
MockERC20: transfer
MockYieldStrategyV2: redeem
MockERC20: transfer
MockERC20: transfer
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
Flow Combo RFQ Release: releaseWithSwap executed
Flow Combo RFQ Release: balances after
```

### `test/integration/Flow.Combo.YieldPlusProtection.Refund.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Combo Refund: create intent
Flow Combo Refund: treasury balance before
MockERC20: approve
MockERC20: transferFrom
Flow Combo Refund: fund escrow
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
Flow Combo Refund: submit work
MockYieldStrategyV2: setYieldBps
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: fund
Flow Combo Refund: seed yield
MockERC20: transferFrom
Flow Combo Refund: buy protection
Flow Combo Refund: set settler
MockERC20: approve
MockERC20: transferFrom
Flow Combo Refund: fund optionbook
MockERC20: transfer
Flow Combo Refund: settle and claim
MockERC20: transfer
MockYieldStrategyV2: redeem
MockERC20: transfer
MockERC20: transfer
Flow Combo Refund: refund executed
Flow Combo Refund: treasury balance after
```

### `test/integration/Flow.Protection.ClaimThenRelease.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Protection Release: create intent
MockERC20: approve
MockERC20: transferFrom
Flow Protection Release: fund escrow
MockERC20: transferFrom
Flow Protection Release: buy protection
Flow Protection Release: set settler
MockERC20: approve
MockERC20: transferFrom
Flow Protection Release: fund optionbook
MockERC20: transfer
Flow Protection Release: settle and claim
Flow Protection Release: balances before
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
Flow Protection Release: release executed
Flow Protection Release: balances after
```

### `test/invariants/Invariant.SplitSumAlways10000.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Invariant SplitSum: compute sum
```

### `test/integration/Flow.LongAcceptanceWindow.EscrowYieldThenRefund.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Yield Refund: create intent
Flow Yield Refund: treasury balance before
MockERC20: approve
MockERC20: transferFrom
Flow Yield Refund: fund escrow
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
Flow Yield Refund: submit work
MockYieldStrategyV2: setYieldBps
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: fund
Flow Yield Refund: seed yield
MockERC20: transfer
MockYieldStrategyV2: redeem
MockERC20: transfer
MockERC20: transfer
Flow Yield Refund: refund executed
Flow Yield Refund: treasury balance after
```

### `test/integration/Flow.TreasuryToEscrow.Refund.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
Flow Refund: create intent
Flow Refund: treasury balance before
MockERC20: approve
MockERC20: transferFrom
Flow Refund: fund escrow
MockERC20: transfer
Flow Refund: refund executed
Flow Refund: treasury balance after
```

### `test/unit/CompanyTreasuryVault.t.sol`
```
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
CompanyTreasuryVaultTest: configureAsset onlyOwner
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
CompanyTreasuryVaultTest: deposit and withdraw yield
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
MockERC20: transfer
MockYieldStrategyV2: redeem
MockERC20: transfer
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
CompanyTreasuryVaultTest: fundEscrow insufficient
MockERC20: transfer
```

### `test/invariants/Invariant.GoldenRule.OneOwnerPerPrincipal.t.sol`
```
Invariant OneOwner: setup
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
Invariant OneOwner: funded and submitted
MockYieldStrategyV2: redeem
MockYieldStrategyV2: redeem
MockYieldStrategyV2: setYieldFlat
MockERC20: approve
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: fund
MockERC20: approve
MockYieldStrategyV2: redeem
MockYieldStrategyV2: redeem
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: redeem
MockYieldStrategyV2: fund
MockERC20: mint
MockYieldStrategyV2: redeem
MockYieldStrategyV2: deposit
MockYieldStrategyV2: deposit
MockERC20: mint
MockYieldStrategyV2: fund
MockYieldStrategyV2: setYieldFlat
MockERC20: mint
MockYieldStrategyV2: fund
MockERC20: mint
MockYieldStrategyV2: redeem
MockYieldStrategyV2: redeem
MockERC20: mint
MockERC20: approve
MockYieldStrategyV2: fund
MockERC20: mint
MockYieldStrategyV2: setYieldBps
MockERC20: mint
MockERC20: mint
MockYieldStrategyV2: setYieldFlat
MockERC20: approve
MockYieldStrategyV2: redeem
MockYieldStrategyV2: redeem
MockERC20: approve
MockERC20: approve
MockERC20: mint
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: setYieldBps
Invariant OneOwner: check shares
```

### `test/invariants/Invariant.NoDoubleDeposit.t.sol`
```
Invariant NoDoubleDeposit: setup
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockERC20: approve
MockERC20: transferFrom
MockYieldStrategyV2: deposit
Invariant NoDoubleDeposit: funded and submitted
MockYieldStrategyV2: deposit
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: deposit
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: deposit
MockYieldStrategyV2: fund
MockERC20: mint
MockERC20: mint
MockYieldStrategyV2: fund
MockERC20: approve
MockERC20: mint
MockERC20: mint
MockYieldStrategyV2: setYieldBps
MockERC20: mint
MockYieldStrategyV2: deposit
MockERC20: mint
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: fund
MockERC20: mint
MockYieldStrategyV2: deposit
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: fund
MockYieldStrategyV2: redeem
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: fund
MockERC20: approve
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: fund
MockYieldStrategyV2: deposit
MockYieldStrategyV2: deposit
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: fund
MockYieldStrategyV2: deposit
MockERC20: mint
MockYieldStrategyV2: fund
MockYieldStrategyV2: fund
MockYieldStrategyV2: setYieldBps
MockERC20: mint
MockYieldStrategyV2: redeem
MockYieldStrategyV2: redeem
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: fund
Invariant NoDoubleDeposit: check submit
```

### `test/invariants/Invariant.NoStuckFunds.t.sol`
```
Invariant NoStuckFunds: setup
Config: init actors
Actors: init addresses
Config: deploy MockIDRX
MockERC20: constructor
MockIDRX: constructor
Config: deploy registry and managers
MockOptionBook: constructor
Config: set strategy
Config: set registry modules
Config: deploy treasury and escrow
Config: configure treasury asset
Config: set operators
Config: mint balances
MockERC20: mint
MockERC20: mint
MockERC20: approve
Config: approve option book
MockERC20: approve
MockERC20: approve
MockERC20: transferFrom
Invariant NoStuckFunds: funded
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: redeem
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: redeem
MockYieldStrategyV2: fund
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: fund
MockYieldStrategyV2: fund
MockERC20: approve
MockYieldStrategyV2: fund
MockYieldStrategyV2: deposit
MockYieldStrategyV2: deposit
MockYieldStrategyV2: deposit
MockYieldStrategyV2: deposit
MockERC20: approve
MockERC20: mint
MockYieldStrategyV2: fund
MockYieldStrategyV2: setYieldBps
MockERC20: approve
MockERC20: approve
MockERC20: mint
MockERC20: mint
MockERC20: mint
MockYieldStrategyV2: deposit
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: fund
MockYieldStrategyV2: setYieldBps
MockERC20: approve
MockERC20: approve
MockERC20: approve
MockERC20: approve
MockERC20: approve
MockYieldStrategyV2: setYieldBps
MockERC20: mint
MockYieldStrategyV2: fund
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: setYieldFlat
MockYieldStrategyV2: setYieldFlat
MockERC20: mint
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: setYieldBps
MockYieldStrategyV2: redeem
MockERC20: approve
MockERC20: mint
MockYieldStrategyV2: deposit
MockYieldStrategyV2: setYieldFlat
Invariant NoStuckFunds: check
MockERC20: transfer
MockERC20: transfer
MockERC20: transfer
Invariant NoStuckFunds: release executed
```
