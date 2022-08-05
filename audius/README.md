# Audius

This is a proof-of-concept test case showcasing a [bug in an Audius contract](https://blog.audius.co/article/audius-governance-takeover-post-mortem-7-23-22).

This is _not_ an attempt to reproduce the actual exploiting transactions ([1](https://etherscan.io/tx/0xfefd829e246002a8fd061eede7501bccb6e244a9aacea0ebceaecef5d877a984), [2](https://etherscan.io/tx/0x4227bca8ed4b8915c7eec0e14ad3748a88c4371d4176e716e8007249b9980dc9)).

## Requirements

- [Foundry](https://book.getfoundry.sh/)

## Run

1. Fill the `script/Constants.sol` file with your preferred RPC URL to fork into your local testing environment.
2. Run script:

```
$ forge script script/Script.s.sol:RunnerScript
```

By setting the `USE_PATCHED_VERSION` flag in the `script/Script.s.sol` file to `true`, you may see how the patched version [deployed](https://etherscan.io/tx/0x13347615a94b2e3ad385277f5145102f50fe112f274b0e5300c6d8ce507eeb80) after noticing the attack would prevent exploitation.
