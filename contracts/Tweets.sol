// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";

contract Tweets {
    using Counters for Counters.Counter;
    Counters.Counter private tweetId_;
    address public owner;

    struct tweetData {
        string tweetTxt;
        string tweetImg;
        address tweeter;
        uint id;
    }

    event TweetCreated(
        string tweetTxt,
        string tweetImg,
        address tweeter,
        uint id
    );

    mapping(uint => tweetData) TweetsMapping;

    constructor() {
        owner = msg.sender;
    }

    /**@dev Creates a new item of `TweetsMapping` */
    function createTweet(
        string memory _tweetTxt,
        string memory _tweetImg
    ) public payable {
        uint amount = msg.value;
        require(amount >= 0.1 ether, "Please send at least 0.1 Matic! unu");

        // get current id then increment the counter
        uint count = tweetId_.current();
        tweetId_.increment();

        // create a new tweet
        TweetsMapping[count] = tweetData({
            tweetTxt: _tweetTxt,
            tweetImg: _tweetImg,
            id: count,
            tweeter: msg.sender
        });

        emit TweetCreated({
            tweetTxt: _tweetTxt,
            tweetImg: _tweetImg,
            id: count,
            tweeter: msg.sender
        });

        _transferToOwner(amount);
    }

    /**@dev returns a single tweet, by id */
    function getTweet(
        uint _id
    ) public view returns (string memory, string memory, address) {
        // check if there's a tweet llinked to that _id
        require(_id < tweetId_.current(), "There's no such tweet!");

        tweetData memory TD = TweetsMapping[_id];

        return (TD.tweetTxt, TD.tweetImg, TD.tweeter);
    }

    /**@dev performs the transfer of the comision to the contract creator */
    function _transferToOwner(uint _amount) private {
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Failed to send Matic");
    }
}
