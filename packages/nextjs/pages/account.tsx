/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
// import Link from "next/link";
import deployedContracts from "../generated/deployedContracts";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount, useNetwork } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const Account: NextPage = () => {
  // ==================================== STATE VARIABLES ====================================
  const { address } = useAccount();
  const { chain } = useNetwork();
  const CHAIN_ID = chain?.id ?? 1; // fallback to 1 if not detected

  const [selectedNFT, setSelectNFT] = useState(0);
  const [isMinted, setIsMinted] = useState(false);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [isNFTSelectable, setIsNFTSelectable] = useState(true);
  const [specialBoxCount, setSpecialBoxCount] = useState<number>(0);

  // ==================================== CONTRACT ADDRESSES ====================================
  const contracts = deployedContracts as Record<number, any>;
  const erc6551AccountAddress = contracts[CHAIN_ID]?.[0]?.contracts?.ERC6551Account?.address ?? "";
  const foodNFTAddress = contracts[CHAIN_ID]?.[0]?.contracts?.FoodNFT?.address ?? "";

  // ==================================== CONTRACT READ HOOKS ====================================
  // FoodNFT Contract
  const { data: chefMintedData } = useScaffoldContractRead({
    contractName: "FoodNFT",
    functionName: "chefMinted",
    args: [address],
  });

  const { data: nftsData } = useScaffoldContractRead({
    contractName: "FoodNFT",
    functionName: "getMyNFTs",
    args: [address],
  });

  // FoodScramble Contract
  const { data: accountReadyData } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "accountReady",
    args: [address],
  });

  const { data: foodNftsData } = useScaffoldContractRead({
    contractName: "FoodScramble",
    functionName: "getMyFoods",
    args: [address],
  });

  // SpecialBox Contract
  const { data: specialBoxCountData } = useScaffoldContractRead({
    contractName: "SpecialBox",
    functionName: "getUserSpecialBoxBalance",
    args: [address],
    watch: true,
  });

  // ==================================== CONTRACT WRITE HOOKS ====================================
  // FoodNFT Contract
  const { writeAsync: mintNFT } = useScaffoldContractWrite({
    contractName: "FoodNFT",
    functionName: "mintChef",
    args: [address, BigInt(selectedNFT)],
    value: parseEther("1").toString(), // kirim 1 ether
    onBlockConfirmation: (txn: { blockHash: string }) => {
      console.log("Minted", txn.blockHash);
    },
  });

  // FoodScramble Contract
  const { writeAsync: createAccount } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "createTokenBoundAccount",
    args: [
      erc6551AccountAddress, // address _implementation
      BigInt(CHAIN_ID), // uint256 _chainId
      foodNFTAddress, // address _tokenContract
      BigInt(selectedNFT), // uint256 _tokenId
      BigInt(Date.now()), // uint256 _salt (gunakan timestamp atau angka unik)
      "0x", // bytes _initData (kosongkan jika tidak ada data)
    ],
    onBlockConfirmation: (txn: { blockHash: string }) => {
      console.log("Account Created", txn.blockHash);
    },
  });

  // SpecialBox Contract
  const { writeAsync: mintSpecialBox } = useScaffoldContractWrite({
    contractName: "FoodScramble",
    functionName: "mintSpecialBoxNFT",
    args: [],
    onBlockConfirmation: (txn: { blockHash: string }) => {
      console.log("Special Box Minted", txn.blockHash);
    },
  });

  // ==================================== UTILITY VARIABLES ====================================
  const safeSpecialBoxCount = specialBoxCountData !== undefined ? Number(specialBoxCountData) : 0;
  const safeNfts = useMemo(() => (Array.isArray(nftsData) ? nftsData : []), [nftsData]);
  const safeFoodNfts = Array.isArray(foodNftsData) ? foodNftsData : [];
  const eligibleSpecialBoxCount = Math.floor(safeFoodNfts.length / 10);
  const canMintSpecialBox = eligibleSpecialBoxCount > specialBoxCount;

  // ==================================== USE EFFECTS ====================================
  useEffect(() => {
    setIsMinted(!!chefMintedData);
    setIsAccountCreated(!!accountReadyData);
    setIsNFTSelectable(!accountReadyData);
  }, [chefMintedData, accountReadyData]);

  useEffect(() => {
    if (specialBoxCountData) {
      setSpecialBoxCount(Number(specialBoxCountData));
    }
  }, [specialBoxCountData]);

  const handleMintChef = async () => {
    try {
      await mintNFT();
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      if (error.message?.includes("Mint price is 1 native token")) {
        alert("Minting requires exactly 1 native token.");
      } else {
        alert("Failed to mint NFT. See console for details.");
      }
    }
  };

  // FoodScramble Contract
  const handleCreateAccount = async () => {
    try {
      await createAccount();
    } catch (error) {
      console.error("Error creating account:", error);
      // Optionally display an error message to the user
    }
  };

  // SpecialBox Contract
  const handleMintSpecialBox = async () => {
    try {
      await mintSpecialBox();
      if (specialBoxCountData) {
        setSpecialBoxCount(Number(specialBoxCountData.toString()));
      }
    } catch (error) {
      alert(
        "Failed to mint Special Box. Make sure you have enough Hamburger NFTs and haven't claimed all your rights.",
      );
      console.error("Error minting special box:", error);
    }
  };

  // ==================================== RENDER FUNCTION ====================================
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
      <div className="grid lg:grid-cols-2 gap-8 flex-grow mt-4 lg:mt-8 px-5 md:px-10 lg:px-20">
        {/* NFT Purchase Section */}
        <div className="px-5 bg-purple-300 rounded-lg p-5">
          <h1 className="text-left mb-5 text-2xl underline">Buy a NFT: 1 MON</h1>
          <Image src="/assets/chog.png" width={80} height={80} alt="Chog" />
          <div className="flex flex-col items-start space-y-3 mt-6">
            <button
              className="py-2 px-16 bg-blue-500 rounded hover:bg-blue-300 disabled:opacity-50"
              onClick={handleMintChef}
              disabled={isMinted}
            >
              {isMinted ? "Chog NFT Minted" : "Mint Chog NFT"}
            </button>
          </div>
          <h1 className="text-left mt-5 text-3xl underline">Create Wallet Bound</h1>
          <div className="flex">
            {safeNfts.map((_, index) => (
              <div
                key={index}
                className={`w-20 h-20 border flex items-center justify-center cursor-pointer ${
                  isNFTSelectable ? "" : "opacity-50 cursor-not-allowed"
                }`}
                style={{ background: selectedNFT === index ? "#00cc99" : "white" }}
                onClick={() => isNFTSelectable && setSelectNFT(index)}
              >
                <Image src="/assets/chog.png" width={50} height={50} alt="Chog" />
              </div>
            ))}
          </div>
          <button
            className={`py-2 px-16 mt-3 rounded ${
              isAccountCreated ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-300"
            }`}
            onClick={handleCreateAccount}
            disabled={!isMinted || isAccountCreated}
          >
            {isAccountCreated ? "Account Created" : "Create Wallet Bound Account"}
          </button>
        </div>
        {/* NFT Combination Section */}
        <div className="px-5 bg-purple-300 rounded-lg p-5">
          <h1 className="text-left mb-5 text-3xl underline">Combine NFT</h1>
          <div className="flex flex-col items-start">
            {safeFoodNfts.length > 0 ? (
              <>
                <div className="relative w-20 h-20 border bg-white rounded-lg shadow-lg flex items-center justify-center">
                  <Image src="/assets/hamburger.png" width={70} height={70} alt="Hamburger" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                    x{safeFoodNfts.length}
                  </span>
                </div>
                <p className="mt-2 text-center">Hamburger</p>
              </>
            ) : (
              <p>No Hamburger found</p>
            )}
          </div>
          <div className="flex flex-col items-start mt-5">
            {specialBoxCount > 0 ? (
              <>
                <div className="relative w-20 h-20 border bg-white rounded-lg shadow-lg flex items-center justify-center">
                  <Image src="/assets/specialBox.png" width={70} height={70} alt="Special Box" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                    x{safeSpecialBoxCount}
                  </span>
                </div>
                <p className="mt-2 text-center">Special Box</p>
              </>
            ) : (
              <p>No Special Boxes found</p>
            )}
            <button
              className="py-2 px-16 mt-3 bg-red-500 rounded hover:bg-red-300 disabled:opacity-50"
              onClick={handleMintSpecialBox}
              disabled={!canMintSpecialBox}
            >
              Mint Special Box
            </button>
            {!canMintSpecialBox && (
              <p className="text-red-500 mt-2">Collect 10 more hamburgers to mint the next Special Box.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
