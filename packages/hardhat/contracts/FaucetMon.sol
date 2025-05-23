// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract FaucetMon {
    address public owner;

    event BalanceFunded(address indexed funder, uint256 amount);
    event BalanceWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Function to fund the faucet balance
    function fundFaucet() external payable {
        require(msg.value > 0, "Must send some Ether to fund the faucet");
        emit BalanceFunded(msg.sender, msg.value);
    }

    // Function to withdraw the faucet balance (only owner)
    function withdrawBalance(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in the faucet");
        payable(owner).transfer(amount);
        emit BalanceWithdrawn(owner, amount);
    }

    // Allow the contract to receive Ether
    receive() external payable {}
}
