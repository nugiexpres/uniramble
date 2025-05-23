// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title KitchenTools - ERC721 NFT representing special kitchen equipment
contract KitchenTools is ERC721Enumerable, Ownable {
    uint256 public nextToolId;
    mapping(uint256 => string) public toolType;

    event ToolMinted(address indexed to, uint256 indexed toolId, string tool);

    constructor() ERC721("KitchenTools", "TOOL") {}

    function mintTool(address to, string calldata _type) external onlyOwner {
        uint256 toolId = nextToolId++;
        _safeMint(to, toolId);
        toolType[toolId] = _type;
        emit ToolMinted(to, toolId, _type);
    }

    function getToolType(uint256 toolId) external view returns (string memory) {
        return toolType[toolId];
    }

    function totalToolsMinted() external view returns (uint256) {
        return nextToolId;
    }
}
