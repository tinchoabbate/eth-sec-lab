const assert = require("assert");
const { ethers } = require("hardhat");
const arbsysAbi = require("../../abis/arbsys.json");

const { ARBSYS_ADDRESS } = require("../addresses");
const L1_TARGET_ADDRESS = "";

/**
 * Hardhat script to submit an L2-to-L1 message with no calldata
 * to the target specified in `L1_TARGET_ADDRESS`.
 * Assumes the signer has ETH to pay for gas on Arbitrum Goerli.
 */
async function main() {
    assert(L1_TARGET_ADDRESS != "", "Must set the L1 target address");

    const provider = ethers.getDefaultProvider(process.env.ARBITRUM_GOERLI);
    const network = await provider.getNetwork();
    assert(network.chainId == 421613);
    assert(network.name == "arbitrum-goerli");
    
    const signer = new ethers.Wallet(process.env.GOERLI_PK, provider);
    const arbsys = new ethers.Contract(ARBSYS_ADDRESS, arbsysAbi, signer);

    // Calls `ArbSys::sendTxToL1` to submit an L2-to-L1 message with no calldata attached.
    // See https://github.com/OffchainLabs/nitro/blob/99ecb32f40eba6817bdf8242f3ed9cf4155747c1/contracts/src/precompiles/ArbSys.sol#L89
    const tx = await arbsys.sendTxToL1(
      L1_TARGET_ADDRESS,
      [] // data
    );
    const receipt = await tx.wait(3);

    console.log(receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
