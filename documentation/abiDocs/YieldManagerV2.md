# YieldManagerV2

## 1. Purpose
Manages yield strategies for escrow and treasury funds. Escrow core and treasury vault deposit/withdraw through this contract.

---

## 2. Deployment (Base Sepolia)
- Address: `0x22c94123e60fA65D742a5872a45733154834E4b0`
- Explorer: https://base-sepolia.blockscout.com/address/0x22c94123e60fA65D742a5872a45733154834E4b0
- ABI: `abis/YieldManagerV2.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
depositFromEscrow(uint256 intentId, uint32 strategyId, address asset, uint256 amount, address escrowCore) returns (uint256 shares)
depositFromTreasury(uint32 strategyId, address asset, uint256 amount, address treasury) returns (uint256 shares)
withdrawTo(uint256 intentId, uint32 strategyId, address asset, uint256 shares, address to) returns (uint256 assetsOut)
setStrategy(uint32 id, address strategy, bool allowed)
setOperator(address op, bool allowed)
transferOwnership(address newOwner)
```

### 3.2 Read
```
strategies(uint32) returns (address strategy, bool allowed)
operators(address) returns (bool)
owner() returns (address)
```

---

## 4. Events
```
YieldDeposited(uint256 intentId indexed, uint32 strategyId indexed, uint256 amount)
YieldWithdrawn(uint256 intentId indexed, uint32 strategyId indexed, uint256 amount)
StrategySet(uint32 strategyId indexed, address strategy, bool allowed)
OperatorSet(address operator indexed, bool allowed)
OwnerTransferred(address oldOwner indexed, address newOwner indexed)
```

---

## 5. Errors
```
ApproveFailed()
InvalidAddress()
InvalidAmount()
NotAuthorized()
StrategyNotAllowed()
TransferFailed()
TransferFromFailed()
```

---

## 6. How It Interacts With Other Contracts
- `GigPayEscrowCoreV2` deposits escrowed funds via `depositFromEscrow` when yield is enabled.
- `CompanyTreasuryVault` deposits treasury funds via `depositFromTreasury` and later withdraws with `withdrawTo`.
- Strategy selection is configured by operators and should align with `CompanyTreasuryVault.configureAsset`.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Yield configuration should be admin-only and surfaced as part of treasury settings.
- Display `strategies(id)` for strategy allowlist and to show which strategy IDs are active.
- When a yield-enabled intent is created, show a confirmation that funds will be deposited into a strategy.

### 7.2 Backend (Detailed)
- Escrow path: if `escrowYieldEnabled` is true, call `depositFromEscrow` when funds enter escrow.
- Treasury path: use `depositFromTreasury` for idle treasury funds, and track `YieldDeposited`.
- During release/refund, call `withdrawTo` to unwind shares and deliver assets to escrow or treasury.
- Only call `depositFromEscrow` or `depositFromTreasury` with a strategy marked `allowed`.

---

## 8. Example Call Flow
```
// Escrow deposits into yield strategy
yieldManager.depositFromEscrow(intentId, strategyId, asset, amount, escrowCore);
```

---

## 9. Related Docs
- `documentation/abiDocs/GigPayEscrowCoreV2.md`
- `documentation/abiDocs/CompanyTreasuryVault.md`
