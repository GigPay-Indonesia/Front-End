# CompanyTreasuryVault

## 1. Purpose
Treasury vault for company funds. It funds escrow intents, handles refunds, and manages treasury-side yield deposits.

---

## 2. Deployment (Base Sepolia)
- Address: `0xcDfd5B882e8dF41b3EFc1897dAf759a10a7457B8`
- Explorer: https://base-sepolia.blockscout.com/address/0xcDfd5B882e8dF41b3EFc1897dAf759a10a7457B8
- ABI: `abis/CompanyTreasuryVault.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
configureAsset(address asset, bool enabled, uint32 strategyId, uint16 bufferBps)
fundEscrow(address escrow, address asset, uint256 intentId, uint256 amount)
notifyRefundReceived(address escrow, address asset, uint256 intentId, uint256 amount)
depositToYield(address asset, uint256 amount)
withdrawFromYield(address asset, uint256 shares)
setYieldManager(address _yieldManager)
setOperator(address op, bool allowed)
transferOwnership(address newOwner)
```

### 3.2 Read
```
assetConfig(address) returns (bool enabled, uint32 strategyId, uint16 bufferBps)
yieldShares(address) returns (uint256)
yieldManager() returns (address)
operators(address) returns (bool)
owner() returns (address)
```

---

## 4. Events
```
AssetConfigured(address asset indexed, bool enabled, uint32 strategyId, uint16 bufferBps)
EscrowFunded(address escrow indexed, uint256 intentId indexed, address asset indexed, uint256 amount)
RefundReceived(address escrow indexed, uint256 intentId indexed, address asset indexed, uint256 amount)
TreasuryYieldDeposited(address asset indexed, uint32 strategyId, uint256 amount, uint256 shares)
TreasuryYieldWithdrawn(address asset indexed, uint32 strategyId, uint256 shares, uint256 assetsOut)
OperatorSet(address operator indexed, bool allowed)
OwnerTransferred(address oldOwner indexed, address newOwner indexed)
```

---

## 5. Errors
```
ApproveFailed()
InvalidAddress()
InvalidAmount()
InvalidState()
NotAuthorized()
```

---

## 6. How It Interacts With Other Contracts
- Funds intents in `GigPayEscrowCoreV2` through `fundEscrow`, which transfers the asset into escrow.
- Sends treasury balances into `YieldManagerV2` with `depositToYield` and receives shares in return.
- Uses `yieldManager()` to know the active yield module; changes should be coordinated with `GigPayRegistry`.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Treasury operations should be admin-only workflows.
- Before funding escrow, ensure the treasury vault has the asset balance and has approval for the escrow core.
- Show `assetConfig()` in admin UI so operators can validate `strategyId` and `bufferBps` before deposits.

### 7.2 Backend (Detailed)
- After an intent is created, call `fundEscrow(escrowCore, asset, intentId, amount)` to transfer funds into escrow.
- On refunds, call `notifyRefundReceived()` to reconcile internal accounting and match on-chain events.
- Use `configureAsset()` to set per-asset yield strategy and treasury buffer policy.
- Use `depositToYield()` to move idle treasury balances into `YieldManagerV2` and track `TreasuryYieldDeposited` events.
- Use `withdrawFromYield()` during treasury liquidity needs and reconcile `TreasuryYieldWithdrawn`.

---

## 8. Example Call Flow
```
// Fund escrow for an intent
treasuryVault.fundEscrow(escrowCore, asset, intentId, amount);
```

---

## 9. Related Docs
- `documentation/abiDocs/GigPayEscrowCoreV2.md`
- `documentation/abiDocs/YieldManagerV2.md`
