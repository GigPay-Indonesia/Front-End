# GigPayEscrowCoreV2

## 1. Purpose
Core escrow contract for GigPay V2. It manages intent creation, funding, submission, release/refund, optional swaps, and protection settlement.

---

## 2. Deployment (Base Sepolia)
- Address: `0xd09177C97978f5c970ad25294681F5A51685c214`
- Explorer: https://base-sepolia.blockscout.com/address/0xd09177C97978f5c970ad25294681F5A51685c214
- ABI: `abis/GigPayEscrowCoreV2.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
createIntentFromTreasury(
  address treasury,
  address asset,
  uint128 amount,
  uint64 deadline,
  uint64 acceptanceWindow,
  tuple[] splits { address recipient, uint16 bps },
  bool escrowYieldEnabled,
  uint32 escrowStrategyId
) returns (uint256 intentId)

createIntentFromTreasuryWithPayout(
  address treasury,
  address assetIn,
  address payoutAsset,
  uint128 amount,
  uint64 deadline,
  uint64 acceptanceWindow,
  tuple[] splits { address recipient, uint16 bps },
  bool escrowYieldEnabled,
  uint32 escrowStrategyId,
  uint8 preferredRoute
) returns (uint256 intentId)

fundFromTreasury(uint256 intentId, uint256 amount)
submitWork(uint256 intentId, bytes32 evidenceHash)
release(uint256 intentId)
releaseWithSwap(uint256 intentId, bytes swapData)
refundToTreasury(uint256 intentId)

buyProtectionFromQuote(
  uint256 intentId,
  tuple q { address asset, uint256 premium, uint256 payout, uint64 expiry, address maker, bytes32 rfqId },
  address buyer
)
attachExistingPolicy(uint256 intentId, uint256 policyId, address buyer)
settleAndClaimProtection(uint256 intentId) returns (uint256 payout)
setProtectionPayoutSplit(uint16 toCreatorBps)
```

### 3.2 Read
```
intents(uint256) returns (
  address treasury,
  address payer,
  address creator,
  address asset,
  address payoutAsset,
  uint128 amount,
  uint64 deadline,
  uint64 acceptanceWindow,
  uint8 status,
  bool swapRequired,
  uint8 preferredRoute,
  bool escrowYieldEnabled,
  uint32 escrowStrategyId,
  uint256 escrowShares,
  uint64 submittedAt,
  bool protectionEnabled,
  uint256 protectionPolicyId,
  address protectionBuyer,
  uint64 protectionBoughtAt
)
getSplits(uint256 intentId) returns (tuple[] { address recipient, uint16 bps })
nextIntentId() returns (uint256)
registry() returns (address)
platformFeeBps() returns (uint16)
feeRecipient() returns (address)
protectionPayoutToCreatorBps() returns (uint16)
```

---

## 4. Events
```
IntentCreated(uint256 intentId indexed, address treasury indexed, address asset indexed, uint256 amount)
Funded(uint256 intentId indexed, address treasury indexed, uint256 amount)
Submitted(uint256 intentId indexed, bytes32 evidenceHash)
Released(uint256 intentId indexed, uint256 principalPaid, uint256 yieldPaid, uint256 protectionExtra)
Refunded(uint256 intentId indexed, uint256 principalReturned, uint256 yieldReturned, uint256 protectionExtraReturned)

IntentAssetPreferenceSet(uint256 intentId indexed, address assetIn, address assetOut)
SwapAttempted(uint256 intentId indexed, address assetIn, address assetOut, address venue)
SwapExecuted(uint256 intentId indexed, address assetIn, address assetOut, address venue, uint256 amountIn, uint256 amountOut)
SwapSkipped(uint256 intentId indexed, address assetIn, address assetOut)

EscrowYieldOn(uint256 intentId indexed, uint32 strategyId, uint256 shares)

ProtectionAttached(uint256 intentId indexed, uint256 policyId indexed)
ProtectionBought(uint256 intentId indexed, uint256 policyId indexed, address buyer indexed)
ProtectionSettled(uint256 intentId indexed, uint256 policyId indexed)
ProtectionClaimed(uint256 intentId indexed, uint256 policyId indexed, uint256 payout)
ProtectionPayoutSplitSet(uint16 toCreatorBps)
```

---

## 5. Errors
```
ApproveFailed()
DeadlineNotReached()
DeadlinePassed()
InvalidAddress()
InvalidAmount()
InvalidState()
NotAuthorized()
SplitSumMismatch()
StrategyNotSet()
TransferFailed()
TransferFromFailed()
```

---

## 6. How It Interacts With Other Contracts
- Resolves modules from `GigPayRegistry` (swap manager, token registry, route registry, yield manager).
- Receives funds from `CompanyTreasuryVault` via `fundFromTreasury`, then holds escrowed assets.
- When swaps are required, calls `CompositeSwapManager.executeSwap` via `releaseWithSwap`.
- When yield is enabled, interacts with `YieldManagerV2` to deposit and withdraw escrowed funds.
- When protection is enabled, consumes policy data and emits protection lifecycle events.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Intent creation: call `createIntentFromTreasury` (same asset payout) or `createIntentFromTreasuryWithPayout` (swap payout).
- Build `splits` such that the sum of `bps` is exactly 10000, otherwise `SplitSumMismatch` occurs.
- Choose a `preferredRoute` when `payoutAsset` differs from `assetIn`. Use `SwapRouteRegistry` to confirm the route exists.
- After work is done, call `submitWork(intentId, evidenceHash)` with a content hash of proof.
- If the intent is swap-required, call `releaseWithSwap` and pass `swapData` provided by the backend; otherwise call `release`.
- Use events (`Submitted`, `Released`, `Refunded`) to update UI state.

### 7.2 Backend (Detailed)
- Index `IntentCreated`, `Funded`, `Submitted`, `Released`, `Refunded` to maintain intent lifecycle state in your database.
- Gate transactions by intent status and time windows; avoid `DeadlinePassed` and `DeadlineNotReached` reverts.
- Use `TokenRegistry` to validate asset eligibility and decimals before constructing amounts.
- For swaps: build `swapData` using the chosen venue and `SwapRouteRegistry` permissions; call `releaseWithSwap`.
- For yield: if `escrowYieldEnabled`, ensure the strategy is allowed and reconcile `EscrowYieldOn` events.
- For protection: track `ProtectionBought`, `ProtectionSettled`, and call `settleAndClaimProtection` when eligible.

---

## 8. Example Call Flow
```
// 1) Create intent
const intentId = await escrow.createIntentFromTreasury(
  treasury, asset, amount, deadline, acceptanceWindow, splits, true, strategyId
);

// 2) Fund from treasury
await escrow.fundFromTreasury(intentId, amount);

// 3) Submit work
await escrow.submitWork(intentId, evidenceHash);

// 4) Release
await escrow.release(intentId);
```

---

## 9. Related Docs
- `documentation/abiDocs/GigPayRegistry.md`
- `documentation/abiDocs/CompanyTreasuryVault.md`
- `documentation/abiDocs/CompositeSwapManager.md`
- `documentation/abiDocs/SwapRouteRegistry.md`
- `documentation/abiDocs/YieldManagerV2.md`
