# Unsafe Arbitrum relayer

Proof-of-concept code to showcase unsafe relaying of arbitrary L2-to-L1 messages in the Arbitrum bridge.

For more details, [read the article](https://notonlyowner.com/research/).

## Install

Install dependencies running `yarn` in the root directory.

## Run

**Local**

The local version uses a custom, simplified version of the Arbitrum Bridge, to skip the proof validation mechanisms.

1. Fork Ethereum Goerli on `localhost:8545` with `yarn hardhat node --fork $ETHEREUM_GOERLI`.
2. Fork Arbitrum Goerli on `localhost:8546` with `yarn hardhat node --fork $ARBITRUM_GOERLI --port 8546`.
3. Run the scenario with `yarn hardhat run scripts/local/main.js`.

**Goerli**

Transactions are signed with the private key set in `$GOERLI_PK`. Except for the last step, where the local transaction is relayed with a sample account from Hardhat's node.

1. Get some testnet ETH on Ethereum Goerli for the account.
2. Bridge part of the ETH running `yarn hardhat run scripts/goerli/0.send-ETH-to-L2.js`.
3. Deploy the L1 target running `yarn hardhat run scripts/goerli/1.deploy-L1-target.js`.
4. Submit the L2-to-L1 message on L2 running `yarn hardhat run scripts/goerli/2.submit-L2L1-message.js`.
5. Relay the L2-to-L1 message on a local fork running `yarn hardhat run scripts/goerli/3.relay-L2L1-message.js`.

## Disclaimer

The code in this repository may be vulnerable. It is a proof of concept only distributed for educational purposes.
DO NOT USE IN PRODUCTION.
