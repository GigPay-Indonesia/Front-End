# GigPayRegistry

## 1. Purpose
Central module registry for the GigPay protocol. It stores the current addresses for core components (token registry, route registry, swap manager, yield manager, RFQ modules) and emits events on updates.

---

## 2. Deployment (Base Sepolia)
- Address: `0x32F8dF36b1e373A9E4C6b733386509D4da535a72`
- Explorer: https://base-sepolia.blockscout.com/address/0x32F8dF36b1e373A9E4C6b733386509D4da535a72
- ABI: `abis/GigPayRegistry.abi.json`

---

## 3. Key Functions
### 3.1 Write
- Register or update a module address:
```
setModule(bytes32 key, address module)
```
- Operator and ownership administration:
```
setOperator(address op, bool allowed)
transferOwnership(address newOwner)
```

### 3.2 Read
- Resolve module addresses:
```
tokenRegistry() returns (address)
routeRegistry() returns (address)
swapManager() returns (address)
yieldManager() returns (address)
optionBook() returns (address)
optionManager() returns (address)
rfqManager() returns (address)
splitRouter() returns (address)
```
- Access control:
```
operators(address) returns (bool)
owner() returns (address)
```

---

## 4. Events
- Module changes:
```
ModuleSet(bytes32 key indexed, address module indexed)
```
- Access control updates:
```
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
- `GigPayEscrowCoreV2` references the registry address and uses it to resolve the active swap manager, token registry, and yield manager.
- `CompanyTreasuryVault` and backend services rely on registry lookups to avoid hardcoding module addresses.
- When `setModule()` is called, all integrations should treat the new module address as authoritative.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Resolve module addresses at app startup and on network change by calling the read functions above.
- Cache resolved addresses by `chainId`. On `ModuleSet`, refresh the specific module key.
- Use registry reads to drive UI toggles (for example: if `routeRegistry()` is zero or missing, hide swap UI).
- When connecting a wallet, verify the resolved address is non-zero to avoid calling a disabled module.

### 7.2 Backend (Detailed)
- Treat `GigPayRegistry` as the source of truth for module addresses; never hardcode module addresses in code.
- Index `ModuleSet` events and refresh your module-address cache when modules change.
- Use the cache to resolve addresses before constructing transactions (escrow, yield, swap).
- Admin updates (`setModule`, `setOperator`) should be gated behind secure operator key management and audit logging.

---

## 8. Example Call Flow
```
const registry = new Contract(registryAddr, GigPayRegistryAbi, provider);
const tokenRegistry = await registry.tokenRegistry();
const routeRegistry = await registry.routeRegistry();
const swapManager = await registry.swapManager();
```

---

## 9. Related Docs
- `documentation/abiDocs/gigpay.md`
- `documentation/abiDocs/TokenRegistry.md`
- `documentation/abiDocs/SwapRouteRegistry.md`
- `documentation/abiDocs/CompositeSwapManager.md`
