# GigPay – Base Sepolia Deployment (Live Onchain)

**Network:** Base Sepolia  
**Chain ID:** 84532

**Explorers:**

- BaseScan: https://sepolia.basescan.org
- Blockscout: https://base-sepolia.blockscout.com

Deployment via Foundry:

```
script/DeployAll.s.sol
```

---

# Core Contracts

## Registry

**Address:**  
`0x32F8dF36b1e373A9E4C6b733386509D4da535a72`

- BaseScan:  
  https://sepolia.basescan.org/address/0x32F8dF36b1e373A9E4C6b733386509D4da535a72
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x32F8dF36b1e373A9E4C6b733386509D4da535a72

---

## Escrow Core

**Address:**  
`0xd09177C97978f5c970ad25294681F5A51685c214`

- BaseScan:  
  https://sepolia.basescan.org/address/0xd09177C97978f5c970ad25294681F5A51685c214
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0xd09177C97978f5c970ad25294681F5A51685c214

---

## Treasury Vault

**Address:**  
`0xcDfd5B882e8dF41b3EFc1897dAf759a10a7457B8`

- BaseScan:  
  https://sepolia.basescan.org/address/0xcDfd5B882e8dF41b3EFc1897dAf759a10a7457B8
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0xcDfd5B882e8dF41b3EFc1897dAf759a10a7457B8

---

## Yield Manager

**Address:**  
`0x22c94123e60fA65D742a5872a45733154834E4b0`

- BaseScan:  
  https://sepolia.basescan.org/address/0x22c94123e60fA65D742a5872a45733154834E4b0
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x22c94123e60fA65D742a5872a45733154834E4b0

---

## Token Registry

**Address:**  
`0x3Ded1e4958315Dbfa44ffE38B763De5b17690C57`

- BaseScan:  
  https://sepolia.basescan.org/address/0x3Ded1e4958315Dbfa44ffE38B763De5b17690C57
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x3Ded1e4958315Dbfa44ffE38B763De5b17690C57

---

## Route Registry

**Address:**  
`0xa85D9Cf90E1b8614DEEc04A955a486D5E43c3297`

- BaseScan:  
  https://sepolia.basescan.org/address/0xa85D9Cf90E1b8614DEEc04A955a486D5E43c3297
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0xa85D9Cf90E1b8614DEEc04A955a486D5E43c3297

---

## Swap Manager (Composite)

**Address:**  
`0x2b7ca209bca4E0e15140857dc6F13ca17B50F50d`

- BaseScan:  
  https://sepolia.basescan.org/address/0x2b7ca209bca4E0e15140857dc6F13ca17B50F50d
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x2b7ca209bca4E0e15140857dc6F13ca17B50F50d

---

# RFQ Mock Stack (DeployRfqMockWire.s.sol)

Script ran successfully.

== Logs ==
- MockOptionBook: `0x2F739e75b5e2fB7395679ceA57022fD4C1fc3008`
- OptionBookRFQSwapManager: `0xa41BAa45D90bb1bd87Bc594068175cA8dA0eb1C1`
- FallbackSwapManager: `0x53675a45847Dd35dE11af4ab5241814a87409714`
- CompositeSwapManager: `0xDE658e88D8E4A6D3C43d651f7848af4A30eDD3eE`

Blockscout links:
- MockOptionBook: https://base-sepolia.blockscout.com/address/0x2F739e75b5e2fB7395679ceA57022fD4C1fc3008
- OptionBookRFQSwapManager: https://base-sepolia.blockscout.com/address/0xa41BAa45D90bb1bd87Bc594068175cA8dA0eb1C1
- FallbackSwapManager: https://base-sepolia.blockscout.com/address/0x53675a45847Dd35dE11af4ab5241814a87409714
- CompositeSwapManager (updated): https://base-sepolia.blockscout.com/address/0xDE658e88D8E4A6D3C43d651f7848af4A30eDD3eE

Simulated On-chain Traces:
- Setting up 1 EVM.

---

# Thetanuts Mock Vault + Strategy

## MockThetanutsVault (ERC4626)

**Address:**  
`0xE094ac22d29715725EB0938437d1EEF3C98388A8`

- BaseScan:  
  https://sepolia.basescan.org/address/0xE094ac22d29715725EB0938437d1EEF3C98388A8
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0xE094ac22d29715725EB0938437d1EEF3C98388A8

## ThetanutsVaultStrategyV2

**Address:**  
`0x5b33727432D8f0F280dd712e78d650411b918353`

- BaseScan:  
  https://sepolia.basescan.org/address/0x5b33727432D8f0F280dd712e78d650411b918353
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x5b33727432D8f0F280dd712e78d650411b918353

---

# Mock Tokens (Test Stablecoins)

## Mock IDRX

`0x20Abd5644f1f77155c63A8818C75540F770ae223`

- BaseScan:  
  https://sepolia.basescan.org/address/0x20Abd5644f1f77155c63A8818C75540F770ae223
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x20Abd5644f1f77155c63A8818C75540F770ae223

## Mock USDC

`0x44E7c97Ee6EC2B25145Acf350DBBf636615e198d`

- BaseScan:  
  https://sepolia.basescan.org/address/0x44E7c97Ee6EC2B25145Acf350DBBf636615e198d
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x44E7c97Ee6EC2B25145Acf350DBBf636615e198d

## Mock USDT

`0xDbb4DEfa899F25Fd1727D55cfb66F6EB0C378893`

- BaseScan:  
  https://sepolia.basescan.org/address/0xDbb4DEfa899F25Fd1727D55cfb66F6EB0C378893
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0xDbb4DEfa899F25Fd1727D55cfb66F6EB0C378893

## Mock DAI

`0x029a0241F596B9728c201a58CD9aa9Db5d3ac533`

- BaseScan:  
  https://sepolia.basescan.org/address/0x029a0241F596B9728c201a58CD9aa9Db5d3ac533
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x029a0241F596B9728c201a58CD9aa9Db5d3ac533

## Mock EURC

`0xE9b7236DF6610C1A694955fFe13ca65970183961`

- BaseScan:  
  https://sepolia.basescan.org/address/0xE9b7236DF6610C1A694955fFe13ca65970183961
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0xE9b7236DF6610C1A694955fFe13ca65970183961

---

# Public Faucet

## GigPay Faucet

**Address:**  
`0x31d563850441a218F742237aF505fb7Fc4198bc7`

- BaseScan:  
  https://sepolia.basescan.org/address/0x31d563850441a218F742237aF505fb7Fc4198bc7
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0x31d563850441a218F742237aF505fb7Fc4198bc7

**Pre-funded:**

- IDRX: 1,000,000
- USDC: 1,000,000
- USDT: 1,000,000
- DAI: 1,000,000
- EURC: 1,000,000

---

# Deployer Wallet (All TXs)

`0xbeaA395506D02d20749d8E39ddb996ACe1C85Bfc`

- BaseScan:  
  https://sepolia.basescan.org/address/0xbeaA395506D02d20749d8E39ddb996ACe1C85Bfc
- Blockscout:  
  https://base-sepolia.blockscout.com/address/0xbeaA395506D02d20749d8E39ddb996ACe1C85Bfc

---

# Kenapa ini kuat buat hackathon

- BaseScan = credibility view (verified or verified-ready).
- Blockscout = inspect langsung walau belum verified.
- Juri bisa audit semua kontrak dan faucet live.

