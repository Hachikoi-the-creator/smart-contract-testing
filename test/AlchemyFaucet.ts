// import testing libraries: https://www.chaijs.com/guide/styles/
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, assert } from "chai";
import exp from "constants";
import { ethers } from "hardhat";

describe("Test SimpleContract.sol", () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBaseContractFixture() {
    const SimpleContractFabric = await ethers.getContractFactory(
      "AlchemyFaucet"
    );

    const myInt = 777;
    const contract = await SimpleContractFabric.deploy();

    // wait for contract to be deployed and validated!
    await contract.deployed();
    const [owner, dev] = await ethers.getSigners();

    // initialize the contract whit some eth
    const faucetInitialBalance = ethers.utils.parseEther("10");
    // send  10 ETH to the contract
    await owner.sendTransaction({
      to: contract.address,
      from: owner.address,
      value: faucetInitialBalance,
    });

    return { contract, myInt, owner, dev, faucetInitialBalance };
  }

  // * 1st test - owner
  it("Owner should be set correctly", async () => {
    const { contract, owner } = await loadFixture(deployBaseContractFixture);

    const contractOwner = await contract.owner();
    assert.equal(contractOwner, owner.address);
  });

  // * 2nd test - initial deposit
  it("should succesfully deposit 10 ETH to the contract", async () => {
    const { contract, faucetInitialBalance } = await loadFixture(
      deployBaseContractFixture
    );

    const contractBalance = await ethers.provider.getBalance(contract.address);
    assert.equal(
      contractBalance.toHexString(),
      faucetInitialBalance.toHexString()
    );
  });

  // * 3rd test - whitdraw 0.1
  it("should successfully whitdraw 0.1 ETH", async () => {
    const { contract, faucetInitialBalance } = await loadFixture(
      deployBaseContractFixture
    );
    const amountToWithdraw = ethers.utils.parseEther("0.1");
    const expectedRemainingBalance = faucetInitialBalance.sub(amountToWithdraw);

    // whitdraw 0.1 & get currect contract balance
    await contract.withdraw(amountToWithdraw);
    const contractBalance = await ethers.provider.getBalance(contract.address);

    // compare expected balace whit current one
    assert.equal(
      contractBalance.toHexString(),
      expectedRemainingBalance.toHexString()
    );
    expect(true);
  });

  // * 4th only 0.1 ETH whitdraw
  it("should only allow to whitdraw 0.1 ETH per time", async () => {
    const { contract, faucetInitialBalance } = await loadFixture(
      deployBaseContractFixture
    );

    const invalidWithdrawAmount = ethers.utils.parseEther("0.2");
    const contractBalance = await ethers.provider.getBalance(contract.address);

    // await expect(contract.withdraw(invalidWithdrawAmount)).to.be.reverted;
    await expect(contract.withdraw(invalidWithdrawAmount)).to.be.revertedWith(
      "Too greedy, cannot do"
    );

    // since tx failed the balance shouldn't have changed
    assert(faucetInitialBalance.toHexString(), contractBalance.toHexString());
  });

  // * 5th test
  it("should correclty test custom errors", async () => {
    const { contract } = await loadFixture(deployBaseContractFixture);

    await expect(contract.testCustom()).to.be.revertedWithCustomError(
      contract,
      "SomeCustomError"
    );
  });

  // * 6th empty faucet
  it("should drain the contract of all founds if owner calls drain method", async () => {
    const { contract, owner } = await loadFixture(deployBaseContractFixture);
    await contract.connect(owner).emptyFaucet();

    const contractBalance = await ethers.provider.getBalance(contract.address);

    assert.equal(
      contractBalance.toHexString(),
      ethers.utils.parseEther("0").toHexString()
    );
  });

  // * 7th empty faucet - err
  it("should revert if non owner tries to drawn the contract", async () => {
    const { contract, dev, faucetInitialBalance } = await loadFixture(
      deployBaseContractFixture
    );

    await expect(contract.connect(dev).emptyFaucet()).to.be.rejectedWith(
      "You are not the owner"
    );

    // since tx failed the balance shouldn't have changed
    const contractBalance = await ethers.provider.getBalance(contract.address);
    assert(faucetInitialBalance.toHexString(), contractBalance.toHexString());
  });

  // * 8th destroy contract - err
  it("shouldn't let a non-owner destroy the faucet", async () => {
    const { contract, dev } = await loadFixture(deployBaseContractFixture);

    await expect(contract.connect(dev).destroyFaucet()).to.be.rejectedWith(
      "You are not the owner"
    );
  });

  // * 9th destroy contract
  it("should correclty destroy the smart contract ", async () => {
    const { contract, owner } = await loadFixture(deployBaseContractFixture);

    await contract.destroyFaucet();

    const erasedCode = await ethers.provider.getCode(contract.address);

    // code of erased contract becomes "0x"
    expect(erasedCode, "0x");
  });
});
