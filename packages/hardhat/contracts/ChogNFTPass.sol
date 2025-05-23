// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ChogNFTPass is ERC721URIStorage, Ownable {
    using Strings for uint256;

    string public baseURI;
    uint256 private nextPassId = 1;
    bool public isPublicMintEnabled = false;

    mapping(address => bool) public whitelist;

    uint256 public wlMintPrice = 1 ether;
    uint256 public publicMintPrice = 2 ether;
    address public paymentGateway;

    constructor(string memory _baseURI, address _paymentGateway) ERC721("ChogNFTPass", "CHOG") Ownable() {
        setBaseURI(_baseURI);
        paymentGateway = _paymentGateway;
    }

    function mintPass(address to) external payable {
        if (whitelist[msg.sender]) {
            require(msg.value == wlMintPrice, "Incorrect whitelist mint price");
        } else if (isPublicMintEnabled) {
            require(msg.value == publicMintPrice, "Incorrect public mint price");
        } else {
            revert("Minting is not enabled for you");
        }

        // Call the PaymentGateway to process the payment
        (bool success, ) = address(paymentGateway).call{value: msg.value}(abi.encodeWithSignature("processPayment()"));
        require(success, "Payment to PaymentGateway failed");

        uint256 passId = nextPassId;
        ++nextPassId;
        _mint(to, passId);
        _setTokenURI(passId, string(abi.encodePacked(baseURI, passId.toString(), ".json")));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");
        return super.tokenURI(tokenId);
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function enablePublicMint() external onlyOwner {
        isPublicMintEnabled = true;
    }

    function disablePublicMint() external onlyOwner {
        isPublicMintEnabled = false;
    }

    function whitelistAddress(address _address) external onlyOwner {
        whitelist[_address] = true;
    }

    function removeAddressFromWhitelist(address _address) external onlyOwner {
        whitelist[_address] = false;
    }

    function setWlMintPrice(uint256 _newPrice) external onlyOwner {
        wlMintPrice = _newPrice;
    }

    function setPublicMintPrice(uint256 _newPrice) external onlyOwner {
        publicMintPrice = _newPrice;
    }
}
