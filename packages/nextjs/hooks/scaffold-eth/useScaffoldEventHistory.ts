import { useEffect, useState } from "react";
import { Abi, AbiEvent, ExtractAbiEventNames } from "abitype";
import { Hash } from "viem";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";
import { ContractAbi, ContractName, UseScaffoldEventHistoryConfig } from "~~/utils/scaffold-eth/contract";

/**
 * @dev reads events from a deployed contract
 * @param config - The config settings
 * @param config.contractName - deployed contract name
 * @param config.eventName - name of the event to listen for
 * @param config.fromBlock - the block number to start reading events from
 * @param config.filters - filters to be applied to the event (parameterName: value)
 * @param config.blockData - if set to true it will return the block data for each event (default: false)
 * @param config.transactionData - if set to true it will return the transaction data for each event (default: false)
 * @param config.receiptData - if set to true it will return the receipt data for each event (default: false)
 */
export const useScaffoldEventHistory = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
>({
  contractName,
  eventName,
  fromBlock,
  filters,
  blockData,
  transactionData,
  receiptData,
}: UseScaffoldEventHistoryConfig<TContractName, TEventName>) => {
  const [events, setEvents] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { data: deployedContractData, isLoading: deployedContractLoading } = (useDeployedContractInfo<TContractName>(
    contractName,
  ) as unknown as {
    data: { abi: Abi; address: string } | null;
    isLoading: boolean;
  }) || { data: null, isLoading: false };
  const publicClient = usePublicClient();

  useEffect(() => {
    async function readEvents() {
      try {
        if (!deployedContractData) {
          throw new Error("Contract not found");
        }

        const event = (deployedContractData?.abi as Abi | undefined)?.find(
          (part): part is AbiEvent => part.type === "event" && "name" in part && part.name === eventName,
        ) as AbiEvent | undefined;

        if (!event) {
          throw new Error(`Event ${eventName} not found in the ABI`);
        }

        const logs = await publicClient.getLogs({
          address: deployedContractData?.address,
          event,
          args: filters as any, // TODO: check if it works and fix type
          fromBlock,
        });
        const newEvents = [];
        for (let i = logs.length - 1; i >= 0; i--) {
          newEvents.push({
            log: logs[i],
            args: logs[i].args,
            block:
              blockData && logs[i].blockHash === null
                ? null
                : await publicClient.getBlock({ blockHash: logs[i].blockHash as Hash }),
            transaction:
              transactionData && logs[i].transactionHash !== null
                ? await publicClient.getTransaction({ hash: logs[i].transactionHash as Hash })
                : null,
            receipt:
              receiptData && logs[i].transactionHash !== null
                ? await publicClient.getTransactionReceipt({ hash: logs[i].transactionHash as Hash })
                : null,
          });
        }
        setEvents(newEvents);
        setError(undefined);
      } catch (e: any) {
        console.error(e);
        setEvents(undefined);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    }
    if (!deployedContractLoading) {
      readEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    publicClient,
    fromBlock,
    contractName,
    eventName,
    deployedContractLoading,
    deployedContractData?.address,
    deployedContractData,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(filters, replacer),
    blockData,
    transactionData,
    receiptData,
  ]);

  return {
    data: events,
    isLoading: isLoading,
    error: error,
  };
};
