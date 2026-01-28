# Token + Faucet (IDRX + GigPayFaucet)

## IDRX (ERC20)

ABI file: `YieldModeABI/IDRX.abi.json`  
Address: `0x20Abd5644f1f77155c63A8818C75540F770ae223`

UI needs the standard ERC20 methods:
- `decimals()`, `name()`, `symbol()`
- `balanceOf(address)`
- `allowance(owner, spender)`
- `approve(spender, amount)`
- `transfer(to, amount)`
- `transferFrom(from, to, amount)`

Events to index:
- `Transfer`
- `Approval`

## GigPayFaucet

ABI file: `YieldModeABI/GigPayFaucet.abi.json`  
Address: `0x31d563850441a218F742237aF505fb7Fc4198bc7`

This faucet is used by **mock strategies** to simulate yield.

User-facing reads:
- `canClaim(user, token) -> bool`
- `tokenConfig(token) -> (enabled, amountPerClaim, cooldownSecs)`

User-facing write:
- `claim(token)` (transfers `amountPerClaim` to `msg.sender`)

Event to index (nice for UI):
- `Claimed(user, token, amount)`

Admin-only (not needed for dApp users):
- `setToken(token, enabled, amountPerClaim, cooldownSecs)`
- `setOperator(op, allowed)`
- `transferOwnership(newOwner)`

