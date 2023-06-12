// https://hardhat.org/hardhat-runner/docs/guides/deploying#deploying-your-contracts
import { ethers } from "hardhat";

async function main() {
  const contractName = "Twitter";
  // const lockedAmount = ethers.utils.parseEther("0.001");
  const ContractFactory = await ethers.getContractFactory(contractName);
  // example of contract whit params (constructors + needs money)
  // await ContractFactory.deploy(unlockTime, { value: lockedAmount });
  const contract = await ContractFactory.deploy();

  await contract.deployed();

  console.log(`Contract ${contractName} deployed to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
