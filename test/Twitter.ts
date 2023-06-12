// import testing libraries: https://www.chaijs.com/guide/styles/
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

// mumbai deploy : 0x8F32f0758cd4a8A95a487aF696f8130cEE083C43
describe("Test Twitter.sol", () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function oldContractDeploymentFixture() {
    const TwitterContractFabric = await ethers.getContractFactory("Tweets");

    const contract = await TwitterContractFabric.deploy();

    // wait for contract to be deployed and validated!
    await contract.deployed();

    // since already know this contract behaves as expected...directly populate it so it's the same as the one deployed to mumbai
    const [owner, dev] = await ethers.getSigners();
    const tweetFee = ethers.utils.parseEther("0.1");
    await contract
      .connect(owner)
      .createTweet("the first tweet", "firstImage.png", { value: tweetFee });

    await contract
      .connect(dev)
      .createTweet(
        "I have found this to be pretty cool",
        "secondRndImage.png",
        { value: tweetFee }
      );

    return { contract, owner, dev };
  }

  async function twitterContractDeploymentFixture() {
    const TwitterContractFabric = await ethers.getContractFactory("Twitter");

    const contract = await TwitterContractFabric.deploy();

    // wait for contract to be deployed and validated!
    await contract.deployed();

    return { contract };
  }

  it("Owner should be set correctly", async () => {
    const { contract } = await loadFixture(twitterContractDeploymentFixture);

    const [owner /*, otherAccount*/] = await ethers.getSigners();

    const contractOwner = await contract.owner();
    assert.equal(contractOwner, owner.address);
  });

  // * POST TWITS test
  it("Text tweets should be posted correclty", async () => {
    console.log("-----------------TWEET POSTING--------------------");
    const { contract } = await loadFixture(twitterContractDeploymentFixture);
    const [owner] = await ethers.getSigners();

    const twt1 = contract.postTextTweet(
      "my first tweet in the new contract uwu"
    );
    const twt2 = contract.postTextTweet("my second tweet  owo");
    const twt3 = contract.postTextTweet("my last tweet...");
    // owner posts 3 tweets
    await Promise.all([twt1, twt2, twt3]);

    // thats how you call a public nested mapping huh~
    const res1 = contract.addressToTweets(owner.address, 0);
    const res2 = contract.addressToTweets(owner.address, 1);
    const res3 = contract.addressToTweets(owner.address, 2);

    // check that 3 tweets exist
    const tweetsArr = await Promise.all([res1, res2, res3]);
    for (let i = 0; i < tweetsArr.length; i++) {
      // first items in arr is message, second is imgUrl
      expect(!!tweetsArr[i][0].length).to.be.true;
      expect(!!tweetsArr[i][1].length).to.be.false;
    }
    // console.log(tweetsArr);
  });

  it("Image tweets should be posted correclty", async () => {
    const { contract } = await loadFixture(twitterContractDeploymentFixture);
    const [owner] = await ethers.getSigners();

    const twt1 = contract.postImageTweet("hajimmet.jpg");
    const twt2 = contract.postImageTweet("onceUpon.png");
    const twt3 = contract.postImageTweet("baka-desuwa.jpg");
    // owner posts 3 tweets
    await Promise.all([twt1, twt2, twt3]);

    // thats how you call a public nested mapping huh~
    const res1 = contract.addressToTweets(owner.address, 0);
    const res2 = contract.addressToTweets(owner.address, 1);
    const res3 = contract.addressToTweets(owner.address, 2);

    // check that 3 tweets exist
    const tweetsArr = await Promise.all([res1, res2, res3]);
    for (let i = 0; i < tweetsArr.length; i++) {
      // first items in arr is message, second is imgUrl
      expect(!!tweetsArr[i][0].length).to.be.false;
      expect(!!tweetsArr[i][1].length).to.be.true;
    }
    // console.log(tweetsArr);
  });

  it("Hybrid tweets should be posted correclty", async () => {
    const { contract } = await loadFixture(twitterContractDeploymentFixture);
    const [owner] = await ethers.getSigners();

    const twt1 = contract.postHybridTweet("text hajime", "hajimmet.jpg");
    const twt2 = contract.postHybridTweet("second text ", "onceUpon.png");
    const twt3 = contract.postHybridTweet("FINAL text ", "baka-desuwa.jpg");
    // owner posts 3 tweets
    await Promise.all([twt1, twt2, twt3]);

    // thats how you call a public nested mapping huh~
    const res1 = contract.addressToTweets(owner.address, 0);
    const res2 = contract.addressToTweets(owner.address, 1);
    const res3 = contract.addressToTweets(owner.address, 2);

    // check that 3 tweets exist
    const tweetsArr = await Promise.all([res1, res2, res3]);
    for (let i = 0; i < tweetsArr.length; i++) {
      // first items in arr is message, second is imgUrl
      expect(!!tweetsArr[i][0].length).to.be.true;
      expect(!!tweetsArr[i][1].length).to.be.true;
    }
    // console.log(tweetsArr);
  });

  // * MIGRATION TESTS
  it("should correclty import tweets data from old contract", async () => {
    console.log("-----------------MIGRATION TESTS--------------------");
    const { contract } = await loadFixture(twitterContractDeploymentFixture);
    const {
      contract: oldContract,
      owner,
      dev,
    } = await loadFixture(oldContractDeploymentFixture);
    await contract.migrateData(oldContract.address);

    // check if theres twits from these accounts

    const res = contract.addressToTweets(owner.address, 0);
    const res1 = contract.addressToTweets(dev.address, 0);
    const empty = contract.addressToTweets(owner.address, 1);
    const empty1 = contract.addressToTweets(dev.address, 1);

    const [twt1, twt2, noTwt1, noTwt2] = await Promise.all([
      res,
      res1,
      empty,
      empty1,
    ]);

    // both account must only have 1 tweet
    expect(!!twt1[0].length).to.be.true;
    expect(!!twt2[0].length).to.be.true;

    expect(!!noTwt1[0].length).to.be.false;
    expect(!!noTwt2[0].length).to.be.false;
    // console.log(twt1, twt2, noTwt1, noTwt2);
  });

  it("Should be able to post new tweets after data import", async () => {
    const { contract } = await loadFixture(twitterContractDeploymentFixture);
    const {
      contract: oldContract,
      owner,
      dev,
    } = await loadFixture(oldContractDeploymentFixture);
    // import data
    await contract.migrateData(oldContract.address);

    await contract.connect(owner).postTextTweet("owner text");
    await contract.connect(dev).postTextTweet("DEV text");

    const twt1 = await contract.addressToTweets(owner.address, 1);
    const twt2 = await contract.addressToTweets(dev.address, 1);
    expect(!!twt1[0].length).to.be.true;
    expect(!!twt2[0].length).to.be.true;
  });
});
// old contract adx: 0x4B0a24db3a6e5F5247a7868C02230f8F1ba0c9D1
// addresses that sent twits
// 0xa12AD0b358Edf4D0df7211435e4d6402ab63277F
// 0x82a6521D75879372bbe735553f7cc76cAdF54616
