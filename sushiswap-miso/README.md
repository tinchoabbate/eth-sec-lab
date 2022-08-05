# SushiSwap MISO

This is a proof-of-concept test case for a [bug in a SushiSwap contract disclosed by @samczsun](https://www.paradigm.xyz/2021/08/two-rights-might-make-a-wrong/).

## Install

1. Install dependencies with `yarn`
2. Rename the `.env.sample` file to `.env`, and include your API key for [Alchemy](alchemy.com).

## Run

You can run this as a [Hardhat script](https://hardhat.org/guides/scripts.html) with `yarn hardhat run scripts/run.js`.

Everything will be executed against a local testing environment, using a fork of mainnet starting at block `13038768`.

## Details

Specific details of the bug are explained by @samczsun in his article.

As of the proof-of-concept test case shown here, it basically consists of:

1. Deploying the malicious contract (see `contracts/Runner.sol`)
2. Taking a flash loan of WETH from AAVE v2, and unwrapping it to ETH
3. Calling the `batch` function of the target contract. This essentially will call the `commitEth` function multiple times, always using the same amount of ETH.
4. Receiving the refunds in the contract deployed first.
5. Wrapping the ETH to WETH, and repaying the flash loan.

## Further reading

- [Article by @samczsun](https://www.paradigm.xyz/2021/08/two-rights-might-make-a-wrong/)
- [Issue #52 in Uniswap v3: "Multicall being payable is seriously dangerous". By @Amxx](https://github.com/Uniswap/uniswap-v3-periphery/issues/52)
