// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title IngredientOracle - Provides pricing and availability insights for FoodScramble ingredients.
contract IngredientOracle {
    enum Ingredient {
        Bread,
        Meat,
        Lettuce,
        Tomato,
        Spice,
        Cheese,
        Pickle
    }

    struct IngredientInfo {
        uint256 basePrice;
        uint256 stock;
        uint256 lastUpdated;
    }

    mapping(Ingredient => IngredientInfo) public ingredients;
    mapping(address => mapping(Ingredient => uint256)) public lastAccessed;
    mapping(string => uint256) public ingredientPrices;

    event PriceChanged(Ingredient indexed ingredient, uint256 newPrice);
    event StockAdjusted(Ingredient indexed ingredient, uint256 newStock);
    event IngredientQueried(address indexed user, Ingredient indexed ingredient, uint256 stock);

    constructor() {
        ingredients[Ingredient.Bread] = IngredientInfo(1 ether, 1000, block.timestamp);
        ingredients[Ingredient.Meat] = IngredientInfo(2 ether, 800, block.timestamp);
        ingredients[Ingredient.Lettuce] = IngredientInfo(1 ether, 1200, block.timestamp);
        ingredients[Ingredient.Tomato] = IngredientInfo(1 ether, 1100, block.timestamp);
        ingredients[Ingredient.Spice] = IngredientInfo(3 ether, 500, block.timestamp);
        ingredients[Ingredient.Cheese] = IngredientInfo(2 ether, 600, block.timestamp);
        ingredients[Ingredient.Pickle] = IngredientInfo(1 ether, 700, block.timestamp);

        // Initialize some example prices
        ingredientPrices["Spice"] = 100;
        ingredientPrices["Bread"] = 50;
    }

    function getPrice(Ingredient ingredient) external view returns (uint256) {
        return ingredients[ingredient].basePrice;
    }

    function getStock(Ingredient ingredient) external returns (uint256) {
        lastAccessed[msg.sender][ingredient] = block.timestamp;
        emit IngredientQueried(msg.sender, ingredient, ingredients[ingredient].stock);
        return ingredients[ingredient].stock;
    }

    function adjustPrice(Ingredient ingredient, uint256 newPrice) external {
        ingredients[ingredient].basePrice = newPrice;
        ingredients[ingredient].lastUpdated = block.timestamp;
        emit PriceChanged(ingredient, newPrice);
    }

    function increaseStock(Ingredient ingredient, uint256 amount) external {
        ingredients[ingredient].stock += amount;
        emit StockAdjusted(ingredient, ingredients[ingredient].stock);
    }

    function reduceStock(Ingredient ingredient, uint256 amount) external {
        require(ingredients[ingredient].stock >= amount, "Insufficient stock");
        ingredients[ingredient].stock -= amount;
        emit StockAdjusted(ingredient, ingredients[ingredient].stock);
    }

    function getIngredientPrice(string memory ingredient) public view returns (uint256) {
        return ingredientPrices[ingredient];
    }

    function setIngredientPrice(string memory ingredient, uint256 price) public {
        ingredientPrices[ingredient] = price;
    }
}
