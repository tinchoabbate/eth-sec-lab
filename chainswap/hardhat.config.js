require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: `https://api.archivenode.io/${process.env.ARCHIVE_NODE_KEY}`,
        blockNumber: 12801487
      }
    }
  }
};
