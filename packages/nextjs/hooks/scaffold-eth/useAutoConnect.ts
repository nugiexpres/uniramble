import { useEffect } from "react";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { Connector, useAccount, useConnect } from "wagmi";
import { hardhat } from "wagmi/chains";
import scaffoldConfig from "~~/scaffold.config";
import { burnerWalletId, defaultBurnerChainId } from "~~/services/web3/wagmi-burner/BurnerConnector";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const SCAFFOLD_WALLET_STORAGE_KEY = "scaffoldEth2.wallet";
const WAGMI_WALLET_STORAGE_KEY = "wagmi.wallet";
const SESSION_WALLET_STORAGE_KEY = "scaffoldEth2.sessionWallet";

/**
 * This function will get the initial wallet connector (if any), the app will connect to
 * @param previousWalletId
 * @param connectors
 * @returns
 */
const getInitialConnector = (
  previousWalletId: string,
  connectors: Connector[],
): { connector: Connector | undefined; chainId?: number } | undefined => {
  const targetNetwork = getTargetNetwork();

  const allowBurner = scaffoldConfig.onlyLocalBurnerWallet ? targetNetwork.id === hardhat.id : true;

  if (!previousWalletId) {
    // The user was not connected to a wallet
    if (allowBurner && scaffoldConfig.walletAutoConnect) {
      const connector = connectors.find(f => f.id === burnerWalletId);
      return { connector, chainId: defaultBurnerChainId };
    }
  } else {
    // the user was connected to wallet
    if (scaffoldConfig.walletAutoConnect) {
      if (previousWalletId === burnerWalletId && !allowBurner) {
        return;
      }

      const connector = connectors.find(f => f.id === previousWalletId);
      return { connector };
    }
  }

  return undefined;
};

/**
 * Automatically connect to a wallet/connector based on config and prior wallet
 */
export const useAutoConnect = (): void => {
  const wagmiWalletValue = useReadLocalStorage<string>(WAGMI_WALLET_STORAGE_KEY);
  const sessionWalletValue = typeof window !== "undefined" ? sessionStorage.getItem(SESSION_WALLET_STORAGE_KEY) : null;
  const [, setWalletId] = useLocalStorage<string>(SCAFFOLD_WALLET_STORAGE_KEY, wagmiWalletValue ?? "");
  const connectState = useConnect();
  const accountState = useAccount();

  useEffect(() => {
    // Clear wallet cache on load if "Remember Me" is not enabled
    if (typeof window !== "undefined" && !wagmiWalletValue) {
      sessionStorage.removeItem(SESSION_WALLET_STORAGE_KEY);
      setWalletId("");
    }

    if (typeof window !== "undefined" && accountState.isConnected) {
      // User is connected, set walletName
      setWalletId(accountState.connector?.id ?? "");
      sessionStorage.setItem(SESSION_WALLET_STORAGE_KEY, accountState.connector?.id ?? "");
    } else if (typeof window !== "undefined") {
      // User has disconnected, reset walletName
      setWalletId("");
      sessionStorage.removeItem(SESSION_WALLET_STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountState.isConnected, accountState.connector?.name]);

  useEffect(() => {
    // Ensure no auto-connect happens unless session wallet exists
    if (!scaffoldConfig.walletAutoConnect || !sessionWalletValue) return;

    const initialConnector = getInitialConnector(sessionWalletValue, connectState.connectors);
    if (initialConnector?.connector) {
      connectState.connect({ connector: initialConnector.connector, chainId: initialConnector.chainId });
    }
  }, [connectState, sessionWalletValue]);
};
