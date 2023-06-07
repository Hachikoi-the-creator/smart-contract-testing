//SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;
error SomeCustomError(string message);

contract AlchemyFaucet {
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    function testCustom() external view {
        if (msg.sender == owner) {
            revert SomeCustomError("You cannot do this to me :c");
        }
    }

    function withdraw(uint _amount) external payable {
        // users can only withdraw .1 ETH at a time, feel free to change this!
        require(_amount <= 0.1 ether, "Too greedy, cannot do");
        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    function emptyFaucet() external onlyOwner {
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    function destroyFaucet() external onlyOwner {
        selfdestruct(payable(owner));
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    receive() external payable {}
}
