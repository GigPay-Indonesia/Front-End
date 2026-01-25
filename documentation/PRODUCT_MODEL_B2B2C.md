# GigPay Product Model: Entity-Based B2B2C Payments

GigPay is not "company pays freelancer".

GigPay is an **Entity-based Treasury and Payment OS**.

## Entities

An Entity can be:
- a company
- a freelancer
- an agency
- a marketplace/platform
- a DAO or community treasury
- a payroll or PSP operator

Each Entity can have:
- its own Treasury Vault
- operators/approvers
- policies and limits

## Roles (per payment)

Each payment intent dynamically assigns:
- Payer Entity
- Payee Entity
- Platform Entity (optional, for B2B2C)
- Operators / Agents

Any Entity can be payer in one flow and payee in another.

## Core primitive

EntityTreasuryVault → PaymentIntent (Escrow) → Settlement

## B2B2C Model (Main Story)

Example: Marketplace or Platform

1) Many businesses fund the platform (or sub-treasuries).
2) Platform issues many PaymentIntents to creators/vendors.
3) Platform enforces:
   - approval rules
   - routing rules (swap, RFQ)
   - protection
   - timing
4) Payees receive funds in their preferred asset.

## Example Flows

### Flow A — Direct B2B / P2P
Entity A pays Entity B using escrow + optional yield + optional RFQ.

### Flow B — Platform Payouts (B2B2C)
Many businesses → Platform Treasury → Many creators.

### Flow C — Agency / Team Split
Company → Agency → auto-split to team members.

### Flow D — Payroll / Recurring
Treasury schedules intents weekly/monthly. Agent executes automatically.

## Business Model

- SaaS fee per treasury
- Fee per payout
- FX / RFQ spread
- Yield sharing
- Protection / insurance margin

