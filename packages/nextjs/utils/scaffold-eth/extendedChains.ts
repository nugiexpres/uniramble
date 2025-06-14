import { Chain } from "wagmi";

export const monadTestnet = {
  id: 10143, // Chain ID Monad Testnet
  name: "Monad Testnet",
  network: "monadTestnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com/",
    },
  },
  testnet: true,
} as const satisfies Chain;

export const extendedChains = {
  monadTestnet,
  // chains lainnya...
};
