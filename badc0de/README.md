# Badc0de

This is an educational proof-of-concept test case showcasing a [bug in an MEV bot known as 0xbadc0de](https://rekt.news/ripmevbot/).

This is _not_ an attempt to reproduce the actual exploiting transactions ([1](https://etherscan.io/tx/0x59ddcf5ee5c687af2cbf291c3ac63bf28316a8ecbb621d9f62d07fa8a5b8ef4e), [2](https://etherscan.io/tx/0x631d206d49b930029197e5e57bbbb9a4da2eb00993560c77104cd9f4ae2d1a98)).

## Requirements

- [Foundry](https://book.getfoundry.sh/)

## Run

1. Fill the `foundry.toml` file with your preferred mainnet RPC URL to fork into your local testing environment.
2. Run test:

```
$ forge test -vvvvv
```
