GigPay Frontend Wireframe (Contract-Driven)

Legend:
- [CTA] = button
- ( ) = field
- { } = dynamic data / status

---------------------------------------------------------------------------
1) Landing / Connect
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ GigPay                                                              [⚙] │
│ ─────────────────────────────────────────────────────────────────────── │
│  Cross-border gig payments with escrow, yield, and protection           │
│                                                                         │
│  Wallet: {connectedAddress} [Connect Wallet]                            │
│  Network: {chainName}  |  Registry: {registryAddress}                   │
│                                                                         │
│  Quick actions:                                                         │
│   [Get Test Tokens]  [Create Intent]  [My Intents]  [Treasury Console]  │
└─────────────────────────────────────────────────────────────────────────┘

---------------------------------------------------------------------------
2) Faucet (GigPayFaucet)
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ Get Test Tokens                                                         │
│ ─────────────────────────────────────────────────────────────────────── │
│ Faucet: {faucetAddress}  |  Cooldown: {cooldown}                        │
│                                                                         │
│  IDRX: {balance}  [Claim IDRX]                                          │
│  USDC: {balance}  [Claim USDC]                                          │
│  USDT: {balance}  [Claim USDT]                                          │
│  DAI:  {balance}  [Claim DAI ]                                          │
│  EURC: {balance}  [Claim EURC]                                          │
│                                                                         │
│  Status: {lastClaimAt}                                                  │
└─────────────────────────────────────────────────────────────────────────┘

---------------------------------------------------------------------------
3) Create Intent (Escrow + Payout Preferences)
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ Create Payment Intent                                                   │
│ ─────────────────────────────────────────────────────────────────────── │
│  Treasury: {treasuryAddress}                                            │
│  Asset In (escrowed): (IDRX/USDC/USDT/DAI/EURC)                         │
│  Payout Asset: (IDRX/USDC/USDT/DAI/EURC)                                │
│  Amount: ( )                                                            │
│  Acceptance Window: ( ) hours                                           │
│  Deadline (optional): ( )                                               │
│                                                                         │
│  Splits (bps):                                                          │
│   - Recipient #1 (address) (bps)                                        │
│   - Recipient #2 (address) (bps)                                        │
│                                                                         │
│  Escrow Yield: ( ) enable  Strategy ID: ( )                             │
│  Route Preference: (RFQ only / Allow fallback)                          │
│                                                                         │
│  [Create Intent]                                                        │
│                                                                         │
│  Result: {intentId} {intentStatus}                                      │
└─────────────────────────────────────────────────────────────────────────┘

---------------------------------------------------------------------------
4) Intent Details (Creator View)
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ Intent #{intentId}                                                      │
│ ─────────────────────────────────────────────────────────────────────── │
│  Status: {Created | Funded | Submitted | Released | Refunded}           │
│  Asset In: {assetIn}  |  Payout Asset: {assetOut}                       │
│  Amount: {amount}                                                       │
│  Swap Required: {true/false}                                            │
│                                                                         │
│  Yield: {enabled}  | Shares: {escrowShares}                             │
│  Protection: {enabled}  | Policy: {policyId}                            │
│                                                                         │
│  [Submit Work]  (evidence hash)                                         │
│                                                                         │
│  Split Recipients:                                                      │
│   - {recipient1} {bps}                                                  │
│   - {recipient2} {bps}                                                  │
└─────────────────────────────────────────────────────────────────────────┘

---------------------------------------------------------------------------
5) Treasury Console (Funding, Release, Refund)
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ Treasury Console                                                        │
│ ─────────────────────────────────────────────────────────────────────── │
│  Treasury: {treasuryAddress}  |  Balances:                              │
│   IDRX {bal} | USDC {bal} | USDT {bal} | DAI {bal} | EURC {bal}         │
│                                                                         │
│  Intent #{intentId}                                                     │
│   Asset In: {assetIn}  Payout: {assetOut}  Amount: {amount}             │
│   Status: {status}                                                      │
│                                                                         │
│  [Fund Escrow]                                                          │
│                                                                         │
│  Release options:                                                       │
│   - If no swap: [Release]                                               │
│   - If swap:     (swapData selector) [Release With Swap]                │
│                                                                         │
│  Refund options:                                                        │
│   [Refund to Treasury]                                                  │
└─────────────────────────────────────────────────────────────────────────┘

---------------------------------------------------------------------------
6) Protection (OptionBook RFQ)
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ Protection Panel                                                        │
│ ─────────────────────────────────────────────────────────────────────── │
│  Intent #{intentId}                                                     │
│  Quote: {premium} {payout} {expiry}                                     │
│                                                                         │
│  [Buy Protection]                                                       │
│  [Settle & Claim]                                                       │
│                                                                         │
│  Status: {policyId} {settled} {claimed}                                 │
└─────────────────────────────────────────────────────────────────────────┘

---------------------------------------------------------------------------
7) Swap Monitoring (RFQ + Fallback)
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ Swap Monitor                                                            │
│ ─────────────────────────────────────────────────────────────────────── │
│  Intent #{intentId}                                                     │
│  Pair: {assetIn} -> {assetOut}                                          │
│                                                                         │
│  SwapAttempted: {txHash}                                                │
│  Venue: {OptionBook / AMM}                                              │
│  Amount In: {amountIn}  Amount Out: {amountOut}                         │
│                                                                         │
│  Events:                                                                │
│   - SwapAttempted                                                       │
│   - SwapExecuted                                                        │
│   - SwapSkipped                                                         │
└─────────────────────────────────────────────────────────────────────────┘

---------------------------------------------------------------------------
8) Admin / Registry (Owner)
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ Admin Console                                                           │
│ ─────────────────────────────────────────────────────────────────────── │
│  Registry: {registryAddress}                                            │
│   YIELD_MANAGER: {addr}                                                 │
│   SPLIT_ROUTER: {addr}                                                  │
│   OPTION_BOOK: {addr}                                                   │
│   TOKEN_REGISTRY: {addr}                                                │
│   ROUTE_REGISTRY: {addr}                                                │
│   SWAP_MANAGER: {addr}                                                  │
│                                                                         │
│  [Set Module] (key) (address)                                           │
│                                                                         │
│  Token Registry                                                         │
│   (token) (symbol) (decimals) (eligible) [Set Token]                    │
│                                                                         │
│  Swap Routes                                                            │
│   (assetIn) (assetOut) (rfqAllowed) (fallbackAllowed)                   │
│   (rfqVenue) (fallbackVenue) [Set Route]                                │
└─────────────────────────────────────────────────────────────────────────┘

---------------------------------------------------------------------------
9) Activity & Receipts
---------------------------------------------------------------------------
┌─────────────────────────────────────────────────────────────────────────┐
│ Activity                                                                │
│ ─────────────────────────────────────────────────────────────────────── │
│  IntentCreated   {txHash}                                               │
│  Funded          {txHash}                                               │
│  Submitted       {txHash}                                               │
│  ProtectionBought {txHash}                                              │
│  ProtectionClaimed {txHash}                                             │
│  SwapExecuted    {txHash}                                               │
│  Released        {txHash}                                               │
│  Refunded        {txHash}                                               │
└─────────────────────────────────────────────────────────────────────────┘
