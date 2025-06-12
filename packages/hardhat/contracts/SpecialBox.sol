// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SpecialBox is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _boxTokenIds;

    string public boxURI;

    mapping(address => uint256) public specialBoxBalances;
    mapping(address => uint256) public totalBoxBurned;
    mapping(address => address) public tbaList;

    mapping(address => mapping(string => bool)) public hasRedeemedReward;
    mapping(address => string[]) public userRewardNames;
    mapping(string => uint256) public specialBoxRewardCost;

    event SpecialBoxMinted(address indexed to, uint256 tokenId);
    event SpecialBoxRedeemed(address indexed user, address indexed target, string rewardName);

    constructor(string memory _boxURI) ERC721("Special Box", "SBOX") {
        boxURI = _boxURI;
    }

    /// @notice Set TBA address for a user (only owner)
    function setTBAForUser(address user, address tba) external onlyOwner {
        tbaList[user] = tba;
    }

    /// @notice Update base boxURI (IPFS prefix) if needed
    function setBoxURI(string memory _boxURI) external onlyOwner {
        boxURI = _boxURI;
    }

    /// @notice Mint Special Box NFT to TBA — caller should be game logic contract
    function mintSpecialBox(address to) external returns (uint256) {
        uint256 tokenId = _boxTokenIds.current();
        _mint(to, tokenId);

        string memory fullURI = string(abi.encodePacked(boxURI, _uint2str(tokenId)));
        _setTokenURI(tokenId, fullURI);

        _boxTokenIds.increment();
        specialBoxBalances[to] += 1;

        emit SpecialBoxMinted(to, tokenId);
        return tokenId;
    }

    /// @notice Configure box cost for a reward (only owner)
    function setSpecialBoxRewardCost(string memory rewardName, uint256 boxRequired) external onlyOwner {
        specialBoxRewardCost[rewardName] = boxRequired;
    }

    /// @notice Redeem special boxes for a reward via external call (e.g., NFT, role, access)
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

    /// @notice Get Special Box balance of a user
    function getUserSpecialBoxBalance(address user) external view returns (uint256) {
        return specialBoxBalances[tbaList[user]];
    }

    /// @dev Internal utility to convert uint to string
    function _uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
}
