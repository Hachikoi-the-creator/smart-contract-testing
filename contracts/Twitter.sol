// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";

interface OldTwitter {
    function getTweet(
        uint _id
    ) external view returns (string memory, string memory, address);
}

/**
 * # Features
 * - store the tweets in a mapping of address => Tweet
 * - handle the logic for when we don't receive a pic url
 * - Tweet consist of author, message, imageUrl
 */
contract Twitter {
    Counters.Counter public tweetsCounter;
    address public immutable owner;

    // address 123 post new tweet => addressToTweets[123][addressToCounter[123]] = Tweet => addressToCounter[123]++
    mapping(address => mapping(uint => Tweet)) public addressToTweets;
    using Counters for Counters.Counter;
    mapping(address => Counters.Counter) addressToTweetId;

    struct Tweet {
        string message;
        string imageUrl;
    }

    event TweetCreated(
        address indexed tweeter,
        string tweetMsg,
        string tweetImg
    );

    constructor() {
        owner = msg.sender;
    }

    // only text
    function postTextTweet(string memory _message) external {
        uint currIndex = addressToTweetId[msg.sender].current();
        addressToTweetId[msg.sender].increment();
        addressToTweets[msg.sender][currIndex] = Tweet({
            message: _message,
            imageUrl: ""
        });

        emit TweetCreated({
            tweeter: msg.sender,
            tweetMsg: _message,
            tweetImg: "no-img"
        });
    }

    // only image
    function postImageTweet(string memory _imageUrl) external {
        uint currIndex = addressToTweetId[msg.sender].current();
        addressToTweetId[msg.sender].increment();
        addressToTweets[msg.sender][currIndex] = Tweet({
            message: "",
            imageUrl: _imageUrl
        });

        emit TweetCreated({
            tweeter: msg.sender,
            tweetMsg: "no-msg",
            tweetImg: _imageUrl
        });
    }

    // text & image
    function postHybridTweet(
        string memory _message,
        string memory _imageUrl
    ) external {
        uint currIndex = addressToTweetId[msg.sender].current();
        addressToTweetId[msg.sender].increment();
        addressToTweets[msg.sender][currIndex] = Tweet({
            message: _message,
            imageUrl: _imageUrl
        });

        emit TweetCreated({
            tweeter: msg.sender,
            tweetMsg: _message,
            tweetImg: _imageUrl
        });
    }

    // * Modifers
    modifier OnlyOwner() {
        require(msg.sender == owner, "You are not the owner!");
        _;
    }

    // * Contract migration of data available in https://mumbai.polygonscan.com/address/0x4B0a24db3a6e5F5247a7868C02230f8F1ba0c9D1
    function migrateData(address oldTwitterAdx) external OnlyOwner {
        // I personally know there's only 2 tweets, so...
        OldTwitter oldTwitterInstance = OldTwitter(oldTwitterAdx);

        for (uint8 i = 0; i < 2; i++) {
            // get tweet data
            (
                string memory twitMsg,
                string memory tweetImg,
                address sender
            ) = oldTwitterInstance.getTweet(i);

            // create a new one in this contract
            uint tweetId = addressToTweetId[sender].current();
            addressToTweetId[sender].increment();

            addressToTweets[sender][tweetId] = Tweet({
                message: twitMsg,
                imageUrl: tweetImg
            });

            emit TweetCreated({
                tweeter: sender,
                tweetMsg: twitMsg,
                tweetImg: tweetImg
            });
        }
    }
}
