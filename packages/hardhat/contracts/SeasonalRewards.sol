// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

/// @title SeasonalRewards - Handles weekly/seasonal rewards for top players
contract SeasonalRewards {
    IRewardToken public rewardToken;
    address public admin;

    mapping(address => uint256) public weeklyScores;
    mapping(uint256 => address[]) public topPlayersByWeek;

    event RewardsDistributed(uint256 week, address[] winners);

    constructor(address _rewardToken) {
        rewardToken = IRewardToken(_rewardToken);
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    function setScore(address player, uint256 score) external onlyAdmin {
        weeklyScores[player] = score;
    }

    function distributeRewards(uint256 week, address[] calldata winners) external onlyAdmin {
        for (uint256 i = 0; i < winners.length; i++) {
            rewardToken.mint(winners[i], 10 * 1e18);
        }
        topPlayersByWeek[week] = winners;
        emit RewardsDistributed(week, winners);
    }

    function getWinners(uint256 week) external view returns (address[] memory) {
        return topPlayersByWeek[week];
    }
}
