# GigPay Testing Guide

This document explains the test coverage and how each test maps to the
end-to-end flow of the GigPay application (Treasury → Escrow → Yield →
Protection/OptionBook). It is aligned with the current repository layout
and the actual Foundry suites you run with `forge test`.

## Test layout (current repo)

```txt
test/
  config/
    config.t.sol
    Actors.t.sol
    Addresses.t.sol
    Helpers.t.sol

  unit/
    AccessControl.t.sol
    CompanyTreasuryVault.t.sol
    GigPayEscrowCoreV2.Intent.t.sol
    GigPayEscrowCoreV2.Yield.t.sol
    GigPayEscrowCoreV2.Splits.t.sol
    GigPayEscrowCoreV2.Protection.OptionBook.t.sol
    GigPayEscrowCoreV2.RFQRelease.t.sol
    Registry.t.sol
    TokenRegistry.t.sol
    SwapRouteRegistry.t.sol
    MultiChainConfig.t.sol
    YieldManagerV2.t.sol

  integration/
    Flow.TreasuryToEscrow.Release.t.sol
    Flow.TreasuryToEscrow.Refund.t.sol
    Flow.LongAcceptanceWindow.EscrowYieldThenRelease.t.sol
    Flow.LongAcceptanceWindow.EscrowYieldThenRefund.t.sol
    Flow.Protection.ClaimThenRelease.t.sol
    Flow.Protection.ClaimThenRefund.t.sol
    Flow.Combo.YieldPlusProtection.Release.t.sol
    Flow.Combo.YieldPlusProtection.Refund.t.sol
    Flow.Combo.YieldPlusProtection.ReleaseWithSwap.t.sol
    Flow.Swap.Fallback.Release.t.sol

  invariants/
    Invariant.GoldenRule.OneOwnerPerPrincipal.t.sol
    Invariant.NoDoubleDeposit.t.sol
    Invariant.NoStuckFunds.t.sol
    Invariant.SplitSumAlways10000.t.sol

  mocks/
    Mock4626Vault.t.sol
    MockERC20.t.sol
    MockIDRX.t.sol
    MockOptionBook.t.sol
    MockRegistry.t.sol
    MockSwapVenue.t.sol
    MockYieldStrategyV2.t.sol
```

### Why this structure works

- `config/` provides a single deterministic system deployment used by all
  tests (actors, registry, managers, escrow, treasury, and mocks).
- `unit/` asserts correctness of each contract in isolation.
- `integration/` validates full user flows (the same flows used in demos).
- `invariants/` uses Foundry’s invariant runner to stress long sequences.
- `mocks/` provides deterministic behavior for yield and protection.

## How the system is wired in tests

`test/config/config.t.sol` builds a full system with mocks and registers
every module:

- Deploys `MockIDRX`, stablecoin mocks (USDC/USDT/DAI/EURC), `GigPayRegistry`,
  `TokenRegistry`, `SwapRouteRegistry`, `YieldManagerV2`, `SplitRouterV2`,
  `MockYieldStrategyV2`, and `MockOptionBook`.
- Registers modules in `GigPayRegistry` for yield manager, split router,
  option book, token registry, route registry, and swap manager.
- Deploys `CompanyTreasuryVault` and `GigPayEscrowCoreV2`, and sets operators.
- Seeds balances for treasury and buyer and sets token approvals and token
  registry entries.

All tests inherit this so they share the same initial state and contracts.

## Coverage scope (what the tests prove)

### Escrow state machine (core safety)

- Creation validates input (nonzero asset/amount, deadline, split sum).
- Funding requires treasury authority and exact amount.
- Submission only allowed by creator and triggers yield if eligible.
- Release and refund only allowed by treasury and enforce state checks.

### Yield pipeline (escrow yield path)

- Yield activates only for long acceptance windows on submission.
- Funds flow into `YieldManagerV2` and strategy, then are withdrawn before
  release/refund.
- Yield profits are separated from principal and distributed correctly.

### Protection / OptionBook (claim and payout)

- Treasury-only purchase of protection policies.
- Attach and settle behavior on the option book.
- Claim moves payout into escrow balance.
- Extra protection payout is split on release and returned on refund.

### Splits and fees (distribution correctness)

- Split bps sums to 10,000 and invalid splits revert.
- SplitRouterV2 distributes principal to recipients.
- Platform fees are applied before split payout.

### Swaps (RFQ + fallback)

- RFQ swaps execute IDRX -> USDC using OptionBook orders.
- Fallback swaps execute IDRX -> USDC via an AMM/aggregator-style venue.
- Asset-in vs asset-out drives conditional swap on release.

### Invariants (safety over many sequences)

- No double deposit for escrow yield.
- No stuck funds after release or refund.
- One-owner-per-principal rule holds when escrow yield is active.
- Split sum always 10,000.

## Detailed mapping to actual test suites

### Unit tests

#### `unit/AccessControl.t.sol`
- `test_setOperator_onlyOwner` ensures operator gating works.
- `test_transferOwnership_onlyOwner` verifies ownership safety.

#### `unit/Registry.t.sol`
- `test_setModule_onlyOwner` guards against untrusted module changes.
- `test_setModule_setsPointers` ensures modules resolve correctly.

#### `unit/YieldManagerV2.t.sol`
- `test_depositFromEscrow_pullsAndDeposits` checks escrow → manager → strategy.
- `test_depositFromTreasury_pullsAndDeposits` checks treasury deposit path.
- `test_withdrawTo_redeemsShares` verifies redeem and payout routing.

#### `unit/CompanyTreasuryVault.t.sol`
- `test_configureAsset_onlyOwner` ensures asset config is restricted.
- `test_depositToYield_and_withdrawFromYield` validates treasury yield ops.
- `test_fundEscrow_reverts_if_insufficient_liquidity` protects against
  underfunded escrow operations.

#### `unit/GigPayEscrowCoreV2.Intent.t.sol`
- `test_createIntent_stores_fields_and_splits` checks intent persistence.
- `test_fundFromTreasury_onlyTreasury_exactAmount` enforces funding rules.
- `test_submitWork_onlyCreator` protects submission.

#### `unit/GigPayEscrowCoreV2.Yield.t.sol`
- `test_escrowYield_activates_forLongWindow` gates yield activation.
- `test_escrowYield_notActivated_forShortWindow` prevents short-window yield.
- `test_release_withdraws_yield_first` ensures yield is settled before payout.

#### `unit/GigPayEscrowCoreV2.Splits.t.sol`
- `test_createIntent_reverts_on_bad_splits` validates split input.
- `test_release_pays_split_recipient` confirms split routing.

#### `unit/GigPayEscrowCoreV2.Protection.OptionBook.t.sol`
- `test_buyProtection_onlyTreasury` guards purchase authority.
- `test_settleAndClaim_sends_payout_to_escrow` confirms payouts reach escrow.

#### `unit/GigPayEscrowCoreV2.RFQRelease.t.sol`
- `test_releaseWithSwap_executes_and_pays_splits` models a treasury releasing
  IDRX escrow into USDC payouts via RFQ, representing cross-currency payout.

#### `unit/TokenRegistry.t.sol`
- `test_setToken_and_lookup` models a deployer enabling stablecoins for escrow
  eligibility and symbol lookup (e.g., allowing USDC/USDT/DAI/EURC).

#### `unit/SwapRouteRegistry.t.sol`
- `test_setRoute_and_getRoute` models configuring RFQ + fallback venues for a
  token pair (IDRX->USDC).
- `test_setRoute_for_eurc_usdc_pair` models a specific EURC->USDC route
  (RFQ-only) for EU payouts.

#### `unit/MultiChainConfig.t.sol`
- `test_base_mainnet_constants` models production chain constants (Base mainnet).
- `test_base_sepolia_constants` models testnet config (Base Sepolia).

### Integration tests (application flows)

Each integration test runs through the real flow using the Config system.
These are the “user journey” tests for demos and business validation.

#### `Flow.TreasuryToEscrow.Release.t.sol`
Basic flow without yield or protection:
- Intent created by creator.
- Treasury funds escrow.
- Treasury releases.
- Principal distributed to split recipients and fee recipient.

#### `Flow.TreasuryToEscrow.Refund.t.sol`
Basic refund path:
- Intent created and funded.
- Treasury refunds after deadline.
- Principal returned to treasury.

#### `Flow.LongAcceptanceWindow.EscrowYieldThenRelease.t.sol`
Yield-only flow:
- Long acceptance window triggers escrow yield on submission.
- Yield accrued in strategy.
- Release withdraws yield and pays creator yield, principal via splits.

#### `Flow.LongAcceptanceWindow.EscrowYieldThenRefund.t.sol`
Yield-only refund:
- Yield is activated on submit.
- Refund returns principal + yield to treasury.

#### `Flow.Protection.ClaimThenRelease.t.sol`
Protection-only release:
- Treasury buys protection.
- Policy settles and payout is claimed into escrow.
- Release splits principal + protection extra.

#### `Flow.Protection.ClaimThenRefund.t.sol`
Protection-only refund:
- Treasury buys protection.
- Policy settles and payout is claimed.
- Refund returns principal + protection extra to treasury.

#### `Flow.Combo.YieldPlusProtection.Release.t.sol`
Combined yield + protection:
- Yield is activated and protection payout is claimed.
- Release distributes principal splits + yield to creator + extra split.

#### `Flow.Combo.YieldPlusProtection.Refund.t.sol`
Combined yield + protection refund:
- Yield is activated and protection payout is claimed.
- Refund returns principal + yield + extra back to treasury.

#### `Flow.Combo.YieldPlusProtection.ReleaseWithSwap.t.sol`
Combined yield + protection + RFQ swap:
- IDRX escrow releases to USDC payout via RFQ.
- Yield and protection extra are converted proportionally.

#### `Flow.Swap.Fallback.Release.t.sol`
Fallback swap flow:
- RFQ intentionally fails, fallback AMM/aggregator executes IDRX->USDC.
- Treasury release still completes with correct payout asset.

### Invariants (fuzzed safety)

#### `Invariant.GoldenRule.OneOwnerPerPrincipal.t.sol`
Asserts that escrow shares imply the treasury does not own the same principal
in the yield manager. Prevents double-ownership of funds.

#### `Invariant.NoDoubleDeposit.t.sol`
Ensures escrow yield cannot be activated twice for a single intent.

#### `Invariant.NoStuckFunds.t.sol`
After terminal states, escrow should not retain funds for that intent.

#### `Invariant.SplitSumAlways10000.t.sol`
Split arrays always sum to `10_000` bps.

## Test coverage vs. application flow

Below is the full flow and the test suites that validate each segment:

1. **Create intent**
   - Unit: `GigPayEscrowCoreV2.Intent.t.sol`
   - Integration: all `Flow.*` tests

2. **Fund escrow from treasury**
   - Unit: `CompanyTreasuryVault.t.sol`
   - Integration: all `Flow.*` tests

3. **Submit work**
   - Unit: `GigPayEscrowCoreV2.Intent.t.sol`
   - Integration: yield/protection flows

4. **Escrow yield activation**
   - Unit: `GigPayEscrowCoreV2.Yield.t.sol`, `YieldManagerV2.t.sol`
   - Integration: `Flow.LongAcceptanceWindow.*`, `Flow.Combo.*`

5. **Protection purchase and claim**
   - Unit: `GigPayEscrowCoreV2.Protection.OptionBook.t.sol`
   - Integration: `Flow.Protection.*`, `Flow.Combo.*`

6. **Release or refund**
   - Unit: `GigPayEscrowCoreV2.Yield.t.sol`, `GigPayEscrowCoreV2.Splits.t.sol`
   - Unit (swap): `GigPayEscrowCoreV2.RFQRelease.t.sol`
   - Integration: `Flow.TreasuryToEscrow.*`, `Flow.LongAcceptanceWindow.*`,
     `Flow.Protection.*`, `Flow.Combo.*`, `Flow.Swap.Fallback.Release.t.sol`

7. **System safety**
   - Invariants: `Invariant.*` suite

## How to read test output

- Unit tests confirm correctness of individual functions and access control.
- Integration tests confirm end-to-end flows with real token movement.
- Invariants show the system stays safe across thousands of randomized calls.

This combination gives both functional correctness and protocol safety
coverage for the GigPay flow.
