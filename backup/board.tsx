import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { BOARD_STYLES } from "../packages/nextjs/components/board/style";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const Board = () => {
  const { address }: { address: string | undefined } = useAccount();
  const [specialBoxCount, setSpecialBoxCount] = useState<number | null>(null);
  const [gridData, setGridData] = useState<
    { id: bigint; typeGrid: string; ingredientType: bigint; numberOfPlayers: bigint }[]
  >([]);
  const [you, setYou] = useState<bigint | undefined>(undefined);
  const [faucetUsed, setFaucetUsed] = useState(false);
  const [isOnStove, setIsOnStove] = useState(false); // Track if the player is on a stove

  const { data: tbaAddress } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "tbaList",
    args: [address],
  });

  const { data: gridDataFromContract, isLoading: isGridDataLoading } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "getGrid",
    args: [tbaAddress],
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
    onBlockConfirmation: (txnReceipt: { blockHash: string }) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: buy } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "buyIngredient",
    onBlockConfirmation: (txnReceipt: { blockHash: any }) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: travelRail } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "travelRail",
    onBlockConfirmation: (txnReceipt: { blockHash: any }) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: cookFood } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "mintFoodNFT",
    onBlockConfirmation: (txnReceipt: { blockHash: any }) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { data: specialBoxCountData } = useScaffoldContractRead({
    contractName: "SpecialBox",
    functionName: "getSpecialBoxCount",
    args: [address],
  });

  const fetchSpecialBoxCount = useCallback(() => {
    const count = specialBoxCountData ? Number(specialBoxCountData.toString()) : 0;
    setSpecialBoxCount(count);
    return count;
  }, [specialBoxCountData]);

  const { writeAsync: faucetMon } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "faucetMon",
    onBlockConfirmation: (txnReceipt: { blockHash: any }) => {
      console.log("📦 Faucet Mon executed, blockHash:", txnReceipt.blockHash);
    },
    onError: error => {
      console.error("FaucetMon Error:", error);
      alert("FaucetMon failed. See console for details.");
    },
  });

  const { data: faucetUsageCountData, refetch: refetchFaucetUsageCount } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "faucetUsageCount",
    args: [tbaAddress],
    watch: true, // Enable real-time updates
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
      await refetchFaucetUsageCount(); // Re-fetch the faucet usage count after a successful faucet use
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

  // Fetch specialBoxCount on component mount and when specialBoxCountData changes
  useEffect(() => {
    fetchSpecialBoxCount();
  }, [fetchSpecialBoxCount]);

  useEffect(() => {
    refetchFaucetUsageCount();
  }, [tbaAddress, refetchFaucetUsageCount]);

  console.log("gridData:", gridData); // Add this line for debugging
  console.log("you:", you); // Add this line for debugging

  return (
    <div className="mt-5">
      <div className="grid lg:grid-cols-2 gap-8 flex-grow">
        {/* Wallet Bound Account */}
        <div className="bg-purple-900 text-white p-5 rounded-lg">
          <h2 className="text-2xl mb-0 underline">Wallet Bound Account</h2>
          <p className="mt-0">{tbaAddress}</p>
          <button
            className="py-2 w-40 mb-1 mt-3 mr-3 bg-green-500 rounded-lg baseline hover:bg-green-300 disabled:opacity-50"
            onClick={() => roll()}
          >
            Roll
          </button>
          <br />
          {canBuy && (
            <button
              className="py-2 w-40 mb-1 mt-3 mr-3 bg-yellow-500 rounded-lg baseline hover:bg-yellow-300 disabled:opacity-50"
              onClick={() => buy()}
            >
              Buy
            </button>
          )}
          <br />
          <button
            className="py-2 w-40 mb-1 mt-3 mr-3 bg-green-500 rounded-lg baseline hover:bg-green-300 disabled:opacity-50"
            onClick={() => travelRail()}
          >
            Use Rail
          </button>
          <br />
          <button
            className="py-2 w-40 mb-1 mt-3 mr-3 bg-yellow-500 rounded-lg baseline hover:bg-yellow-300 disabled:opacity-50"
            onClick={() => cookFood()}
          >
            Cook
          </button>
          <br />
          <button
            className={`py-2 w-40 mb-1 mt-3 mr-3 ${isOnStove && !faucetUsed ? "bg-blue-500 hover:bg-blue-300" : "bg-gray-500 cursor-not-allowed"
              } rounded-lg baseline disabled:opacity-50`}
            onClick={handleFaucetMon}
            disabled={!isOnStove || faucetUsed}
          >
            Faucet Mon
          </button>
          {faucetUsed && <p className="text-green-500 mt-2">Already Used 2x in 24 hour.</p>}
          <h2 className="mt-4 text-3xl underline">Your Bags</h2>
          <p className="mt-2">Special Boxes Collected: {specialBoxCount ?? 0}</p>
          <p>{(breadAmount?.toString() as any) / 10 ** 18} Bread</p>
          <p>{(meatAmount?.toString() as any) / 10 ** 18} Meat</p>
          <p>{(lettuceAmount?.toString() as any) / 10 ** 18} Lettuce</p>
          <p>{(tomatoAmount?.toString() as any) / 10 ** 18} Tomato</p>
        </div>

        {/* Scramble Game Section */}
        <div className="bg-purple-900 text-white p-5 rounded-lg">
          <div className="relative mt-3 bg-green-300" style={{ width: "530px", height: "530px" }}>
            {isGridDataLoading ? (
              <div>Loading grid...</div>
            ) : gridData.length > 0 ? (
              gridData.map((item, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 border border-gray-300 font-bold bg-stone-200 relative z-10 flex items-center justify-center ${BOARD_STYLES[index] || "grid-1"
                    }`}
                >
                  <span className="text-purple-900 absolute top-1 left-1">{item.typeGrid}</span>
                  {item.typeGrid === "Stove" && (
                    <Image
                      className="absolute bottom-1"
                      src="/assets/stove.png"
                      width={40}
                      height={40}
                      alt="Stove"
                      style={{ zIndex: 1 }}
                    />
                  )}
                  {you?.toString() === item.id?.toString() && (
                    <Image
                      className="absolute bottom-1"
                      src="/assets/chog.png"
                      width={40}
                      height={40}
                      alt="Chog"
                      style={{ zIndex: 2 }}
                    />
                  )}
                </div>
              ))
            ) : (
              <div>No grid data available.</div>
            )}
            <Image className="track" src="/assets/track.png" width={45} height={200} alt="Track" />
          </div>
        </div>
      </div>
    </div>
  );
};
