const assert = require("assert");
const { ethers } = require("hardhat");
const inboxAbi = require("../../abis/inbox.json");

const { INBOX_ADDRESS } = require("../addresses");
const ETH_TO_SEND = ethers.utils.parseEther('0.09');

/**
 * Hardhat script to move testnet ETH to Arbitrum's L2
 * Assumes the signer already has testnet ETH on Ethereum Goerli.
 */
async function main() {
    const provider = ethers.getDefaultProvider(process.env.ETHEREUM_GOERLI);
    const network = await provider.getNetwork();

    assert(network.chainId == 5);
    assert(network.name == "goerli");

    const signer = new ethers.Wallet(process.env.GOERLI_PK, provider);
    const inbox = new ethers.Contract(INBOX_ADDRESS, inboxAbi, signer);

    // Calling `Inbox::depositEth` to send `ETH_TO_SEND` to L2
    // See https://github.com/OffchainLabs/nitro/blob/99ecb32f40eba6817bdf8242f3ed9cf4155747c1/contracts/src/bridge/Inbox.sol#L342
    let tx = await inbox["depositEth()"]({ value: ETH_TO_SEND });
    let receipt = await tx.wait(3);
    
    console.log(receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
