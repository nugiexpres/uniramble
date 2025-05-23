// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFoodToken {
    function burn(address from, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

interface IFoodNFT {
    function mintFood(address to, string calldata metadata) external;
}

/// @title PrepStation - Mixes multiple ingredients into a prepared item before NFT minting
contract PrepStation {
    IFoodToken public bread;
    IFoodToken public meat;
    IFoodToken public lettuce;
    IFoodToken public tomato;
    IFoodNFT public foodNFT;

    mapping(address => uint256) public preMixes;
    event PreMixed(address indexed user, uint256 mixCount);
    event Finalized(address indexed user);

    constructor(
        address _bread,
        address _meat,
        address _lettuce,
        address _tomato,
        address _foodNFT
    ) {
        bread = IFoodToken(_bread);
        meat = IFoodToken(_meat);
        lettuce = IFoodToken(_lettuce);
        tomato = IFoodToken(_tomato);
        foodNFT = IFoodNFT(_foodNFT);
    }

    function prepareMix() external {
        require(bread.balanceOf(msg.sender) >= 1e18, "Not enough bread");
        require(meat.balanceOf(msg.sender) >= 1e18, "Not enough meat");
        require(lettuce.balanceOf(msg.sender) >= 1e18, "Not enough lettuce");
        require(tomato.balanceOf(msg.sender) >= 1e18, "Not enough tomato");

        bread.burn(msg.sender, 1e18);
        meat.burn(msg.sender, 1e18);
        lettuce.burn(msg.sender, 1e18);
        tomato.burn(msg.sender, 1e18);

        preMixes[msg.sender]++;
        emit PreMixed(msg.sender, preMixes[msg.sender]);
    }

    function finalizeDish() external {
        require(preMixes[msg.sender] > 0, "No premix to finalize");
        preMixes[msg.sender]--;
        foodNFT.mintFood(msg.sender, "pre-mixed-dish");
        emit Finalized(msg.sender);
    }
}
