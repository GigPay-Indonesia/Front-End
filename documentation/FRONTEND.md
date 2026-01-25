# GigPay Frontend – Treasury OS UX

GigPay UI is modeled after:

- Stripe Dashboard
- Brex
- Mercury
- Wise Business

---

## Core Screens

### 1) Home / Overview

- Treasury balance
- Yield positions
- Pending payments
- At-risk payments
- Upcoming releases

---

### 2) Treasury

- Assets:
  - IDRX
  - USDC
  - USDT
- Where funds are:
  - Liquid
  - In Yield
  - In Escrow
- Rebalance button (or auto)

---

### 3) Payments

Table of PaymentIntents:

- Status:
  - Created
  - Funded
  - Submitted
  - Released
  - Refunded
- Columns:
  - To
  - Amount
  - Asset
  - Deadline
  - Protection
  - Yield Enabled

Click → Payment Timeline.

---

### 4) Create Payment

Form:

- From: Treasury
- To: Entity
- Amount
- Asset
- Payout Asset
- Deadline
- Acceptance Window
- Splits
- Protection toggle
- Yield toggle

---

### 5) Payment Detail (Timeline)

Shows:

- Created
- Funded
- Submitted
- Yield Activated
- Protection Bought
- Released / Refunded

With buttons depending on role:
- Fund
- Release
- Refund
- Settle Protection

---

### 6) Vendors / Entities

- List of payees
- Their payout preferences
- Risk flags

---

### 7) Policies

- Approval rules
- Limits
- Default behaviors

---

## UX Principles

- No blockchain jargon
- No hashes
- Everything is “Payment”, “Release”, “Refund”
- OnchainKit handles:
  - wallet
  - transaction batching
  - gas sponsorship

---

## Mental Model for User

> “This is my programmable treasury.”


# GigPay Protocol - Frontend Integration Guide (V2)

This guide describes how a frontend (web or mini-app) should integrate with the
GigPay V2 contracts. It is aligned with the on-chain flow, registry-based
module discovery, and the test coverage in this repo.

---

## 1) Required Contracts (Reads + Writes)

Minimum:
- `GigPayEscrowCoreV2` (create intent, submit, release/refund)
- `CompanyTreasuryVault` (fund escrow)
- `GigPayRegistry` (resolve modules)

Read-only helpers:
- `SplitRouterV2` (optional validation for split inputs)
- `TokenRegistry` (escrow-eligible assets)
- `SwapRouteRegistry` (RFQ/fallback route availability)

Optional (protection UX):
- `OptionBook` (quote and policy status display)
- `OptionManagerV1` (advanced controls)

Optional (yield + vault UX):
- `YieldManagerV2` (read-only for strategy mapping)
- `MockThetanutsVault` (share price display when using mock vaults)
- `ThetanutsVaultStrategyV2` (adapter metadata via `vault()` and `assetToken()`)

---

## 2) Contract Discovery Flow

1. Load `GigPayRegistry` for the active network.
2. Resolve modules:
   - `yieldManager`, `splitRouter`, `optionBook`, `optionManager`
   - `tokenRegistry`, `routeRegistry`, `swapManager`
   - `rfqManager` (read-only; used for diagnostics and venue display)
3. Cache module addresses and re-load on network change.

---

## 3) Escrow State Mapping

UI status mapping:
- `Created`: intent exists, not funded
- `Funded`: funds locked in escrow
- `Submitted`: creator submitted work
- `Released`: payout completed
- `Refunded`: returned to treasury

Use events for immediate UI updates and confirm by reading the intent.

---

## 4) Create Intent (Creator UI)

Inputs:
- `treasury` (company vault address)
- `assetIn` (escrow asset)
- `payoutAsset` (optional, for swap payout)
- `amount`
- `deadline`
- `acceptanceWindow`
- `splits` (recipients + bps, must sum to 10_000)
- `yieldEnabled` + `strategyId`
- `routePreference` (RFQ only or allow fallback)

Calls:
```
GigPayEscrowCoreV2.createIntentFromTreasury(
  treasury,
  assetIn,
  amount,
  deadline,
  acceptanceWindow,
  splits,
  yieldEnabled,
  strategyId
)
```
If payout asset is different:
```
GigPayEscrowCoreV2.createIntentFromTreasuryWithPayout(
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

Listen for `IntentCreated` to confirm the `intentId`.
If `payoutAsset != assetIn`, the backend must build swap data and the UI should
surface the selected route and venue (RFQ primary, fallback optional).

---

## 5) Fund Escrow (Treasury UI)

Treasury operator triggers:
```
CompanyTreasuryVault.fundEscrow(escrow, assetIn, intentId, amount)
```

Only the treasury operator should be able to perform this action.

---

## 6) Submit Work (Creator UI)

```
GigPayEscrowCoreV2.submitWork(intentId, evidenceHash)
```

If `yieldEnabled` and acceptance window is long enough, escrow yield activates
automatically after submission.

UI note for mock vaults:
- If `strategyId` maps to `ThetanutsVaultStrategyV2`, display that yield is routed
  into the mock ERC4626 vault and show share price changes (optional).

---

## 7) Release or Refund (Treasury UI)

### Release (no swap)
```
GigPayEscrowCoreV2.release(intentId)
```

### Release with swap
```
GigPayEscrowCoreV2.releaseWithSwap(intentId, swapData)
```
If `assetIn != payoutAsset`, require a swap path. The backend should build
`swapData` using `SwapRouteRegistry` and pass it to the UI or submit directly.
Frontend should display the chosen route and whether fallback is enabled.

### Refund
```
GigPayEscrowCoreV2.refundToTreasury(intentId)
```

---

## 8) Protection UX (Optional)

UI behavior:
- allow enabling protection at intent creation
- show premium estimates and policy status

Backend executes:
```
GigPayEscrowCoreV2.buyProtectionFromQuote(intentId, quote, buyer)
GigPayEscrowCoreV2.settleAndClaimProtection(intentId)
```

Display protection payout as extra coverage during release/refund.

---

## 9) Asset and Route Validation

Use:
- `TokenRegistry` to show only eligible stablecoins.
- `SwapRouteRegistry` to show RFQ/fallback availability per pair.
- `YieldManagerV2.strategies(strategyId)` to validate a configured vault strategy.

Guard rails:
- block invalid splits (sum must be 10_000)
- warn if payout requires swap but route is unavailable
- validate acceptance windows for yield if you expose the toggle

Multi-payout support:
- Each `(assetIn, payoutAsset)` pair must be configured in `SwapRouteRegistry`.
- Example: to allow IDRX payouts in USDC, DAI, EURC, USDT, the backend should
  set four routes and the UI should reflect availability per token.

---

## 10) Suggested Frontend State Model

Store per intent:
- `intentId`, `creator`, `treasury`
- `assetIn`, `payoutAsset`, `amount`
- `splits`, `feeBps`
- `status`, `deadline`, `acceptanceWindow`
- `yieldEnabled`, `strategyId`
- `protectionEnabled`, `policyId`
- `routePreference`, `swapRequired`
- action tx hashes (fund, submit, release/refund)

---

## 11) Events to Index for UI

- `IntentCreated`
- `Funded`
- `Submitted`
- `Released`
- `Refunded`
- `ProtectionBought`
- `ProtectionSettled`
- `ProtectionClaimed`

Use events to drive activity feeds and timeline views.

---

## 12) Error Handling and UX

- surface revert reasons (invalid state, not authorized)
- gate actions by escrow status
- validate split totals on client
- block release until submission
- when swap is required, show route availability and selected venue

---

## 13) Base Sepolia Mock Wiring Checklist

Use this when the backend deploys the mock RFQ stack on Base Sepolia:
- Resolve `OPTION_BOOK`, `RFQ_MANAGER`, and `SWAP_MANAGER` from `GigPayRegistry`.
- Confirm `SwapRouteRegistry` has routes for `IDRX -> USDC/DAI/EURC/USDT`.
- Show RFQ as primary route; only show fallback if `fallbackAllowed` is true.
- Ensure UI uses the registry addresses (no hardcoding).

Mock vault + strategy (Thetanuts demo):
- Display `MockThetanutsVault` as the yield venue when `strategyId` points to
  `ThetanutsVaultStrategyV2`.
- Read `totalAssets()` and `totalSupply()` to show share price for demo yield.
- Mark `donate()` as admin/test-only (not exposed to end users).

---

## 14) DeployRfqMockWire Integration Notes

This section aligns the UI with `script/DeployRfqMockWire.s.sol`.

### 14.1 What the script configures
- Deploys `MockOptionBook`, `OptionBookRFQSwapManager`, `FallbackSwapManager`, and a new `CompositeSwapManager`.
- Wires registry modules:
  - `OPTION_BOOK` -> MockOptionBook
  - `RFQ_MANAGER` -> OptionBookRFQSwapManager
  - `SWAP_MANAGER` -> CompositeSwapManager
- Sets multiple routes for a single `assetIn` (default `MockIDRX`) to multiple payout assets:
  - `MockUSDC`, `MockDAI`, `MockEURC`, `MockUSDT`
- Allows per-token RFQ/fallback flags.

### 14.2 Frontend requirements for consistency
- Always resolve `swapManager`, `routeRegistry`, and `tokenRegistry` from `GigPayRegistry`.
- For each payout token, call `SwapRouteRegistry.getRoute(assetIn, payoutAsset)` and show:
  - RFQ availability (`rfqAllowed`)
  - Fallback availability (`fallbackAllowed`)
  - Active venues (`rfqVenue`, `fallbackVenue`)
- When creating intents with a payout asset, set `routePreference`:
  - RFQ only (preferred default)
  - Allow fallback only if `fallbackAllowed` is true
- When releasing with swap, expect the backend to supply `swapData` and show:
  - Selected route and venue
  - Whether fallback is enabled

### 14.3 Swap data encoding (frontend awareness)
Frontend does not encode `swapData`, but it must understand what the backend is doing:
- Composite swap format:
```
swapData = abi.encode(primaryData, fallbackData, allowFallback)
```
- RFQ primary format:
```
primaryData = abi.encode(order, signature)
```
- Fallback format:
```
fallbackData = abi.encode(target, callData)
```

### 14.4 Preconditions that affect UI behavior
- If the registry or route registry owner is not the deployer, routes and modules may not be set.
- If a route is missing for a payout token, the UI must block that payout selection.

Example `.env` snippet (for backend deployment reference):
```
ROUTE_ASSET_IN=0x20Abd5644f1f77155c63A8818C75540F770ae223  # MockIDRX
ROUTE_RFQ_VENUE=0x0000000000000000000000000000000000000000  # MockOptionBook
ROUTE_FALLBACK_VENUE=0x0000000000000000000000000000000000000000  # FallbackSwapManager
ROUTE_ENABLE_USDC=1
ROUTE_ENABLE_DAI=1
ROUTE_ENABLE_EURC=1
ROUTE_ENABLE_USDT=1

ROUTE_RFQ_ALLOWED_DAI=1
ROUTE_FALLBACK_ALLOWED_DAI=0

ROUTE_RFQ_ALLOWED_USDT=1
ROUTE_FALLBACK_ALLOWED_USDT=1
```

---

## 13) Base Mini-App Notes

- Use on-chain intents for one-tap UX.
- Prefer smart wallet integrations for sponsored transactions.
- Keep registry-based module resolution to avoid hardcoding addresses.
