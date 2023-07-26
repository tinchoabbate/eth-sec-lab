# Euler Exploit PoC on USDC

This is an educational proof-of-concept for the [vulnerability in a Euler contract](https://medium.com/@omniscia.io/euler-finance-incident-post-mortem-1ce077c28454).

This folder contains a simplified version of the [full PoC by @iphelix](https://github.com/iphelix/euler-exploit-poc), only targetting USDC. All credit goes to him - I just simplified the original code to make it easier to understand for one case.

The code is using Immunefi's [Forge PoC Templates](https://github.com/immunefi-team/forge-poc-templates).

## Requirements

- [Foundry](https://book.getfoundry.sh)

## Run

Run test as follows:

```
$ forge test --match-path test/pocs/EulerHackUSDC.t.sol -vvv
```
