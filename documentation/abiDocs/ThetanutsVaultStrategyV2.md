# ThetanutsVaultStrategyV2

## 1. Purpose
ERC4626 adapter used by `YieldManagerV2` to route escrow/treasury yield into a Thetanuts-compatible vault (or mock vault).

---

## 2. Deployment (Base Sepolia)
- Address: `0x5b33727432D8f0F280dd712e78d650411b918353`
- Explorer: https://base-sepolia.blockscout.com/address/0x5b33727432D8f0F280dd712e78d650411b918353
- ABI: `abis/ThetanutsVaultStrategyV2.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
deposit(IERC20Minimal asset, uint256 assets) returns (uint256 shares)
redeem(IERC20Minimal asset, uint256 shares) returns (uint256 assetsOut)
```

### 3.2 Read
```
vault() returns (address)
assetToken() returns (address)
totalValue(IERC20Minimal asset) returns (uint256)
```

---

## 4. Events
None.

---

## 5. Errors
```
ApproveFailed()
InvalidAddress()
InvalidAmount()
InvalidState()
TransferFailed()
TransferFromFailed()
```

---

## 6. How It Interacts With Other Contracts
- `YieldManagerV2` calls `deposit()` and `redeem()` when routing yield.
- `MockThetanutsVault` (or real vault) is the `vault()` target for ERC4626 deposits.
- `CompanyTreasuryVault` and `GigPayEscrowCoreV2` can trigger deposits/withdrawals through `YieldManagerV2`.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Most UIs interact with `YieldManagerV2` or escrow flows; direct calls to the strategy are not needed.
- If queried, `totalValue()` returns total assets for the asset token.

### 7.2 Backend (Detailed)
- Ensure `YieldManagerV2.setStrategy(strategyId, strategyAddr, true)` is set before use.
- Use the same `strategyId` in treasury config and escrow intents.

---

## 8. Example Call Flow
```
// YieldManagerV2 routes deposits to strategy
await yieldManager.depositFromTreasury(strategyId, asset, amount, treasury);
```

---

## 9. Related Docs
- `documentation/abiDocs/YieldManagerV2.md`
- `documentation/abiDocs/MockThetanutsVault.md`
