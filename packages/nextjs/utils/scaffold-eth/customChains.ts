import dotenv from "dotenv";
import { defineChain } from "viem";

dotenv.config();

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  network: "monadTestnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [`https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    },
    public: {
      http: [`https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet Explorer",
      url: "https://testnet-explorer.monad.xyz",
    },
  },
});
