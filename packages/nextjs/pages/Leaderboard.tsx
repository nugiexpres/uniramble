import React, { useEffect, useState } from "react";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const Leaderboard = () => {
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

  return (
    <div>
      <h1>Leaderboard</h1>
      <table style={{ borderLeft: "2px solid purple", borderRight: "2px solid purple" }}>
        <thead>
          <tr>
            <th style={{ border: "2px solid purple", padding: "5px", backgroundColor: "#D8BFD8" }}>Rank</th>
            <th style={{ border: "2px solid purple", padding: "5px", backgroundColor: "#D8BFD8" }}>Wallet</th>
            <th
              style={{
                border: "2px solid purple",
                padding: "5px",
                backgroundColor: "#D8BFD8",
                borderLeft: "2px solid purple",
              }}
            >
              Special Box
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={entry.wallet}>
              <td
                style={{
                  borderRight: "2px solid purple",
                  backgroundColor: "#D8BFD8",
                  borderBottom: index === leaderboard.length - 1 ? "2px solid purple" : "none",
                }}
              >
                {index + 1}
              </td>
              <td
                style={{
                  borderRight: "2px solid purple",
                  backgroundColor: "#D8BFD8",
                  borderBottom: index === leaderboard.length - 1 ? "2px solid purple" : "none",
                }}
              >
                {formatWallet(entry.wallet)}
              </td>
              <td
                style={{
                  backgroundColor: "#D8BFD8",
                  borderBottom: index === leaderboard.length - 1 ? "2px solid purple" : "none",
                }}
              >
                {entry.totalNFTs}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
