//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "./ERC6551Registry.sol";
import "./BreadToken.sol";
import "./MeatToken.sol";
import "./LettuceToken.sol";
import "./CoinToken.sol";
import "./FoodNFT.sol";
import "./SpecialBox.sol";
import "./FaucetMon.sol";
import "./UnirambleMarketplace.sol";
import "./ChefHelper.sol";
import "./IngredientOracle.sol";
import "./ChefGuild.sol";
import "./KitchenTools.sol";

contract FoodScramble {
  ERC6551Registry public registry;
  BreadToken public bread;
  MeatToken public meat;
  LettuceToken public lettuce;
  CoinToken public tomato;
  FoodNFT public hamburger;
  SpecialBox public specialBox;
  FaucetMon public faucetMon;
  UnirambleMarketplace public marketplace;
  ChefHelper public helper;
  IngredientOracle public oracle;

  address public immutable owner;
  Box[] public grid;
  mapping(address => address) public tbaList;
  mapping(address => uint256) public player;
  mapping(address => bool) public canBuy;
  mapping(address => uint256) public rollCount;
  mapping(address => uint256) public faucetUsageCount;
  mapping(address => uint256) public lastFaucetUsage;
  mapping(address => uint256) public lastMintedSpecialBox;
  mapping(address => PlayerStats) public stats;
  mapping(address => mapping(IngredientType => uint256)) public inventory;
  mapping(address => string) public usernames;
  mapping(string => address) public nameToAddress;
  mapping(address => uint256[]) public travelHistory;

  struct Box {
    uint256 id;
    string typeGrid;
    uint256 ingredientType;
    uint256 numberOfPlayers;
  }

  struct PlayerStats {
    uint256 totalRolls;
    uint256 ingredientsCollected;
    uint256 foodsMinted;
    uint256 lastActive;
    bool hasSpecialAccess;
  }

  enum IngredientType { Bread, Meat, Lettuce, Tomato }

  event RollResult(address player, uint256 num);
  event SpecialBoxMinted(address indexed user, uint256 hamburgerCount);

  uint256 public constant FAUCET_AMOUNT = 0.25 ether;
  uint256 public constant FAUCET_COOLDOWN = 12 hours;

  constructor(
    address _owner,
    address _registryAddress,
    address _breadAddress,
    address _meatAddress,
    address _lettuceAddress,
    address _tomatoAddress,
    address _hamburgerAddress,
    address _specialBoxAddress,
    address payable _faucetMonAddress,
    address _marketplaceAddress,
    address _helperAddress,
    address _oracleAddress
  ) {
    owner = _owner;
    registry = ERC6551Registry(_registryAddress);
    bread = BreadToken(_breadAddress);
    meat = MeatToken(_meatAddress);
    lettuce = LettuceToken(_lettuceAddress);
    tomato = CoinToken(_tomatoAddress);
    hamburger = FoodNFT(_hamburgerAddress);
    specialBox = SpecialBox(_specialBoxAddress);
    faucetMon = FaucetMon(_faucetMonAddress);
    marketplace = UnirambleMarketplace(_marketplaceAddress);
    helper = ChefHelper(_helperAddress);
    oracle = IngredientOracle(_oracleAddress);

    // Initialize the grid with a loop
    string[] memory gridTypes = new string[](20);
    uint256[] memory ingredientTypes = new uint256[](20);

    gridTypes[0] = "Stove";
    ingredientTypes[0] = 99;

    for (uint256 id = 1; id < 5; id++) {
      gridTypes[id] = "Bread";
      ingredientTypes[id] = 0;
    }

    gridTypes[5] = "Rail";
    ingredientTypes[5] = 98;

    for (uint256 id = 6; id < 10; id++) {
      gridTypes[id] = "Meat";
      ingredientTypes[id] = 1;
    }

    gridTypes[10] = "Stove";
    ingredientTypes[10] = 99;

    for (uint256 id = 11; id < 15; id++) {
      gridTypes[id] = "Lettuce";
      ingredientTypes[id] = 2;
    }

    gridTypes[15] = "Rail";
    ingredientTypes[15] = 98;

    for (uint256 id = 16; id < 20; id++) {
      gridTypes[id] = "Tomato";
      ingredientTypes[id] = 3;
    }

    for (uint256 i = 0; i < 20; i++) {
        grid.push(Box(i, gridTypes[i], ingredientTypes[i], 0));
    }
  }

  function getGrid() public view returns (Box[] memory){
    return grid;
  }

  function getMyFoods(address _owner) public view returns (uint256[] memory){
    address tba = tbaList[_owner];
    return hamburger.getMyFoods(tba);
  }

  function createTokenBoundAccount(
    address _implementation,
    uint256 _chainId,
    address _tokenContract,
    uint256 _tokenId,
    uint256 _salt,
    bytes calldata _initData
  ) external {
    address newTBA = registry.createAccount(_implementation, _chainId, _tokenContract, _tokenId, _salt, _initData);
    tbaList[msg.sender] = newTBA;

    grid[0].numberOfPlayers += 1;
  }

  function movePlayer() public {
    address tba = tbaList[msg.sender];
    grid[player[tba]].numberOfPlayers -= 1;
    uint256 randomNumber = uint256(keccak256(abi.encode(block.timestamp, tba))) % 5;
    player[tba] += randomNumber + 1;

    if (player[tba] >= 20) {
      player[tba] = 0;
      grid[0].numberOfPlayers += 1;
    }
    else {
      grid[player[tba]].numberOfPlayers += 1;
    }

    if (grid[player[tba]].ingredientType <= 3) {
      canBuy[tba] = true;
    }

    rollCount[tba] += 1;

    emit RollResult(tba, randomNumber);
  }

  function buyIngredient() public {
    address tba = tbaList[msg.sender];
    require(canBuy[tba], "You already brought this ingredient");
    Box memory currentSpot = grid[player[tba]];

    if (currentSpot.ingredientType == 0) bread.mint(tba, 1 * 10 ** 18);
    else if (currentSpot.ingredientType == 1) meat.mint(tba, 1 * 10 ** 18);
    else if (currentSpot.ingredientType == 2)lettuce.mint(tba, 1 * 10 ** 18);
    else if (currentSpot.ingredientType == 3)tomato.mint(tba, 1 * 10 ** 18);

    canBuy[tba] = false;
  }

  function travelRail() public {
    address tba = tbaList[msg.sender];
    Box memory currentSpot = grid[player[tba]];
    require(currentSpot.ingredientType == 98, "You cannot use this rail");

    grid[player[tba]].numberOfPlayers -= 1;

    if (player[tba] == 5) {
      player[tba] = 15;
      grid[15].numberOfPlayers += 1;
    }
    else {
      player[tba] = 5;
      grid[5].numberOfPlayers += 1;
    }
  }

  function mintFoodNFT() public {
    address tba = tbaList[msg.sender];
    // require(bread.balanceOf[tba] > 0, "You need more bread");
    // require(meat.balanceOf[tba] > 0, "You need more meat");
    // require(lettuce.balanceOf[tba] > 0, "You need more lettuce");
    // require(tomato.balanceOf[tba] > 0, "You need more tomato");

    bread.burn(tba, 1 * 10 ** 18);
    meat.burn(tba, 1 * 10 ** 18);
    lettuce.burn(tba, 1 * 10 ** 18);
    tomato.burn(tba, 1 * 10 ** 18);

    hamburger.mintFood(tba, "h");
  }

  function faucets() public {
    address tba = tbaList[msg.sender];

    // for testing
    bread.mint(tba, 1 * 10 ** 18);
    meat.mint(tba, 1 * 10 ** 18);
    lettuce.mint(tba, 1 * 10 ** 18);
    tomato.mint(tba, 1 * 10 ** 18);
  }

  function useFaucetMon() public {
    address tba = tbaList[msg.sender];
    uint256 playerPosition = player[tba];
    require(
        keccak256(abi.encodePacked(grid[playerPosition].typeGrid)) == keccak256(abi.encodePacked("Stove")),
        "You must be on stove to use faucet."
    );

    uint256 currentTime = block.timestamp;
    require(currentTime >= lastFaucetUsage[msg.sender] + FAUCET_COOLDOWN, "Faucet already used. Wait 12 hour to use again.");

    lastFaucetUsage[msg.sender] = currentTime;

    // Panggil kontrak FaucetMon untuk kirim ETH
    faucetMon.faucet(msg.sender, FAUCET_AMOUNT);
  }

  function mintSpecialBoxNFT() public {
        address tba = tbaList[msg.sender];
        require(tba != address(0), "TBA not set");

        uint256 hamburgerCount = getMyFoods(msg.sender).length;
        require(hamburgerCount >= 10, "Need at least 10 hamburger to mint a Special Box");

        uint256 currentRangeStart = (hamburgerCount / 10) * 10;
        require(
            lastMintedSpecialBox[msg.sender] < currentRangeStart,
            "Only can mint one Special Box per range 10 hamburgers"
        );

        specialBox.mintSpecialBox(tba);

        lastMintedSpecialBox[msg.sender] = currentRangeStart;

        emit SpecialBoxMinted(msg.sender, hamburgerCount);
    }

    // menyimpan TBA user
  function setTBA(address user, address tba) external {
        // validasi
        tbaList[user] = tba;
  }

  function accountReady(address user) public view returns (bool) {
    return tbaList[user] != address(0);
  }

  function simulateChefTraining(address playerAddr) public view returns (uint256) {
    return helper.estimateSkill(playerAddr) + stats[playerAddr].foodsMinted * 2;
  }

  function checkIngredientPrices() public view returns (uint256 spicePrice, uint256 breadPrice) {
    spicePrice = oracle.getIngredientPrice("Spice");
    breadPrice = oracle.getIngredientPrice("Bread");
  }

  function logTravel(uint256 index) internal {
    travelHistory[msg.sender].push(index);
    stats[msg.sender].lastActive = block.timestamp;
  }

  function setUsername(string calldata name) public {
    require(bytes(usernames[msg.sender]).length == 0, "Username already set");
    usernames[msg.sender] = name;
    nameToAddress[name] = msg.sender;
  }

  function burnOldIngredients() public {
    address tba = tbaList[msg.sender];
    bread.burn(tba, 1 ether);
    meat.burn(tba, 1 ether);
    lettuce.burn(tba, 1 ether);
    tomato.burn(tba, 1 ether);
  }

  function resetPlayerProgress(address playerAddr) public {
    require(msg.sender == owner, "Only owner can reset");
    delete stats[playerAddr];
    delete travelHistory[playerAddr];

    // Determine the number of IngredientType values
    uint256 ingredientCount = uint256(IngredientType.Tomato) + 1;

    for (uint256 i = 0; i < ingredientCount; i++) {
        inventory[playerAddr][IngredientType(i)] = 0;
    }
  }

  modifier isOwner() {
    require(msg.sender == owner, "Not the Owner");
    _;
  }

  function withdraw() public isOwner {
    (bool success, ) = owner.call{ value: address(this).balance }("");
    require(success, "Failed to send Ether");
  }

  receive() external payable {}

}
