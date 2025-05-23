import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Home = () => {
  return (
    <div className="bg-purple-900 text-white min-h-screen">
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
              className="text-white hover:text-yellow-300 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500"
            >
              Home
            </Link>
            <Link
              href="/account"
              className="text-white hover:text-yellow-300 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500"
            >
              Account
            </Link>
            <Link
              href="/uniboard"
              className="text-white hover:text-yellow-300 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500"
            >
              GameBoard
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-5 py-10">
        <section className="text-center">
          <h2 className="text-5xl font-bold mb-5">Welcome to Uni Ramble</h2>
          <p className="text-lg mb-10">
            Uni Ramble is a blockchain-based board game where you collect ingredients, cook food, and earn rewards.
            Compete with others and climb the leaderboard!
          </p>
          <Image src="/assets/uniramble-logo.webp" width={300} height={300} alt="Uni Ramble Logo" className="mx-auto" />
        </section>

        <section className="mt-10">
          <h3 className="text-3xl font-bold mb-5">How to Play</h3>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-purple-700 p-5 rounded-lg">
              <h4 className="text-2xl font-bold mb-3">Step 1: Mint Your NFT</h4>
              <p>
                Start by minting your unique Chog NFT in the{" "}
                <Link href="/account" className="text-yellow-300 underline">
                  Account
                </Link>
                . This NFT represents your player in the game.
              </p>
              <Image src="/assets/chog.png" width={100} height={100} alt="Chog NFT" className="mt-3 mx-auto" />
            </div>
            <div className="bg-purple-700 p-5 rounded-lg">
              <h4 className="text-2xl font-bold mb-3">Step 2: Create Your Wallet Bound Account</h4>
              <p>After minting your NFT, create a Wallet Bound Account (TBA) to store your game assets securely.</p>
            </div>
            <div className="bg-purple-700 p-5 rounded-lg">
              <h4 className="text-2xl font-bold mb-3">Step 3: Play the Game</h4>
              <p>
                Roll the dice, collect ingredients, and cook food. Use the{" "}
                <Link href="/uniboard" className="text-yellow-300 underline">
                  Game Board
                </Link>{" "}
                to navigate and play.
              </p>
              <Image src="/assets/game.png" width={200} height={200} alt="Game Board" className="mt-3 mx-auto" />
            </div>
            <div className="bg-purple-700 p-5 rounded-lg">
              <h4 className="text-2xl font-bold mb-3">Step 4: Earn Rewards</h4>
              <p>
                Collect 10 hamburgers to mint a Special Box. Special Boxes contain unique rewards and boost your
                leaderboard ranking.
              </p>
              <Image src="/assets/specialBox.png" width={150} height={150} alt="Special Box" className="mt-3 mx-auto" />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h3 className="text-3xl font-bold mb-5">Features</h3>
          <ul className="list-disc list-inside">
            <li>Blockchain-based gameplay with secure Wallet Bound Accounts.</li>
            <li>Unique Chog NFTs to represent players.</li>
            <li>Dynamic game board with interactive elements.</li>
            <li>Special rewards like Special Boxes for achieving milestones.</li>
            <li>Leaderboard to compete with other players.</li>
          </ul>
        </section>

        <section className="mt-10 text-center">
          <h3 className="text-3xl font-bold mb-5">Get Started</h3>
          <p className="mb-5">Ready to join the fun? Start by minting your NFT and creating your account!</p>
          <Link
            href="/account"
            className="bg-yellow-500 text-purple-900 py-3 px-6 rounded-lg font-bold hover:bg-yellow-300"
          >
            Go to Account
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Home;
