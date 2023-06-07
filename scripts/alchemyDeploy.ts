import ethers from "ethers";
require("dotenv").config();
import hre from "hardhat";

async function main() {
  const url = process.env.GOERLI_URL;

  const artifacts = await hre.artifacts.readArtifact("Faucet");

  const provider = new ethers.providers.JsonRpcProvider(url);

  const privateKey = process.env.PRIVATE_KEY;

  const wallet = new ethers.Wallet(privateKey, provider);

  // Create an instance of a Faucet Factory
  const factory = new ethers.ContractFactory(
    artifacts.abi,
    artifacts.bytecode,
    wallet
  );

  const faucet = await factory.deploy();

  console.log("Faucet address:", faucet.address);

  await faucet.deployed();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
