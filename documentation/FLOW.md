# GigPay – Entity-Based Payment Flows

GigPay is not “company pays freelancer”.

GigPay is an **Entity-based Treasury OS** where any entity can:
- hold funds
- issue payment intents
- receive payouts
- act as platform, agency, or vendor

---

## Core Primitive

EntityTreasuryVault → PaymentIntent (Escrow) → Settlement

---

## Actors

- Entity A: Business / Platform / DAO / Individual
- Entity B: Vendor / Creator / Contractor / Another Business
- Entity P: Platform / Marketplace (optional)
- Agent: Backend automation or smart wallet agent

---

## Flow 1 — Direct B2B / P2P Payment

### Example:
Company A pays Freelancer B.

1. Entity A treasury holds IDRX.
2. A creates PaymentIntent:
   - asset: IDRX
   - payout asset: IDRX or USDC
   - splits: B gets 100%
3. Treasury funds intent.
4. B submits work.
5. A releases.
6. If payout asset != IDRX:
   - RFQ swap executed
7. B receives funds.

---

## Flow 2 — Platform / Marketplace (B2B2C)

### Example:
Many businesses → Platform → Many creators

1. Platform runs a TreasuryVault.
2. Businesses fund platform treasury (offchain or onchain).
3. Platform issues PaymentIntents to creators.
4. Platform treasury funds each intent.
5. Creators submit work.
6. Platform releases:
   - principal split to creators
   - platform fee auto-taken
7. Creators receive funds in preferred asset.

---

## Flow 3 — Agency / Team Split

### Example:
Company → Agency → Team

1. Company issues intent to Agency entity.
2. Splits:
   - Agency 10%
   - Member A 45%
   - Member B 45%
3. Treasury funds.
4. Agency submits milestone.
5. Company releases.
6. SplitRouter distributes automatically.

---

## Flow 4 — Long Acceptance / Escrow Yield

### Example:
Legal review / milestone acceptance takes 14 days.

1. Intent has acceptanceWindow > 24h.
2. After submission:
   - Escrow deposits to yield strategy.
3. On release:
   - Escrow withdraws shares.
   - Principal + yield settled.

---

## Flow 5 — Protection + FX Risk (Thetanuts RFQ)

### Example:
Company wants downside protection or FX hedge.

1. Treasury buys protection via RFQ.
2. Policy is attached to intent.
3. On settlement:
   - OptionBook settles and pays out.
4. Payout is treated as “extra cash” in escrow.
5. On release/refund:
   - Extra is distributed by policy rules.

---

## Flow 6 — Release With Swap

### Example:
Treasury holds IDRX, vendor wants USDC.

1. Intent payout asset = USDC.
2. On release:
   - RFQ swap is attempted first.
   - If fails, fallback route is used.
3. Vendor receives USDC.

---

## Flow 7 — Refund

1. Deadline passes or dispute resolved.
2. Treasury calls refund.
3. Escrow:
   - Withdraws yield
   - Claims protection
   - Returns all to treasury.

---

## Universal Properties

- Every payment is an onchain state machine.
- Every action emits events.
- Every settlement is self-contained.
