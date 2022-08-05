require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.API_KEY}`,
        blockNumber: 13038768 // at block 13038770 there's a big 4k ETH commitment
      }
    }
  },
  solidity: {
    compilers: [{ version: "0.8.4"}, { version: "0.6.12" }]
  }
};
