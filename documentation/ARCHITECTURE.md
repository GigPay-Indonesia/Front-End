# GigPay Protocol - Architecture and Flow (Judge-ready)

This document explains the current on-chain architecture and full payment flow
as implemented in this repo.

---

## 1) Naming Conventions
- Core: owns state and invariants (escrow state machine, treasury vault).
- Manager: orchestration (routes deposits, claims, and strategy calls).
- Strategy/Adapter: protocol-specific integrations (ERC4626 vaults, OptionBook, swap venues).
- Types/Libraries: shared structs, math, errors, and events.

---

## 2) Architecture Overview (High level)

```
Frontend (Mini-App / Web)
    |
    v
GigPayEscrowCoreV2  <-->  CompanyTreasuryVault
    |                          |
    |                          v
    |                     YieldManagerV2
    |                          |
    |                          v
    |                   Strategy (ERC4626)
    |
    v
SwapManager (Composite)
    |
    +--> OptionBook RFQ
    |
    +--> AMM/Aggregator (fallback)
```

Key idea: Treasury funds are separated from escrow funds, and yield ownership
is explicit.

---

## 3) Current Repository Structure (Actual)

```
src/
  core/
    AccessManager.sol
    CompanyTreasuryVault.sol
    GigPayEscrowCoreV2.sol
    GigPayRegistry.sol
    TokenRegistry.sol
    SwapRouteRegistry.sol
  managers/
    YieldManager.sol
    YieldManagerV2.sol
    OptionManager.sol
    RFQSwapManager.sol
    FallbackSwapManager.sol
    CompositeSwapManager.sol
  routers/
    SplitRouter.sol
    SplitRouterV2.sol
  strategies/
    ThetanutsVaultStrategy.sol
  thetanuts/
    IThetanutsOptionBook.sol
    IOptionBookRFQ.sol
    IOptionBook.sol
    MockOptionBook.sol
  interfaces/
    IERC20Minimal.sol
    ISwapManager.sol
    ITokenRegistry.sol
    IYieldStrategy.sol
    IYieldStrategyV2.sol
    IVault4626.sol
    IEscrowTreasuryHook.sol
  libraries/
    SafeTransferLib.sol
    Errors.sol
    BpsMath.sol
  types/
    GigTypes.sol
    PolicyTypes.sol
    Events.sol
  tokens/
    MockIDRX.sol
    MockUSDC.sol
    MockUSDT.sol
    MockDAI.sol
    MockEURC.sol
```

Notes:
- The system is `GigPayEscrowCoreV2` + `CompanyTreasuryVault` + `YieldManagerV2`.

---

## 4) Core Contracts (What they do)

### 4.1 `GigPayRegistry`
Holds module pointers for:
- `yieldManager`
- `splitRouter`
- `optionManager`
- `optionBook`
- `tokenRegistry`
- `routeRegistry`
- `swapManager`

This lets V2 core resolve the correct modules without redeploying the core.

### 4.2 `CompanyTreasuryVault`
Company treasury vault that:
- holds funds and configures assets
- funds escrow intents (`fundFromTreasury`)
- optionally deposits idle funds into yield
- redeems shares to cover shortfalls

### 4.3 `GigPayEscrowCoreV2`
Payment intent state machine with:
- create intent from treasury
- create intent with payout asset (assetIn/assetOut)
- fund by treasury
- submit work
- release or refund
- optional escrow yield
- optional protection policies via OptionBook
- asset-in / asset-out preference + conditional swap on release

### 4.4 `YieldManagerV2`
Share-based router that:
- deposits assets into strategies and returns shares
- redeems shares to assets on withdrawal

### 4.5 `SplitRouterV2`
Split payout router. Escrow uses this to distribute principal.

### 4.6 `OptionManagerV1` and `OptionBook`
OptionManager executes protection RFQ flows and claims payouts. OptionBook (mock for now)

### 4.7 `TokenRegistry` and `SwapRouteRegistry`
- TokenRegistry defines escrow-eligible stablecoins per chain.
- SwapRouteRegistry defines RFQ/fallback availability per token pair.

### 4.8 `SwapManager` (Composite + RFQ + Fallback)
- `OptionBookRFQSwapManager` executes RFQ fills using OptionBook orders.
- `FallbackSwapManager` executes AMM/aggregator calls.
- `CompositeSwapManager` routes to RFQ then fallback when allowed.

---

## 5) End-to-End Flow

### 5.1 Create Intent
Creator calls:
```
createIntentFromTreasury(treasury, asset, amount, deadline, acceptanceWindow, splits, yieldEnabled, strategyId)
```
Or when specifying a payout asset:
```
createIntentFromTreasuryWithPayout(
  treasury,
  assetIn,
  payoutAsset,
  amount,
  deadline,
  acceptanceWindow,
  splits,
  yieldEnabled,
  strategyId,
  routePreference
)
```

### 5.2 Fund from Treasury
Treasury vault calls:
```
fundFromTreasury(intentId, amount)
```

### 5.3 Submit Work
Creator calls:
```
submitWork(intentId, evidenceHash)
```

### 5.4 Optional: Escrow Yield
If acceptance window is long, escrow deposits into yield strategy and stores
strategy shares.

### 5.5 Release
Treasury calls:
```
release(intentId)
```
Escrow withdraws yield, pays fee, then splits principal through SplitRouterV2.
Yield is paid to the creator. Protection payout (if present) is split per policy.
If `assetIn != payoutAsset`, treasury calls:
```
releaseWithSwap(intentId, swapData)
```
SwapManager executes RFQ or fallback and then the escrow releases in the payout asset.

### 5.6 Refund
Treasury calls:
```
refundToTreasury(intentId)
```
Escrow withdraws yield, returns principal + yield + protection extra to treasury.

---

## 6) Protection (OptionBook) Flow

### Buy protection from RFQ
```
buyProtectionFromQuote(intentId, quote, buyer)
```
- Only treasury can trigger.
- Buyer must approve asset to OptionBook.
- Policy is attached to intent.

### Attach existing policy
```
attachExistingPolicy(intentId, policyId, buyer)
```
- For offchain RFQ flows.

### Settle and claim
```
settleAndClaimProtection(intentId)
```
- Settles policy and claims payout into escrow balance.
- Payout is treated as "extra" in release/refund.

---

## 7) V2 Summary
- Treasury-first design
- Explicit escrow yield shares
- RFQ protection policies
- SplitRouterV2 integration

---

## 8) Deployment and Configuration

1. Deploy `GigPayRegistry`
2. Deploy `YieldManagerV2`
3. Deploy `SplitRouterV2`
4. Deploy `TokenRegistry`
5. Deploy `SwapRouteRegistry`
6. Deploy `MockOptionBook` (or real OptionBook)
7. Deploy `OptionBookRFQSwapManager(optionBook, referrer)`
8. Deploy `FallbackSwapManager()` if using fallback
9. Deploy `CompositeSwapManager(escrowCore, rfqManager, fallbackManager)`
10. Deploy `OptionManagerV1` (optional, if using it)
11. Set registry modules:
   - `YIELD_MANAGER` -> YieldManagerV2
   - `SPLIT_ROUTER` -> SplitRouterV2
   - `OPTION_BOOK` -> OptionBook
   - `OPTION_MANAGER` -> OptionManagerV1 (optional)
   - `RFQ_MANAGER` -> OptionBookRFQSwapManager (legacy ref)
   - `TOKEN_REGISTRY` -> TokenRegistry
   - `ROUTE_REGISTRY` -> SwapRouteRegistry
   - `SWAP_MANAGER` -> CompositeSwapManager
12. Deploy `CompanyTreasuryVault(owner, YieldManagerV2)`
13. Deploy `GigPayEscrowCoreV2(registry, feeBps, feeRecipient)`
14. Configure treasury assets and strategies

### Base Network Config

**Base Mainnet (8453)**:
- OptionBook (Thetanuts): `0xd58b814C7Ce700f251722b5555e25aE0fa8169A1`
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

**Base Sepolia (84532)**:
- OptionBook: deploy `MockOptionBook` (or use Thetanuts test deployment if provided)
- USDC/USDT/DAI/EURC: deploy mocks or use faucet tokens

**Wiring Steps (both networks)**:
1. Set registry modules, including `TOKEN_REGISTRY`, `ROUTE_REGISTRY`, and `SWAP_MANAGER`.
2. Configure TokenRegistry with escrow-eligible stables (IDRX/USDC/EURC/DAI/USDT).
3. Configure SwapRouteRegistry pairs (RFQ/fallback availability).
4. Ensure escrow holds input asset (e.g. IDRX) and swap managers hold no residual balances.
5. Fund OptionBook (or mock) with payout token liquidity for RFQ fills.

---

## 9) Security and Invariants

- One principal has one yield owner at a time.
- Treasury yield and escrow yield are never mixed.
- Escrow settlement is self-contained.
- Protection payout is treated as extra cash, not yield.
- All critical module addresses resolved through registry.

---

## 10) Judge-facing Summary

GigPay is a treasury-first, on-chain payment OS. It combines:
- Escrow state machine for payment intents
- Yield routing of idle funds
- RFQ-based protection policies via Thetanuts OptionBook
- Modular routing via registry

This design makes the system composable, auditable, and ready for
consumer-grade UX on Base.
