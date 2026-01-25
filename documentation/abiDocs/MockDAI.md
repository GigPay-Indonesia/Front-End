# MockDAI

## 1. Purpose
Testnet ERC20 token used for local/testing flows (DAI-like). Supports minting for operators and standard ERC20 transfers.

---

## 2. Deployment (Base Sepolia)
- Address: `0x029a0241F596B9728c201a58CD9aa9Db5d3ac533`
- Explorer: https://base-sepolia.blockscout.com/address/0x029a0241F596B9728c201a58CD9aa9Db5d3ac533
- ABI: `abis/MockDAI.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
approve(address spender, uint256 amount) returns (bool)
transfer(address to, uint256 amount) returns (bool)
transferFrom(address from, address to, uint256 amount) returns (bool)
mint(address to, uint256 amount)
```

### 3.2 Read
```
name() returns (string)
symbol() returns (string)
decimals() returns (uint8)
totalSupply() returns (uint256)
balanceOf(address) returns (uint256)
allowance(address, address) returns (uint256)
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
NotAuthorized()
```

---

## 6. How It Interacts With Other Contracts
- Used as an escrow asset in `GigPayEscrowCoreV2` when intents are created with this token.
- May be distributed to users via `GigPayFaucet` for testnet funding.
- Can be listed in `TokenRegistry` to mark escrow eligibility and decimals.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Use standard ERC20 flows: `approve` then `createIntentFromTreasury` or funding calls.
- Display balances with `decimals()` and `symbol()` to avoid mis-scaling amounts.
- For test funds, call `GigPayFaucet.claim()` if the faucet is enabled for this token.

### 7.2 Backend (Detailed)
- Treat as a normal ERC20 for accounting and reconciliation.
- Use `TokenRegistry.tokenConfig()` to validate decimals/eligibility before creating intents.
- Minting is operator-restricted; only use `mint()` in controlled test or admin contexts.

---

## 8. Example Call Flow
```
await mockDai.approve(escrowCore, amount);
```

---

## 9. Related Docs
- `documentation/abiDocs/GigPayFaucet.md`
