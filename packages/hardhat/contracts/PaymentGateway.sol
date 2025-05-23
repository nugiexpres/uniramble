// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentGateway is Ownable {
    event PaymentReceived(address sender, uint256 amount);

    // Constructor to set the owner
    constructor() Ownable() {}

    // Function to handle payments from other contracts
    function processPayment() public payable {
        emit PaymentReceived(msg.sender, msg.value);
    }

    // Function to send ETH to an address (only callable by the owner)
    function send(address payable _to, uint256 _amount) public onlyOwner {
        require(_to != address(0), "Invalid address");
        require(_amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= _amount, "Insufficient balance");

        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH transfer failed");
    }

    // Function to withdraw all ETH to the owner (only callable by the owner)
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds available");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // Function to receive ETH from other contracts (e.g., FoodNFT)
    receive() external payable {}
}
