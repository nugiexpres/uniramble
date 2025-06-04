import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { BOARD_STYLES } from "./style";
import styles from "@/styles/board.module.css";
import { Copy } from "lucide-react";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

// Define the GridItem type according to your grid data structure
interface GridItem {
  id: string | number;
  typeGrid: string;
  // Add other properties if needed
}

export const Board = () => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [gridData, setGridData] = useState<
    { id: bigint; typeGrid: string; ingredientType: bigint; numberOfPlayers: bigint }[]
  >([]);
  const [you, setYou] = useState<bigint | undefined>(undefined);
  const [faucetUsed, setFaucetUsed] = useState(false);
  const [isOnStove, setIsOnStove] = useState(false); // Track if the player is on a stove

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tbaAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const { data: balance } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "getBalance",
    args: [address],
  });

  const { data: tbaAddress } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "tbaList",
    args: [address],
  });

  const { data: gridDataFromContract } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "getGrid",
    args: [],
  });

  const { data: youFromContract } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "player",
    args: [tbaAddress],
  });

  const { data: canBuy } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "canBuy",
    args: [tbaAddress],
  });

  const { data: breadAmount } = useScaffoldContractRead({
    contractName: "BreadToken",
    functionName: "balanceOf",
    args: [tbaAddress],
  });

  const { data: meatAmount } = useScaffoldContractRead({
    contractName: "MeatToken",
    functionName: "balanceOf",
    args: [tbaAddress],
  });

  const { data: lettuceAmount } = useScaffoldContractRead({
    contractName: "LettuceToken",
    functionName: "balanceOf",
    args: [tbaAddress],
  });

  const { data: tomatoAmount } = useScaffoldContractRead({
    contractName: "CoinToken",
    functionName: "balanceOf",
    args: [tbaAddress],
  });

  const { writeAsync: roll } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "movePlayer",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: buy } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "buyIngredient",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: travelRail } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "travelRail",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: cookFood } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "mintFoodNFT",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: faucetMon } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "useFaucetMon",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Faucet executed, blockHash:", txnReceipt.blockHash);
    },
    onError: error => {
      console.error("FaucetMon Error:", error);
      alert("Faucet already used. Wait 12 hour to use Faucet.");
    },
  });

  const { data: faucetUsageCountData, refetch: refetchFaucetUsageCount } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "faucetUsageCount",
    args: [tbaAddress],
    watch: true,
  });

  const fetchFaucetUsageCount = useCallback(() => {
    if (faucetUsageCountData) {
      const count = Number(faucetUsageCountData.toString());
      setFaucetUsed(count >= 2);
    }
  }, [faucetUsageCountData]);

  useEffect(() => {
    fetchFaucetUsageCount();
  }, [fetchFaucetUsageCount]);

  const handleFaucetMon = async () => {
    if (!isOnStove) {
      console.log("You must be on a stove grid to use the Faucet Mon.");
      return;
    }

    if (faucetUsed) {
      console.log("You have already used the faucet twice in the last 24 hours.");
      return;
    }

    try {
      await faucetMon();
      await refetchFaucetUsageCount();
    } catch (error) {
      console.error("Error using Faucet Mon:", error);
    }
  };

  useEffect(() => {
    if (gridDataFromContract) {
      setGridData(gridDataFromContract);
    }
  }, [gridDataFromContract]);

  useEffect(() => {
    if (youFromContract) {
      setYou(youFromContract);
    }
  }, [youFromContract]);

  // Determine if the player is on a stove and update isOnStove state
  useEffect(() => {
    if (gridData && you !== undefined) {
      const playerPosition = Number(you);
      const isPlayerOnStove = gridData[playerPosition]?.typeGrid === "Stove";
      setIsOnStove(isPlayerOnStove);
    }
  }, [gridData, you]);

  return (
    <div className="mt-5">
      <div>
        <div className="grid lg:grid-cols-2 gap-8 flex-grow px-0 justify-start">
          {/* Wallet Bound Account */}
          <div className="ml-1 w-[275px] bg-purple-300 p-5 rounded-lg">
            <h2 className="text-2xl mb-0 underline">Token Bound Account</h2>
            {/* Wallet Address & Copy */}
            <div className="flex items-center mt-0 space-x-2">
              <p className="mt-0 font-mono">
                {tbaAddress ? `${tbaAddress.slice(0, 6)}...${tbaAddress.slice(-4)}` : "Wallet Not Connected"}
              </p>
              {tbaAddress && (
                <button onClick={handleCopy} className="hover:text-purple-600" title="Copy">
                  <Copy size={16} />
                </button>
              )}
              {copied && <span className="text-sm text-green-800">Copied!</span>}
            </div>
            <div className="mt-1 text-sm text-gray-800">
              Balance: <span className="font-semibold">{balance ? `${balance} ETH` : "Coming soon "}</span>
            </div>

            <h2 className="mt-4 text-2xl underline">Combine Food</h2>
            <p>{(breadAmount?.toString() as any) / 10 ** 18} Bread</p>
            <p>{(meatAmount?.toString() as any) / 10 ** 18} Meat</p>
            <p>{(lettuceAmount?.toString() as any) / 10 ** 18} Lettuce</p>
            <p>{(tomatoAmount?.toString() as any) / 10 ** 18} Tomato</p>
          </div>

          {/* Scramble Game Section */}
          <div className="flex flex-col items-center">
            <div className="relative mt-3 bg-green-300 rounded-xl mx-auto" style={{ width: "445px", height: "445px" }}>
              {gridData &&
                gridData.map((item, index: number) => {
                  const gridItem: GridItem = {
                    id: item.id.toString(),
                    typeGrid: item.typeGrid,
                    // Add other properties if needed
                  };
                  return (
                    <div
                      key={index}
                      className={`absolute w-[70px] h-[70px] border border-gray-300 rounded-x1 font-bold bg-stone-200 relative z-10 ${
                        BOARD_STYLES[index] || "grid-1"
                      }`}
                    >
                      {gridItem.typeGrid}
                      {you?.toString() === gridItem.id.toString() && (
                        <Image className="chef" src="/assets/chog.png" width={35} height={35} alt="Chog" />
                      )}
                      {gridItem.typeGrid === "Stove" && (
                        <Image
                          src="/assets/stove-u.png"
                          width={55}
                          height={55}
                          alt="Stove Nad"
                          className={styles.stoveImage}
                        />
                      )}
                    </div>
                  );
                })}
              <Image
                className="track absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                src="/assets/track.png"
                width={35}
                height={170}
                alt="Track"
              />
            </div>
            <div className="mt-3 bg-purple-300 p-3 rounded-xl mx-auto" style={{ width: "445px" }}>
              <div className="flex flex-wrap justify-start gap-2 mt-2">
                <button
                  className="py-2 px-4 bg-green-500 rounded hover:bg-green-300 disabled:opacity-50"
                  onClick={() => roll()}
                >
                  Roll
                </button>

                {canBuy && (
                  <button
                    className="py-2 px-4 bg-yellow-500 rounded hover:bg-green-300 disabled:opacity-50"
                    onClick={() => buy()}
                  >
                    Buy
                  </button>
                )}

                <button
                  className="py-2 px-4 bg-red-500 rounded hover:bg-green-300 disabled:opacity-50"
                  onClick={() => travelRail()}
                >
                  Rail
                </button>

                <button
                  className="py-2 px-4 bg-green-500 rounded hover:bg-green-300 disabled:opacity-50"
                  onClick={() => cookFood()}
                >
                  Cook
                </button>

                <button
                  className={`py-2 px-4 whitespace-nowrap ${
                    isOnStove && !faucetUsed ? "bg-blue-500 hover:bg-blue-300" : "bg-gray-500 cursor-not-allowed"
                  } rounded disabled:opacity-50`}
                  onClick={handleFaucetMon}
                  disabled={!isOnStove || faucetUsed}
                >
                  Faucet
                </button>
                <p className="text-red-600 mt-1 text-sm">Faucet can only be used once every 12 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
