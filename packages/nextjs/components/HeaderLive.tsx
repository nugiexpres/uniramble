"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export const HeaderLive = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-purple-700 py-4 shadow-lg relative z-40">
      <div className="container mx-auto px-5 flex justify-between items-center relative">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 focus:outline-none">
            <Image src="/assets/uniramble-logo.png" alt="UniRamble Logo" width={80} height={80} />
            <span className="text-2xl font-bold text-white hidden md:inline">UniRamble</span>
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/" className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg bg-black hover:bg-purple-500">
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
          <Link
            href="/leaderboard"
            className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg bg-black hover:bg-purple-500"
          >
            Leaderboard
          </Link>
          <ConnectButton />
        </nav>

        {/* Mobile Wallet Button (Always Visible) */}
        <div className="md:hidden flex items-center z-50">
          <ConnectButton />
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-purple-800 text-white flex flex-col items-start gap-2 px-5 py-4 rounded-b-xl shadow-lg md:hidden animate-fade-down z-50">
            <Link href="/" onClick={() => setIsOpen(false)} className="w-full block hover:text-yellow-300">
              Home
            </Link>
            <Link href="/account" onClick={() => setIsOpen(false)} className="w-full block hover:text-yellow-300">
              Account
            </Link>
            <Link href="/uniboard" onClick={() => setIsOpen(false)} className="w-full block hover:text-yellow-300">
              GameBoard
            </Link>
            <Link href="/leaderboard" onClick={() => setIsOpen(false)} className="w-full block hover:text-yellow-300">
              Leaderboard
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
