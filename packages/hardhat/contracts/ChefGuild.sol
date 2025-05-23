// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title ChefGuild - Manages elite chef groups and reputation in FoodScramble
contract ChefGuild {
    struct Guild {
        string name;
        address[] members;
        uint256 reputation;
        uint256 createdAt;
    }

    mapping(uint256 => Guild) public guilds;
    mapping(address => uint256) public memberGuild;
    uint256 public guildCount;

    event GuildCreated(uint256 indexed guildId, string name);
    event MemberJoined(uint256 indexed guildId, address member);
    event ReputationUpdated(uint256 indexed guildId, uint256 newReputation);

    modifier onlyGuildMember(uint256 guildId) {
        require(memberGuild[msg.sender] == guildId, "Not a member of this guild");
        _;
    }

    function createGuild(string memory name) external {
        guildCount++;
        guilds[guildCount] = Guild(name, new address[](0), 0, block.timestamp);
        emit GuildCreated(guildCount, name);
    }

    function joinGuild(uint256 guildId) external {
        require(memberGuild[msg.sender] == 0, "Already in a guild");
        guilds[guildId].members.push(msg.sender);
        memberGuild[msg.sender] = guildId;
        emit MemberJoined(guildId, msg.sender);
    }

    function updateReputation(uint256 guildId, uint256 delta, bool increase) external onlyGuildMember(guildId) {
        if (increase) {
            guilds[guildId].reputation += delta;
        } else {
            require(guilds[guildId].reputation >= delta, "Reputation too low");
            guilds[guildId].reputation -= delta;
        }
        emit ReputationUpdated(guildId, guilds[guildId].reputation);
    }

    function getGuildMembers(uint256 guildId) external view returns (address[] memory) {
        return guilds[guildId].members;
    }

    function getMyGuild() external view returns (uint256 guildId, string memory name, uint256 reputation) {
        guildId = memberGuild[msg.sender];
        Guild memory g = guilds[guildId];
        return (guildId, g.name, g.reputation);
    }
}
