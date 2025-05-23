import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { Board } from "~~/components/board/board";

const uniBoard: NextPage = () => {
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
      <header className="bg-purple-700 py-5 relative">
        <div className="container mx-auto flex justify-between items-center px-5">
          <h1 className="text-4xl font-bold">
            <Link href="/" className="text-white hover:text-yellow-300">
              UniRamble
            </Link>
          </h1>
          <nav className="absolute top-5 right-5 flex items-center space-x-4 bg-purple-800 p-3 rounded-lg shadow-lg">
            <Link
              href="/"
              className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg bg-black hover:bg-purple-500"
            >
              Home
            </Link>
            <Link
              href="/account"
              className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg bg-black hover:bg-purple-500"
            >
              Account
            </Link>
            <Link
              href="/uniboard"
              className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg bg-black hover:bg-purple-500"
            >
              GameBoard
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>
      <div className="flex flex-col items-center mt-0">
        <Board />
      </div>
    </>
  );
};

export default uniBoard;
