npm install
npm run dev

# Entity-Based Architecture

## Core Modules

- EntityTreasuryVault (formerly CompanyTreasuryVault)
- GigPayEscrowCoreV2
- YieldManagerV2
- SplitRouterV2
- OptionManager + OptionBook
- TokenRegistry
- SwapRouteRegistry
- CompositeSwapManager
- GigPayRegistry (module registry)

## Two Registries

1) GigPayRegistry
- Holds module addresses (yield manager, swap, router, optionbook)

2) Entity Registry (optional future)
- Maps entityId → treasury
- Maps entityId → operators

## Capital Flow

Treasury:
- Holds funds
- May deposit idle funds into yield
- Funds escrow on demand

Escrow:
- Holds funds for one intent
- May deposit to yield during long waiting periods
- Settles itself on release/refund

## Invariants

- One principal has one yield owner at a time
- Treasury yield and escrow yield are never mixed
- Settlement is self-contained
- Protection payouts are treated as extra cash, not yield

## Integration Points

- Yield strategies via ERC4626 (Thetanuts)
- RFQ protection and swap via OptionBook
- Smart wallet orchestration via Base OnchainKit
- Backend agents via AgentKit
