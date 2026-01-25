# TokenRegistry

## 1. Purpose
Registry of tokens that are eligible for escrow and swap flows. Stores token metadata (symbol, decimals) and an escrow eligibility flag used by other components.

---

## 2. Deployment (Base Sepolia)
- Address: `0x3Ded1e4958315Dbfa44ffE38B763De5b17690C57`
- Explorer: https://base-sepolia.blockscout.com/address/0x3Ded1e4958315Dbfa44ffE38B763De5b17690C57
- ABI: `abis/TokenRegistry.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
setToken(address token, bytes32 symbol, uint8 decimals, bool escrowEligible)
setOperator(address op, bool allowed)
transferOwnership(address newOwner)
```

### 3.2 Read
```
tokenConfig(address token) returns (tuple { bytes32 symbol, uint8 decimals, bool escrowEligible })
tokenBySymbol(bytes32) returns (address)
isEscrowEligible(address token) returns (bool)
operators(address) returns (bool)
owner() returns (address)
```

---

## 4. Events
```
TokenSet(address token indexed, bytes32 symbol indexed, uint8 decimals, bool escrowEligible)
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
- `GigPayEscrowCoreV2` uses token eligibility to determine which assets can be escrowed.
- `SwapRouteRegistry` and swap managers assume `assetIn` and `assetOut` are recognized tokens.
- Frontend and backend both rely on token metadata (`symbol`, `decimals`) for user display and amount normalization.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Call `tokenConfig()` to display token symbol/decimals in UI and to compute display amounts.
- Call `isEscrowEligible()` before letting a user select an asset for intent creation.
- Watch `TokenSet` events to update available tokens and eligibility without a full refresh.

### 7.2 Backend (Detailed)
- Validate escrow assets with `isEscrowEligible()` before sending `createIntentFromTreasury`.
- Cache token metadata and eligibility in your DB and refresh when `TokenSet` is emitted.
- For payout flows, verify both `asset` and `payoutAsset` are recognized and escrow-eligible where required.

---

## 8. Example Call Flow
```
const registry = new Contract(tokenRegistryAddr, TokenRegistryAbi, provider);
const config = await registry.tokenConfig(tokenAddress);
if (!config.escrowEligible) throw new Error('Token not escrow eligible');
```

---

## 9. Related Docs
- `documentation/abiDocs/GigPayRegistry.md`
- `documentation/abiDocs/GigPayEscrowCoreV2.md`
