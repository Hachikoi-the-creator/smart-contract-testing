import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.METAMASK_PRIVATE_KEY || "no-pk-set";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    polygonMumbai: {
      url: process.env.ALCHEMY_MUMBAI_URL || "missing-apikey",
      accounts: [privateKey],
    },
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    // npx hardhat verify --list-networks
    apiKey: {
      mainnet: process.env.ETHERSCAN_APIKEY || "missin'-apikey",
      polygonMumbai: process.env.POLYGONSCAN_APIKEY || "missin'-apikey",
    },
  },
};

export default config;
