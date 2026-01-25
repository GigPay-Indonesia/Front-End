# MockThetanutsVault

## 1. Purpose
Mock ERC4626-style vault for hackathon demos. Shares are minted pro-rata and yield is simulated by donating assets to the vault to increase share price.

---

## 2. Deployment (Base Sepolia)
- Address: `0xE094ac22d29715725EB0938437d1EEF3C98388A8`
- Explorer: https://base-sepolia.blockscout.com/address/0xE094ac22d29715725EB0938437d1EEF3C98388A8
- ABI: `abis/MockThetanutsVault.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
approve(address spender, uint256 amount) returns (bool)
transfer(address to, uint256 amount) returns (bool)
transferFrom(address from, address to, uint256 amount) returns (bool)
deposit(uint256 assets, address receiver) returns (uint256 shares)
redeem(uint256 shares, address receiver, address owner) returns (uint256 assetsOut)
donate(uint256 assets)
```

### 3.2 Read
```
asset() returns (address)
assetToken() returns (address)
totalAssets() returns (uint256)
totalSupply() returns (uint256)
balanceOf(address) returns (uint256)
allowance(address, address) returns (uint256)
name() returns (string)
symbol() returns (string)
decimals() returns (uint8)
```

---

## 4. Events
```
Transfer(address from indexed, address to indexed, uint256 amount)
Approval(address owner indexed, address spender indexed, uint256 amount)
```

---

## 5. Errors
```
InvalidAddress()
InvalidAmount()
InvalidState()
NotAuthorized()
TransferFailed()
TransferFromFailed()
```

---

## 6. How It Interacts With Other Contracts
- Used by `ThetanutsVaultStrategyV2` as the ERC4626 vault target (`vault()`).
- Receives assets routed from `YieldManagerV2` via the strategy during escrow or treasury yield deposits.
- Simulated yield is created by calling `donate()` with the same ERC20 asset.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Use standard ERC4626 UX: approve asset, then call `deposit`, show shares.
- Display share value by reading `totalAssets()` / `totalSupply()`.
- `donate()` is for demo yield only and should be hidden in production UIs.

### 7.2 Backend (Detailed)
- Track share price changes to compute simulated yield.
- Treat `donate()` as an admin/test-only action.

---

## 8. Example Call Flow
```
await asset.approve(mockVault, amount);
await mockVault.deposit(amount, receiver);
```

---

## 9. Related Docs
- `documentation/abiDocs/YieldManagerV2.md`
- `documentation/abiDocs/ThetanutsVaultStrategyV2.md`
