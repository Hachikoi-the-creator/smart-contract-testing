//SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

contract SimpleContract {
    uint8 public universe = 10;
    address public immutable MY_ADDRESS;
    uint public immutable MY_UINT;

    constructor(uint _myUint) {
        MY_ADDRESS = msg.sender;
        MY_UINT = _myUint;
    }

    // https://news.mit.edu/2019/answer-life-universe-and-everything-sum-three-cubes-mathematics-0910
    function modifyToUniverse() public {
        universe = 42;
    }
}
