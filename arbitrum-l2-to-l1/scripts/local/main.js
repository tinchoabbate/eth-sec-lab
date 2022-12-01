const assert = require("assert");
const { ethers } = require("hardhat");
const bridgeAbi = require("../../abis/bridge.json");

// Three accounts available in Hardhat's Node
const USER_KEY = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const RELAYER_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const { ARBSYS_ADDRESS, BRIDGE_ADDRESS, ROLLUP_ADDRESS } = require("../addresses");

const ETHEREUM_URL = "http://localhost:8545";
const ARBITRUM_URL = "http://localhost:8546";

async function main() {
  /* ###################### */
  /* ### ARBITRUM SETUP ### */
  /* ###################### */

  // Get provider for Arbitrum
  const arbitrumProvider = ethers.getDefaultProvider(ARBITRUM_URL);

  // Make sure script's running on local devnet
  let network = await arbitrumProvider.getNetwork();
  assert(network.chainId == 31337);

  // Instantiate two accounts for Arbitrum
  const deployerArbitrum = new ethers.Wallet(DEPLOYER_KEY, arbitrumProvider);
  const userArbitrum = new ethers.Wallet(USER_KEY, arbitrumProvider);

  // Deploy ArbSys mock, get its runtime code, set it in ARBSYS_ADDRESS
  const arbsys = await (await ethers.getContractFactory("ArbSysMock", deployerArbitrum)).deploy();
  const arbsysCode = await arbitrumProvider.getCode(arbsys.address);
  await arbitrumProvider.send("hardhat_setCode",[
    ARBSYS_ADDRESS,
    arbsysCode
  ]);

  /* ##################### */
  /* ### ETHEREUM SETUP ### */
  /* ##################### */

  const ethereumProvider = ethers.getDefaultProvider(ETHEREUM_URL);

  // Make sure script's running on local devnet
  network = await ethereumProvider.getNetwork();
  assert(network.chainId == 31337);

  const deployerEthereum = new ethers.Wallet(DEPLOYER_KEY, ethereumProvider);
  const userEthereum = new ethers.Wallet(USER_KEY, ethereumProvider);
  const relayerEthereum = new ethers.Wallet(RELAYER_KEY, ethereumProvider);

  // Deploy simplified version of `Outbox` contract
  const outbox = await (await ethers.getContractFactory("SimpleOutbox", deployerEthereum)).deploy(BRIDGE_ADDRESS);

  // We need to change the `Outbox` contract used by the `Bridge`, to use the `SimpleOutbox` instead.
  // We do this in 3 steps.

  // (1) change the rollup address in the bridge to an EOA
  await ethereumProvider.send("hardhat_setStorageAt", [
    BRIDGE_ADDRESS,
    "0x8", // rollup address is stored at slot 8
    ethers.utils.hexZeroPad(deployerEthereum.address, 32)
  ]);

  const bridge = new ethers.Contract(BRIDGE_ADDRESS, bridgeAbi, deployerEthereum);
  assert.equal(await bridge.rollup(), deployerEthereum.address);

  // (2) Using the EOA, call `Bridge::setOutbox` to change the outbox's address to the new one
  await bridge.setOutbox(outbox.address, true);
  assert(await bridge.allowedOutboxes(outbox.address), "Failed to allow outbox");

  // (3) Roll back the change in step (1)
  await ethereumProvider.send("hardhat_setStorageAt", [
    BRIDGE_ADDRESS,
    "0x8", // rollup address is stored at slot 8
    ethers.utils.hexZeroPad(ROLLUP_ADDRESS, 32)
  ]);
  assert.equal(await bridge.rollup(), ROLLUP_ADDRESS);

  // Deploy the `L1Target` contract that will receive, on L1, a message originated on L2
  const size = 1000000;
  const l1Target = await (await ethers.getContractFactory("L1Target", userEthereum)).deploy(size);

  /* ##################### */
  /* ####### RUN ######### */
  /* ##################### */

  // User submits L2-to-L1 message on Arbitrum
  let tx = await arbsys.connect(userArbitrum).sendTxToL1(l1Target.address, []);
  let receipt = await tx.wait();

  // Relayer picks up event
  assert(
    receipt.events[0].topics[0] == arbsys.interface.encodeFilterTopics("L2ToL1Tx", [])[0]
  );
  const { sender, target, data } = receipt.events[0].args;

  // Set a predictable base fee for testing purposes
  await ethereumProvider.send("hardhat_setNextBlockBaseFeePerGas", [
    "0xba43b7400", // 50 gwei
  ]);

  console.log(
    `Relayer starts with ${ethers.utils.formatEther(await ethereumProvider.getBalance(relayerEthereum.address))} ETH`
  );
  
  // Relayer executes L2-to-L1 message on L1, calling `SimpleOutbox::executeTransaction`.
  // Setting a `maxFeePerGas` somewhat above the network's base fee.
  tx = await outbox.connect(relayerEthereum).executeTransaction(
    sender,
    target,
    0, // value
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
    `Relayer now has ${ethers.utils.formatEther(await ethereumProvider.getBalance(relayerEthereum.address))} ETH`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
