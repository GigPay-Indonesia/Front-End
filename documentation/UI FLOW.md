Awesome. We’ll now **rewrite the UI copy** so GigPay feels like:

> **Stripe / Brex / Wise Treasury OS — not “crypto app”**

This is **judge-ready**, **enterprise**, **Base-friendly**, and fits your current UI screens.

You can give this directly to Cursor / frontend.

---

# 🧠 Brand Voice

* Professional
* Clear
* Non-crypto
* Business-first
* No jargon (no “gas”, “tx hash”, “mint”, “redeem” in UI)

---

# 1) Global App Name & Tagline

**GigPay**

> *Programmable Treasury & Payments*

Subheader:

> Manage funds, coordinate payouts, and automate settlement — globally.

---

# 2) Sidebar Navigation Copy

Replace:

* Dashboard
* Treasury
* Payments
* Vendors
* Ledger
* Settings

With:

* **Overview**
* **Treasury**
* **Payments**
* **Entities**
* **Activity**
* **Policies**
* **Settings**

---

# 3) Overview Page

### Header

> **Overview**

Subheader:

> Your treasury and payments at a glance.

---

### Cards

**Treasury Balance**

> Funds available across all assets.

**In Yield**

> Idle funds currently earning.

**In Escrow**

> Funds reserved for ongoing payments.

**Pending Actions**

> Payments awaiting approval, release, or review.

---

# 4) Treasury Page

### Header

> **Treasury**

Subheader:

> Manage funds, liquidity, and yield.

---

### Sections

**Assets**

> Available balances by currency.

**Liquidity & Yield**

> Where your funds are allocated.

Buttons:

* **Add Funds**
* **Withdraw Funds**
* **Rebalance Treasury**

---

### Row labels

* Asset
* Available
* In Yield
* In Escrow
* Total

---

# 5) Payments Page

### Header

> **Payments**

Subheader:

> Create, track, and settle payments.

---

### Table Columns

* Payment ID
* To
* Amount
* Asset
* Status
* Protection
* Yield
* Deadline
* Actions

---

### Status Copy

* Draft → **Created**
* Locked → **Funded**
* Waiting → **Submitted**
* Done → **Released**
* Canceled → **Refunded**
* Issue → **In Dispute**

---

# 6) Create Payment Flow

### Step 1 — Recipient

> **Who are you paying?**

Field label:

> Recipient Entity

---

### Step 2 — Amount

> **How much are you paying?**

Fields:

* Amount
* Funding Asset (e.g. IDRX)
* Payout Asset (e.g. USDC)

Helper text:

> Funds will be funded from your treasury and converted if needed.

---

### Step 3 — Timing & Conditions

> **When should this be released?**

Fields:

* Acceptance deadline
* Review window

Toggles:

* **Enable Yield While Waiting**

  > Idle funds will earn yield during long review periods.

* **Enable Protection**

  > Add downside or FX protection via RFQ.

---

### Step 4 — Split (Optional)

> **How should this be split?**

> Use this to pay teams, agencies, or platforms in one payment.

---

### Step 5 — Review

> **Review and create payment**

Button:

> **Create Payment**

---

# 7) Payment Detail Page

### Header

> **Payment #12345**

Subheader:

> Track and manage this payment.

---

### Timeline

* Payment created
* Treasury funded
* Work submitted
* Yield activated
* Protection attached
* Payment released

---

### Main Actions (contextual)

* **Fund from Treasury**
* **Release Payment**
* **Refund Payment**
* **Settle Protection**

---

### Info Panels

**Payment Details**

* Recipient
* Amount
* Asset
* Status
* Deadline

**Funding Source**

> Treasury Vault

**Settlement**

* Payout asset
* Route: RFQ / Fallback

---

# 8) Entities Page (formerly Vendors)

### Header

> **Entities**

Subheader:

> Companies, vendors, creators, and partners you pay.

---

### Table

* Name
* Type
* Preferred Asset
* Risk Profile
* Total Paid

---

# 9) Policies Page

### Header

> **Policies**

Subheader:

> Automate approvals, limits, and risk rules.

---

### Examples

* Payments above $10,000 require 2 approvals
* New vendors require protection
* Long review windows enable yield automatically
* FX payments require RFQ route

---

# 10) Settings Page

Sections:

* Organization
* Team & Roles
* Treasury Settings
* Default Payment Rules
* Integrations

---

# 11) Buttons & Microcopy

Replace:

* “Submit Tx” → **Confirm**
* “Execute” → **Proceed**
* “Call Contract” → **Continue**
* “Sign” → **Approve Action**

---

# 12) Empty States

**No payments yet**

> Create your first payment to start using your treasury.

Button:

> **Create Payment**

---

# 13) Loading States

> Processing…

> Securing funds…

> Finalizing settlement…

---

# 14) Error Messages

Bad:

> Transaction reverted

Good:

> This action couldn’t be completed. Please try again or contact support.

---

# 15) Judge Demo Script (UI Language)

> “This is our treasury.
> We create a payment.
> Funds are locked.
> While waiting, they earn yield.
> We release and the vendor gets paid in USDC.
> All in one flow.”

---

# 16) If you want, next I can:

* Rewrite **landing page copy**
* Rewrite **pitch deck slide text**
* Rewrite **demo script word-by-word**

Just say:

> `next: landing + pitch + demo script`
