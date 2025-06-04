import { Abi, ExtractAbiFunctionNames } from "abitype";
import { UseContractWriteConfig, useContractWrite, useNetwork } from "wagmi";
import { getParsedError } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { ContractAbi, ContractName, UseScaffoldWriteConfig } from "~~/utils/scaffold-eth/contract";

/**
 * @dev wrapper for wagmi's useContractWrite hook(with config prepared by usePrepareContractWrite hook) which loads in deployed contract abi and address automatically
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - arguments for the function
 * @param config.value - value in ETH that will be sent with transaction
 */
export const useScaffoldContractWrite = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
>({
  contractName,
  functionName,
  args,
  value,
  onBlockConfirmation,
  blockConfirmations,
  ...writeConfig
}: UseScaffoldWriteConfig<TContractName, TFunctionName>) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName) as {
    data: { address: `0x${string}`; abi: Abi } | undefined;
  };
  const { chain } = useNetwork();
  const writeTx = useTransactor();

  // Convert value to bigint only if it’s string | number | bigint
  const safeValue =
    typeof value === "string" || typeof value === "number" || typeof value === "bigint" ? BigInt(value) : undefined;

  const wagmiContractWrite = useContractWrite({
    chainId: chain?.id,
    address: deployedContractData?.address as `0x${string}`,
    abi: deployedContractData?.abi as Abi,
    functionName: functionName as string,
    args: args as readonly unknown[] | undefined,
    value: safeValue ? BigInt(safeValue) : undefined,
    ...(writeConfig as Partial<UseContractWriteConfig>),
  });

  const sendContractWriteTx = async () => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forgot to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== getTargetNetwork().id) {
      notification.error("You on the wrong network");
      return;
    }

    if (wagmiContractWrite.writeAsync) {
      try {
        await writeTx(() => wagmiContractWrite.writeAsync(), {
          onBlockConfirmation,
          blockConfirmations,
        });
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  return {
    ...wagmiContractWrite,
    writeAsync: sendContractWriteTx,
  };
};
