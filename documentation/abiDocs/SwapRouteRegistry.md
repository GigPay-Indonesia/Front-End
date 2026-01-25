# SwapRouteRegistry

## 1. Purpose
Defines allowed swap routes and venues between asset pairs. It drives whether RFQ and/or fallback swap paths are permitted for a given `assetIn` and `assetOut` pair.

---

## 2. Deployment (Base Sepolia)
- Address: `0xa85D9Cf90E1b8614DEEc04A955a486D5E43c3297`
- Explorer: https://base-sepolia.blockscout.com/address/0xa85D9Cf90E1b8614DEEc04A955a486D5E43c3297
- ABI: `abis/SwapRouteRegistry.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
setRoute(address assetIn, address assetOut, bool rfqAllowed, bool fallbackAllowed, address rfqVenue, address fallbackVenue)
setOperator(address op, bool allowed)
transferOwnership(address newOwner)
```

### 3.2 Read
```
getRoute(address assetIn, address assetOut) returns (tuple { bool rfqAllowed, bool fallbackAllowed, address rfqVenue, address fallbackVenue })
operators(address) returns (bool)
owner() returns (address)
```

---

## 4. Events
```
RouteSet(address assetIn indexed, address assetOut indexed, bool rfqAllowed, bool fallbackAllowed, address rfqVenue, address fallbackVenue)
OperatorSet(address operator indexed, bool allowed)
OwnerTransferred(address oldOwner indexed, address newOwner indexed)
```

---

## 5. Errors
```
InvalidAddress()
NotAuthorized()
```

---

## 6. How It Interacts With Other Contracts
- `GigPayEscrowCoreV2` depends on swap routes when using `releaseWithSwap`.
- `CompositeSwapManager` uses the route venue addresses to decide which swap module to call.
- The registry is the contract-level source of truth for whether RFQ and fallback swap paths are allowed for a pair.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Use `getRoute(assetIn, assetOut)` when the user selects a payout asset.
- If both `rfqAllowed` and `fallbackAllowed` are false, block the swap option in UI.
- If `rfqAllowed` is true, show RFQ swap as preferred; if not, show fallback-only.

### 7.2 Backend (Detailed)
- Validate routes before constructing `swapData` or selecting a venue.
- Use `rfqVenue` and `fallbackVenue` as the on-chain venues to encode into swap data or routing metadata.
- Cache route entries and refresh on `RouteSet` events for the pairs you support.

---

## 8. Example Call Flow
```
const route = await swapRouteRegistry.getRoute(assetIn, assetOut);
if (!route.rfqAllowed && !route.fallbackAllowed) throw new Error('No swap route');
```

---

## 9. Related Docs
- `documentation/abiDocs/CompositeSwapManager.md`
- `documentation/abiDocs/GigPayRegistry.md`
