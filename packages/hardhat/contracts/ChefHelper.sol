// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title ChefHelper - Helper contract for backend logic and utility for chef characters
contract ChefHelper {
    struct Chef {
        uint256 experience;
        uint256 lastCookTimestamp;
        bool isActive;
    }

    mapping(address => Chef) public chefs;

    event ChefRegistered(address indexed user);
    event DishCooked(address indexed chef, uint256 timestamp);

    function registerChef() external {
        require(!chefs[msg.sender].isActive, "Already registered");
        chefs[msg.sender] = Chef(0, block.timestamp, true);
        emit ChefRegistered(msg.sender);
    }

    function cookDish() external {
        Chef storage chef = chefs[msg.sender];
        require(chef.isActive, "Not registered");
        require(block.timestamp - chef.lastCookTimestamp > 1 hours, "Cooldown active");

        chef.lastCookTimestamp = block.timestamp;
        chef.experience += 10;

        emit DishCooked(msg.sender, block.timestamp);
    }

    function getChef(address user) external view returns (Chef memory) {
        return chefs[user];
    }

    function estimateSkill(address playerAddr) public pure returns (uint256) {
        // Example implementation: calculate skill based on some logic
        // Replace this with your actual logic
        return uint256(uint160(playerAddr)) % 100; // Dummy skill calculation
    }
}
