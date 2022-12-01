const assert = require("assert");
const { ethers } = require("hardhat");

/**
 * Script to deploy the `L1Target` contract on Ethereum Goerli.
 * Assumes the signer already has testnet ETH on the network.
 */
async function main() {
    const provider = ethers.getDefaultProvider(process.env.ETHEREUM_GOERLI);
    const network = await provider.getNetwork();
    assert(network.chainId == 5);
    assert(network.name == "goerli");
    
    const signer = new ethers.Wallet(process.env.GOERLI_PK, provider);

    const initialSize = 500000;
    const l1Target = await (await ethers.getContractFactory('L1Target', signer)).deploy(initialSize);
    const receipt = await l1Target.deployTransaction.wait(3);

    console.log(l1Target.address);
    console.log(receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
