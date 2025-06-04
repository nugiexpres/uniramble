// import Link from "next/link";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { Board } from "~~/components/board/board";

const uniBoard: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="UniRamble"
        description="Uni Ramble is a blockchain-based board game where you collect ingredients, cook food, and earn rewards."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 gap-8 flex-grow mt-4 lg:mt-4 px-5 md:px-10 lg:px-20">
        <Board />
      </div>
    </>
  );
};

export default uniBoard;
