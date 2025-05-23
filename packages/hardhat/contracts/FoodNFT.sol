// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FoodNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => uint256[]) public mynfts;
    mapping(address => uint256[]) public myFoods;
    mapping(address => bool) public minted;

    address public paymentGateway;

    uint256 public constant MINT_PRICE = 1 ether; // 1 token (18 decimals)

    constructor(address _paymentGateway) ERC721("Food Scramble NFT", "FSN") {
        paymentGateway = _paymentGateway;
    }

    function mintChef(address _to, string memory _tokenURI_) public payable returns (uint256) {
        require(msg.value == 1 ether, "Mint price is 1:1");

        // Call the PaymentGateway to process the payment
        (bool success, ) = address(paymentGateway).call{value: msg.value}(abi.encodeWithSignature("processPayment()"));
        require(success, "Payment to PaymentGateway failed");

        uint256 newItemId = _tokenIds.current();
        _mint(_to, newItemId);
        _setTokenURI(newItemId, _tokenURI_);

        _tokenIds.increment();
        mynfts[_to].push(newItemId);
        minted[_to] = true;
        return newItemId;
    }

    function chefMinted(address user) external view returns (bool) {
        return minted[user];
    }

    function mintFood(address _to, string memory _tokenURI_) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _mint(_to, newItemId);
        _setTokenURI(newItemId, _tokenURI_);

        _tokenIds.increment();
        myFoods[_to].push(newItemId);
        return newItemId;
    }

    function getMyNFTs(address _owner) public view returns (uint256[] memory){
        return mynfts[_owner];
    }

    function getMyFoods(address _owner) public view returns (uint256[] memory){
        return myFoods[_owner];
    }
}