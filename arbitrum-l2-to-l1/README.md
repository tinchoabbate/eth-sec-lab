# Unsafe Arbitrum relayer

Proof-of-concept code to showcase unsafe relaying of dangerous L2-to-L1 messages in the Arbitrum bridge that can trigger return bombs.

For more details, [read the article](https://notonlyowner.com/research/message-traps-in-the-arbitrum-bridge).

## Install

Install dependencies running `yarn` in the root directory.

## Run

**Local**

The local version uses a custom, simplified version of the Arbitrum Bridge. Useful to skip the proof validation mechanisms.

1. Fork Ethereum Goerli on `localhost:8545` with `yarn hardhat node --fork $ETHEREUM_GOERLI`.
2. Fork Arbitrum Goerli on `localhost:8546` with `yarn hardhat node --fork $ARBITRUM_GOERLI --port 8546`.
3. Run the scenario with `yarn hardhat run scripts/local/main.js`.

Depending on the returndata size you choose in the script, it can take a while to run.

If executed successfuly:

```bash
Relayer starts with 10000.0 ETH
Transaction submitting message succeeded using 24810428 gas units
Relayer spent 1.277737042 ETH in gas
Relayer now has 9998.722262958 ETH
```

**Goerli**

To ease testing, the actual relaying of the message (step 5) is not done in Goerli, but in a local fork.

Transactions are signed with the private key set in `$GOERLI_PK`. Except for the last step, where the local transaction is relayed with a sample account from Hardhat's node.

1. Get some testnet ETH on Ethereum Goerli for the account.
2. Bridge part of the ETH running `yarn hardhat run scripts/goerli/0.send-ETH-to-L2.js`.
3. Deploy the L1 target running `yarn hardhat run scripts/goerli/1.deploy-L1-target.js`.
4. Submit the L2-to-L1 message on L2 running `yarn hardhat run scripts/goerli/2.submit-L2L1-message.js`.
5. Relay the L2-to-L1 message on a local fork running `yarn hardhat run scripts/goerli/3.relay-L2L1-message.js`.

Both in (2) and (5) you can play with the size of the returned data.

## Disclaimer

The code in this repository may be vulnerable. It is a proof of concept only distributed for educational purposes.

DO NOT USE IN PRODUCTION.
