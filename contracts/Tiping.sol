// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Tiping {
    address public immutable owner;
    address public immutable charity;

    constructor(address _charity) {
        owner = msg.sender;
        charity = _charity;
    }

    function tip() public payable {
        (bool success, ) = owner.call{value: msg.value}("");
        require(success, "tipping failed");
    }

    function donate() public payable {
        uint amount = address(this).balance;
        (bool success, ) = charity.call{value: amount}("");
        require(success, "Donation failed");

        selfdestruct(payable(charity));
    }

    receive() external payable {}
}
