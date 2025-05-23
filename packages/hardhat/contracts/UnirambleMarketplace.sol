// SPDX-License-Identifier: MIT
// @author zknugiex0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UnirambleMarketplace is Ownable {
    struct Bid {
        address bidder;
        uint256 amount;
    }

    struct Ask {
        address seller;
        uint256 price;
    }

    mapping(uint256 => Bid) public bids; // Track bids for each token
    mapping(uint256 => Ask) public asks; // Track asks for each token
    IERC721 public nftContract;

    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AskPlaced(uint256 indexed tokenId, address indexed seller, uint256 price);
    event BidAccepted(uint256 indexed tokenId, address indexed seller, address indexed bidder, uint256 amount);
    event AskAccepted(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event BidCancelled(uint256 indexed tokenId, address indexed bidder);
    event AskCancelled(uint256 indexed tokenId, address indexed seller);

    constructor(address nftAddress) {
        nftContract = IERC721(nftAddress);
    }

    function placeBid(uint256 tokenId) external payable {
        require(msg.value > 0, "Bid amount must be greater than zero");
        require(msg.value > bids[tokenId].amount, "Bid must be higher than the current bid");

        // Refund the previous bidder if there is one
        if (bids[tokenId].bidder != address(0)) {
            payable(bids[tokenId].bidder).transfer(bids[tokenId].amount);
        }

        bids[tokenId] = Bid(msg.sender, msg.value);
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function placeAsk(uint256 tokenId, uint256 price) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner of the token");
        require(price > 0, "Price must be greater than zero");

        asks[tokenId] = Ask(msg.sender, price);
        emit AskPlaced(tokenId, msg.sender, price);
    }

    function acceptBid(uint256 tokenId) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner of the token");
        Bid memory bid = bids[tokenId];
        require(bid.bidder != address(0), "No bid to accept");

        // Transfer the token to the bidder
        nftContract.safeTransferFrom(msg.sender, bid.bidder, tokenId);

        // Transfer the bid amount to the seller
        payable(msg.sender).transfer(bid.amount);

        // Clear the bid
        delete bids[tokenId];

        emit BidAccepted(tokenId, msg.sender, bid.bidder, bid.amount);
    }

    function acceptAsk(uint256 tokenId) external payable {
        Ask memory ask = asks[tokenId];
        require(ask.seller != address(0), "No ask to accept");
        require(msg.value == ask.price, "Incorrect payment amount");

        // Transfer the token to the buyer
        nftContract.safeTransferFrom(ask.seller, msg.sender, tokenId);

        // Transfer the payment to the seller
        payable(ask.seller).transfer(msg.value);

        // Clear the ask
        delete asks[tokenId];

        emit AskAccepted(tokenId, msg.sender, ask.seller, msg.value);
    }

    function cancelBid(uint256 tokenId) external {
        Bid memory bid = bids[tokenId];
        require(bid.bidder == msg.sender, "Only the bidder can cancel their bid");

        // Refund the bid amount
        payable(bid.bidder).transfer(bid.amount);

        // Clear the bid
        delete bids[tokenId];

        emit BidCancelled(tokenId, msg.sender);
    }

    function cancelAsk(uint256 tokenId) external {
        Ask memory ask = asks[tokenId];
        require(ask.seller == msg.sender, "Only the seller can cancel their ask");

        // Clear the ask
        delete asks[tokenId];

        emit AskCancelled(tokenId, msg.sender);
    }
}
