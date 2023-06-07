// import testing libraries: https://www.chaijs.com/guide/styles/
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("Test SimpleContract.sol", () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBaseContractFixture() {
    const SimpleContractFabric = await ethers.getContractFactory(
      "SimpleContract"
    );

    const myInt = 777;
    const contract = await SimpleContractFabric.deploy(myInt);

    // wait for contract to be deployed and validated!
    await contract.deployed();

    return { contract, myInt };
  }

  it("should change `num` to 42", async () => {
    const { contract } = await loadFixture(deployBaseContractFixture);
    await contract.modifyToUniverse();

    const newUINT = await contract.universe();
    // assert.equal(newUINT.toNumber(), 42);// bigInteger case
    assert.equal(newUINT, 42);
  });

  it("Owner should be set correctly", async () => {
    const { contract } = await loadFixture(deployBaseContractFixture);

    const [owner /*, otherAccount*/] = await ethers.getSigners();

    const contractOwner = await contract.MY_ADDRESS();
    assert.equal(contractOwner, owner.address);
  });
});
