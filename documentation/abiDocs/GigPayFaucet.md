# GigPayFaucet

## 1. Purpose
Testnet faucet for distributing mock tokens to users. It enforces per-token cooldowns and claim amounts.

---

## 2. Deployment (Base Sepolia)
- Address: `0x31d563850441a218F742237aF505fb7Fc4198bc7`
- Explorer: https://base-sepolia.blockscout.com/address/0x31d563850441a218F742237aF505fb7Fc4198bc7
- ABI: `abis/GigPayFaucet.abi.json`

---

## 3. Key Functions
### 3.1 Write
```
claim(address token)
setToken(address token, bool enabled, uint96 amountPerClaim, uint32 cooldownSecs)
setOperator(address op, bool allowed)
transferOwnership(address newOwner)
```

### 3.2 Read
```
canClaim(address user, address token) returns (bool)
lastClaimAt(address user, address token) returns (uint256)
tokenConfig(address) returns (bool enabled, uint96 amountPerClaim, uint32 cooldownSecs)
operators(address) returns (bool)
owner() returns (address)
```

---

## 4. Events
```
Claimed(address user indexed, address token indexed, uint96 amount)
TokenConfigured(address token indexed, bool enabled, uint96 amountPerClaim, uint32 cooldownSecs)
OperatorSet(address operator indexed, bool allowed)
OwnerTransferred(address oldOwner indexed, address newOwner indexed)
```

---

## 5. Errors
```
InvalidAddress()
InvalidAmount()
InvalidState()
NotAuthorized()
TransferFailed()
```

---

## 6. How It Interacts With Other Contracts
- Transfers mock ERC20 tokens (`MockUSDC`, `MockUSDT`, `MockDAI`, `MockEURC`, `MockIDRX`) to users on successful claim.
- Uses per-token configuration (enabled flag, amount per claim, cooldown) set by operators.

---

## 7. Integration Notes
### 7.1 Frontend (Detailed)
- Call `tokenConfig(token)` to show claim amount and cooldown for each token.
- Use `canClaim(user, token)` to disable the claim button until the cooldown expires.
- On claim success, refresh token balances using the token ERC20 `balanceOf`.

### 7.2 Backend (Detailed)
- Not required for core flows; use only for testnet UX and monitoring.
- Index `Claimed` events if you need usage analytics or rate limiting beyond the contract.
- Ensure faucet is funded with mock tokens before onboarding new testers.

---

## 8. Example Call Flow
```
if (await faucet.canClaim(user, token)) {
  await faucet.claim(token);
}
```

---

## 9. Related Docs
- `documentation/abiDocs/MockUSDC.md`
- `documentation/abiDocs/MockUSDT.md`
- `documentation/abiDocs/MockDAI.md`
- `documentation/abiDocs/MockEURC.md`
- `documentation/abiDocs/MockIDRX.md`
