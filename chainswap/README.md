# ChainSwap

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

This is a proof-of-concept test case showcasing some malicious transactions [that hit multiple ChainSwap contracts in July 2021](https://chain-swap.medium.com/chainswap-exploit-11-july-2021-post-mortem-6e4e346e5a32).

The test case included here (kind of) replicates a series of transactions executed by [an EOA](https://etherscan.io/address/0xeda5066780de29d00dfb54581a707ef6f52d8113) targetting the contract [`0xc5185d2c68aaa7c5f0921948f8135d01510d647f`](https://etherscan.io/address/0xc5185d2c68aaa7c5f0921948f8135d01510d647f) on Ethereum mainnet. The first of similar transactions is [`0x9c190629774f999f0b833505e35925b91330dbd5ebb5f1eba214494288919cce`](https://etherscan.io/tx/0x9c190629774f999f0b833505e35925b91330dbd5ebb5f1eba214494288919cce).

## Table of Contents

- [Install](#install)
- [Run](#run)
- [Details](#details)
- [Further reading](#further-reading)

## Install

1. Install dependencies with `yarn`
2. Rename the `.env.sample` file to `.env`, and include your API key for https://archivenode.io.

## Run

You can run the script with `node scripts/run.js`. Everything will be executed against in local testing environment, using a fork of mainnet starting at block `12801487`.

## Details

I must say that the documentation on ChainSwap is scarce, the code doesn't have docstrings, the architecture is unclear, some contracts are verified while others are not. Their [GitHub](https://github.com/chainswap/contracts) doesn't help that much either, at least at the moment of writing. So take the following with a pinch of salt, as I might not be as technically accurate as I'd like to.

As a proof of concept, this script just focuses on reproducing a malicious transaction that hit a single proxy contract deployed on Ethereum mainnet at `0xc5185d2c68aaa7c5f0921948f8135d01510d647f`. In reality the attacker actually targeted multiple contracts across different chains in quite a large number of transactions. I haven't reviewed them all, but the ones I have would all follow a similar vector to the one drafted here.

Regardless of whatever ChainSwap intends to do and its architecture, we can just focus on a couple of fundamental aspects to understand the issue.

In summary, the attacker found an execution path to steal tokens deposited in the contract (for this PoC, tokens are [FAIR](https://etherscan.io/token/0x9b20dabcec77f6289113e61893f7beefaeb1990a)).

The targetted contract has a [`receive(uint256,address,uint256,uint256,(address,uint8,bytes32,bytes32)[])` function](https://www.4byte.directory/signatures/?bytes4_signature=0xa653d60c) that (I presume) is intended for anyone to provide proof, by calling the function, that privileged "signatory" accounts have approved the release of some amount of tokens out of the contract to be sent to a specified address.

Each signatory has a quota of tokens that is authorized to release at a certain time, which is given by the `authQuotaOf(address)` getter function. There's no explicit whitelisting of signatories, and anyone can call the `receive` function. If _everything worked well_, as soon as you'd call `receive` passing signatures of a signatory that hasn't previously been authorized a quota of tokens, the call would simply revert.

But that wasn't the case.

The fundamental bug was that _any_ signatory would be assumed to start with a default, positive, quota. In the case of this PoC, we see that the default for any signatory is 1.2 M FAIR tokens. This means that any malicious actor can call the `receive` function, provide whatever valid signatures they want (just following a required format), and take out up to 1.2 M FAIR tokens in a single call. This can be repeated multiple times until the contract runs out of tokens - which is exactly what the attacker did.

In the `contracts` folder I'm including the Etherscan verified source code found at this test case target address. In there you can start following the logic of the `receive` function, down to an internal call to a `_decreaseAuthQuota` function, which in turn executes the `updateAutoQuota` modifier. In it, you will see that the `authQuotaOf` function is called for the passed `signatory` address. The logic within this function, on top of the conditional statement in the `updateAutoQuota` modifier, would cause that new signatories were always assigned a positive quota.

Careful readers may have noticed that the target's address is a proxy that delegate-calls to an implementation address, which should hold the actual logic executed. Yet above I'm referencing the code verified in the proxy, not in the implementation address. This is due to the fact that implementation address does not have verified source code, so in principle I'm assuming that the `receive` function behaves as what's verified in the proxy. In theory this should be a silly assumption, I agree. But surprisingly or not, in practice it resulted being valid, and can be used to understand the vulnerability.

It can be the case that in other targetted proxy-implementation pairs of the system both addresses have verified source code, which led the attacker to find the vulnerability and later replicate it across all proxy-implementation pairs, regardless whether they had verified code or not. Or it can be the case that the attacker made similar assumptions, and was able to successfully carry out the attacks. Who knows.

## Further reading

- [Official post-mortem](https://chain-swap.medium.com/chainswap-exploit-11-july-2021-post-mortem-6e4e346e5a32)
- [Preliminary investigation by @cmichelio](https://twitter.com/cmichelio/status/1414035468971397126)
- [Article in rekt.news](https://www.rekt.news/chainswap-rekt/)
