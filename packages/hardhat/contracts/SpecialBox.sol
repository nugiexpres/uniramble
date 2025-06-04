// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SpecialBox is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _boxTokenIds;

    mapping(address => uint256) public specialBoxBalances;       // track SpecialBox owned per TBA
    mapping(address => uint256) public totalBoxBurned;           // track burned count per TBA
    mapping(address => address) public tbaList;                  // user => TBA

    mapping(address => mapping(string => bool)) public hasRedeemedReward;
    mapping(address => string[]) public userRewardNames;
    mapping(string => uint256) public specialBoxRewardCost;

    event SpecialBoxMinted(address indexed to, uint256 tokenId);
    event SpecialBoxRedeemed(address indexed user, address indexed target, string rewardName);

    constructor() ERC721("Special Box", "SBOX") {}

    /// @notice Set TBA address for a user (only owner)
    function setTBAForUser(address user, address tba) external onlyOwner {
        tbaList[user] = tba;
    }

    /// @notice Mint Special Box NFT — can be called by anyone (e.g., FoodScramble)
    function mintSpecialBox(address to, string memory tokenURI) external returns (uint256) {
        // Optional: add require caller check if needed, or leave open for FoodScramble to call

        uint256 tokenId = _boxTokenIds.current();
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _boxTokenIds.increment();

        specialBoxBalances[to] += 1;
        emit SpecialBoxMinted(to, tokenId);
        return tokenId;
    }

    /// @notice Configure box cost for a reward (only owner)
    function setSpecialBoxRewardCost(string memory rewardName, uint256 boxRequired) external onlyOwner {
        specialBoxRewardCost[rewardName] = boxRequired;
    }

    /// @notice Redeem special boxes for rewards
    function redeemSpecialBoxForReward(
        address target,
        bytes calldata callData,
        string memory rewardName
    ) external {
        address tba = tbaList[msg.sender];
        require(tba != address(0), "TBA not set");

        uint256 cost = specialBoxRewardCost[rewardName];
        require(cost > 0, "Reward not configured");
        require(specialBoxBalances[tba] >= cost, "Insufficient Special Boxes");
        require(!hasRedeemedReward[msg.sender][rewardName], "Reward already redeemed");

        specialBoxBalances[tba] -= cost;
        totalBoxBurned[tba] += cost;

        (bool success, ) = target.call(callData);
        require(success, "External call failed");

        hasRedeemedReward[msg.sender][rewardName] = true;
        userRewardNames[msg.sender].push(rewardName);

        emit SpecialBoxRedeemed(msg.sender, target, rewardName);
    }

    /// @notice Get TBA address for user
    function getUserTBA(address user) external view returns (address) {
        return tbaList[user];
    }

    /// @notice Get user Special Box balance
    function getUserSpecialBoxBalance(address user) external view returns (uint256) {
        return specialBoxBalances[tbaList[user]];
    }
}
