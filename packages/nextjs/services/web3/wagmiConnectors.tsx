import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  // hahaWallet, // Added
  metaMaskWallet,
  okxWallet,
  rabbyWallet, // Added Rabby Wallet
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains } from "wagmi";
import * as chains from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import scaffoldConfig from "~~/scaffold.config";
import { burnerWalletConfig } from "~~/services/web3/wagmi-burner/burnerWalletConfig";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { extendedChains } from "~~/utils/scaffold-eth/extendedChains";

const configuredNetwork = getTargetNetwork();
const { onlyLocalBurnerWallet } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const enabledChains =
  configuredNetwork.id === 1 ? [configuredNetwork] : [configuredNetwork, chains.mainnet, extendedChains.monadTestnet];

/**
 * Chains for the app
 */
export const appChains = configureChains(
  enabledChains,
  [
    alchemyProvider({
      apiKey: scaffoldConfig.alchemyApiKey,
    }),
    publicProvider(),
  ],
  {
    // We might not need this checkout https://github.com/scaffold-eth/scaffold-eth-2/pull/45#discussion_r1024496359, will test and remove this before merging
    stallTimeout: 3_000,
    // Sets pollingInterval if using chain's other than local hardhat chain
    ...(configuredNetwork.id !== chains.hardhat.id
      ? {
          pollingInterval: scaffoldConfig.pollingInterval,
        }
      : {}),
  },
);

const walletsOptions = { chains: appChains.chains, projectId: scaffoldConfig.walletConnectProjectId };
const wallets = [
  metaMaskWallet({ ...walletsOptions, shimDisconnect: true }), // Tambahkan shimDisconnect
  walletConnectWallet({ ...walletsOptions }),
  okxWallet({ ...walletsOptions, shimDisconnect: true }), // Tambahkan shimDisconnect
  rabbyWallet({ ...walletsOptions }), // Added Rabbit Wallet
  // hahaWallet(walletsOptions), // Added
  ...(configuredNetwork.id === chains.hardhat.id || !onlyLocalBurnerWallet
    ? [burnerWalletConfig({ chains: [appChains.chains[0]] })]
    : []),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets,
  },
]);

// tombol "Disconnect" di UI Anda
export const DisconnectButton = ({ disconnect }: { disconnect: () => void }) => (
  <button onClick={disconnect}>Disconnect</button>
);
