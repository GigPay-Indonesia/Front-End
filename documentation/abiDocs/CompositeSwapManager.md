# CompositeSwapManager

## 1. Purpose
Unified swap manager that routes swaps to a primary RFQ venue and an optional fallback venue. It is called by the escrow core during swap-enabled releases.

---

## 2. Deployment (Base Sepolia)
- Address: `0x2b7ca209bca4E0e15140857dc6F13ca17B50F50d`
- Explorer: https://base-sepolia.blockscout.com/address/0x2b7ca209bca4E0e15140857dc6F13ca17B50F50d
- ABI: `abis/CompositeSwapManager.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
executeSwap(uint256 intentId, address assetIn, address assetOut, uint256 amountIn, bytes data) returns (uint256 amountOut, address venue)
```

### 3.2 Read
```
PRIMARY() returns (address)
FALLBACK_MANAGER() returns (address)
ESCROW_CORE() returns (address)
```

---

## 4. Events
```
CompositeSwapExecuted(uint256 intentId indexed, address venue, uint256 amountOut)
```

---

## 5. Errors
```
ApproveFailed()
InvalidAddress()
InvalidState()
NotAuthorized()
TransferFailed()
TransferFromFailed()
```

---

## 6. How It Interacts With Other Contracts
- Called by `GigPayEscrowCoreV2.releaseWithSwap` to perform the actual swap during release.
- Uses the primary RFQ manager and optional fallback manager, configured at deployment.
- Consumes route decisions coming from `SwapRouteRegistry` and user-selected `preferredRoute`.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Frontend does not call this contract directly; it calls `GigPayEscrowCoreV2.releaseWithSwap`.
- Use `SwapRouteRegistry.getRoute()` to explain which venue will be used.
- Let users choose a preferred route when a swap is required, then pass that preference into intent creation.

### 7.2 Backend (Detailed)
- Build `swapData` for the selected venue; the data is passed into `releaseWithSwap`.
- Validate that the selected venue is allowed in `SwapRouteRegistry` before submitting.
- Index `CompositeSwapExecuted` to capture `amountOut` and venue for reconciliation.
- If a swap fails due to invalid data, treat it as a failed release and retry only after rebuilding swap data.

---

## 8. Example Call Flow
```
// Escrow release with swap
escrow.releaseWithSwap(intentId, swapData);
// The escrow calls CompositeSwapManager.executeSwap under the hood.
```

---

## 9. Related Docs
- `documentation/abiDocs/GigPayEscrowCoreV2.md`
- `documentation/abiDocs/SwapRouteRegistry.md`
