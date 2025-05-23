// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FoodNFT.sol"; // Import kontrak NFT Hamburger

contract SpecialBox is ERC721URIStorage, Ownable {
    uint256 private nextTokenId = 1;
    mapping(address => uint256) public specialBoxCount;
    FoodNFT public foodNFTContract;

    constructor(address foodNFTAddress) ERC721("SpecialBox", "SBOX") {
        foodNFTContract = FoodNFT(foodNFTAddress);
    }

    function canMintSpecialBox(address user) public view returns (bool) {
        uint256 hamburgerCount = foodNFTContract.balanceOf(user);
        uint256 eligible = hamburgerCount / 10;
        return eligible > specialBoxCount[user];
    }

    function mint() external {
        require(canMintSpecialBox(msg.sender), "Not enough hamburger NFTs to mint Special Box");
        uint256 tokenId = nextTokenId;
        ++nextTokenId;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, "https://551506431204868b983b6e282e4bdf55.ipfs.4everland.link/ipfs/bafybeihcqhiruiuhyw5po4zxhihr4n2jesynyblsdr5rlxtbfwfluem2ri");
        specialBoxCount[msg.sender] += 1;
    }

    function getSpecialBoxCount(address user) external view returns (uint256) {
        return specialBoxCount[user];
    }

    function updateTokenURI(uint256 tokenId, string memory newTokenURI) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newTokenURI);
    }
}
