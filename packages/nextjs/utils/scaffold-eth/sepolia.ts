import { defineChain } from "viem";
import { sepolia } from "wagmi/chains";

export const customSepolia = defineChain({
  ...sepolia,
  name: "Sepolia",
});
