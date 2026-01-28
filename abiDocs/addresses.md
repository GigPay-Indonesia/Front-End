# Addresses (Base Sepolia — YieldMode demo)

All addresses are sourced from [`YieldModeABI/manifest.json`](../YieldModeABI/manifest.json).

## Core

- **Vault Proxy (use this address in the dApp)**: `0xCFB357fae5e5034cCfA0649b711a2897e685D14a`
- **Vault Implementation (for verification/debugging)**: `0xEE3D9b2Aa9B91215C75Bfc29Cd006F626Cdcf574`
- **Yield Oracle**: `0x826bFa587332002f35fd0240285dEd6C134E95dB`

## Asset + faucet

- **IDRX (ERC20)**: `0x20Abd5644f1f77155c63A8818C75540F770ae223`
- **GigPay Faucet**: `0x31d563850441a218F742237aF505fb7Fc4198bc7`

## Strategies (10)

All strategies share the same callable surface (see [`contracts/Strategies.md`](./contracts/Strategies.md)).

0. `0x69d8caA25f9708fBee51656e9d08F78c6EcB8db8` — MockStrategyAaveV3_IDRX_WETH
1. `0xdfdD73aFeb38e5BF907ab9c4D2B003CB56634c80` — MockStrategyMorpho_IDRX_USDC
2. `0x2C9121FdB898F6c969ACb7d937fea6e087777FC9` — MockStrategyPendle_IDRX_WETH
3. `0x9Ab63B991Dc8B245345B6755d2C3173D114501d8` — MockStrategyCurve_IDRX_USDT
4. `0x0411b05c2B736e6E2E2237F6161f1a41E32dE4cf` — MockStrategyUniswapV3_IDRX_WETH
5. `0x17A9DBDfC5442fBee43d71595a3242a76F6D289c` — MockStrategyBalancer_IDRX_WETH
6. `0x918ddc8a52F39de5eAd118F1Dc9c1BdB6db3E2a1` — MockStrategyCompound_IDRX_USDC
7. `0xc0Fc7dd76848211Bd5AC45146228b733A758D5e9` — MockStrategyEthena_IDRX_USDC
8. `0x5cb1744b47BedE935d4EB7D5264D8788b7256fC7` — MockStrategyLido_IDRX_WETH
9. `0xD719f804691581938e45E0eAFf82c3c3b195f3cA` — MockStrategyGMX_IDRX_WETH

