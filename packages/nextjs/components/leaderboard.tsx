import React, { useEffect, useState } from "react";
// import Link from "next/link";
import styles from "@/styles/board.module.css";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

// Dummy ABI and address
const CONTRACT_ADDRESS = "0xYourLeaderboardContract";
const CONTRACT_ABI = [
  "function getTopPlayers(uint256 period) public view returns (address[] memory, uint256[] memory)",
];

type LeaderData = {
  address: string;
  score: number;
};

const periodMap = {
  daily: 0,
  weekly: 1,
  monthly: 2,
};

const Leaderboard: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [leaderData, setLeaderData] = useState<LeaderData[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ wallet: string; totalNFTs: number }[]>([]);

  const { data: players } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "getGrid",
    args: [],
  });

  const { data: playerNFTs } = useScaffoldContractRead({
    contractName: "FoodNFT",
    functionName: "getMyNFTs",
    args: [players || []],
  });

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 7)}...${wallet.slice(-7)}`;
  };

  useEffect(() => {
    if (players && playerNFTs) {
      const walletData: Record<string, number> = {};

      (players as string[])?.forEach((player: string, index: number) => {
        const nfts = playerNFTs ? playerNFTs[index] : [];
        walletData[player] = nfts.length;
      });

      const sortedLeaderboard = Object.entries(walletData)
        .map(([wallet, totalNFTs]) => ({ wallet, totalNFTs }))
        .sort((a, b) => b.totalNFTs - a.totalNFTs);

      setLeaderboard(sortedLeaderboard);
    }
  }, [players, playerNFTs]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const [addresses, scores]: [string[], ethers.BigNumber[]] = await contract.getTopPlayers(periodMap[activeTab]);

        const data: LeaderData[] = addresses.map((addr, idx) => ({
          address: addr,
          score: scores[idx].toNumber(),
        }));
        setLeaderData(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  return (
    <>
      <MetaHeader
        title="GameBoard"
        description="Uni Ramble is a blockchain-based board game where you collect ingredients, cook food, and earn rewards."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className={styles.container}>
        <div className={styles.rightColumn}>
          <div className={styles.tabs}>
            {["daily", "weekly", "monthly"].map(tab => (
              <div
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab as "daily" | "weekly" | "monthly")}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          <div className={`${styles.leaderboard} ${styles.leaderboardActive}`}>
            <ul className={styles.leaderList}>
              {leaderData.length === 0 ? (
                <li className={styles.leaderItem}>Loading data...</li>
              ) : (
                leaderData.map((user, idx) => (
                  <li key={idx} className={styles.leaderItem}>
                    {idx + 1}. {user.address.slice(0, 6)}...{user.address.slice(-4)} - {user.score} pts
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className={styles.leftColumn}>
          <h2 className={styles.title}>Leaderboard</h2>
          <ul className={styles.leaderList}>
            {leaderboard.map((entry, index) => (
              <li key={index} className={styles.leaderItem}>
                {index + 1}. {formatWallet(entry.wallet)} - {entry.totalNFTs} NFTs
              </li>
            ))}
          </ul>
          {leaderboard.length === 0 && <p className={styles.noData}>No data available</p>}
          <p className={styles.footer}>
            Note: The leaderboard is updated periodically. Check back later for the latest standings.
          </p>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
