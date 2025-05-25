/* eslint-disable prettier/prettier */
import {
  Abi,
  AbiParameterToPrimitiveType,
  AbiParametersToPrimitiveTypes,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiFunction,
} from "abitype";
import type { ExtractAbiFunctionNames } from "abitype";
import { Address, Log, TransactionReceipt } from "viem";
import { Prettify } from "viem/dist/types/types/utils";
import { UseContractEventConfig, UseContractReadConfig, UseContractWriteConfig } from "wagmi";
import deployedContractsData from "~~/generated/deployedContracts";
// Changed import name
import scaffoldConfig from "~~/scaffold.config";

// Define the type based on the structure of deployedContracts.ts
export type GenericContractsDeclaration = {
  [chainId: number]: readonly {
    chainId: string;
    name: string;
    contracts: {
      [contractName: string]: {
        address: Address;
        abi: Abi;
      };
    };
  }[];
};

// Cast the imported data to the defined type
export const contracts: GenericContractsDeclaration = deployedContractsData as any;

type ConfiguredChainId = `${(typeof scaffoldConfig)["targetNetworks"]["id"]}`;

type IsContractDeclarationMissing<TYes, TNo> = typeof contracts extends { [key in ConfiguredChainId]: any }
  ? TNo
  : TYes;

type ContractsDeclaration = IsContractDeclarationMissing<GenericContractsDeclaration, typeof contracts>;

type Contracts = ContractsDeclaration[ConfiguredChainId extends keyof ContractsDeclaration
  ? ConfiguredChainId
  : never][0]["contracts"];

export type ContractName = keyof Contracts;

export type Contract<TContractName extends ContractName> = Contracts[TContractName];

type InferContractAbi<TContract> = TContract extends { abi: infer TAbi } ? (TAbi extends Abi ? TAbi : never) : never;

export type ContractAbi<TContractName extends ContractName = ContractName> = InferContractAbi<Contract<TContractName>>;

export type AbiFunctionInputs<TAbi extends Abi, TFunctionName extends string> = ExtractAbiFunction<
  TAbi,
  TFunctionName
>["inputs"];

export type AbiFunctionArguments<TAbi extends Abi, TFunctionName extends string> = AbiParametersToPrimitiveTypes<
  AbiFunctionInputs<TAbi, TFunctionName>
>;

export type AbiFunctionOutputs<TAbi extends Abi, TFunctionName extends string> = ExtractAbiFunction<
  TAbi,
  TFunctionName
>["outputs"];

export type AbiFunctionReturnType<TAbi extends Abi, TFunctionName extends string> = IsContractDeclarationMissing<
  any,
  AbiParametersToPrimitiveTypes<AbiFunctionOutputs<TAbi, TFunctionName>>[0]
>;

export type AbiEventInputs<TAbi extends Abi, TEventName extends ExtractAbiEventNames<TAbi>> = ExtractAbiEvent<
  TAbi,
  TEventName
>["inputs"];

export enum ContractCodeStatus {
  "LOADING",
  "DEPLOYED",
  "NOT_FOUND",
  "ERROR",
}

type AbiStateMutability = "pure" | "view" | "nonpayable" | "payable";
export type ReadAbiStateMutability = "view" | "pure";
export type WriteAbiStateMutability = "nonpayable" | "payable";

export type FunctionNamesWithInputs<
  TContractName extends ContractName,
  TAbiStateMutibility extends AbiStateMutability = AbiStateMutability,
> = Exclude<
  Extract<
    ContractAbi<TContractName> extends Array<infer T> ? T : never,
    {
      type: "function";
      stateMutability: TAbiStateMutibility;
    }
  >,
  {
    inputs: readonly [];
  }
> extends { name: infer TName }
  ? TName
  : never;

type Expand<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T;

type UnionToIntersection<U> = Expand<(U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never>;

type OptionalTupple<T> = T extends readonly [infer H, ...infer R] ? readonly [H | undefined, ...OptionalTupple<R>] : T;

type UseScaffoldArgsParam<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>>,
> = [TFunctionName] extends [FunctionNamesWithInputs<TContractName> & string]
  ? {
      args: OptionalTupple<UnionToIntersection<AbiFunctionArguments<ContractAbi<TContractName>, TFunctionName>>>;
    }
  : {
      args?: never;
    };

type ExtractStateMutability<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, WriteAbiStateMutability>,
> = NonNullable<
  Extract<
    ContractAbi<TContractName>[number],
    {
      name: TFunctionName;
      stateMutability: string;
    }
  >
> extends { stateMutability: infer S }
  ? S
  : never;

// Loosen UseScaffoldReadConfig to allow any string for functionName when the contract declaration is missing
export type UseScaffoldReadConfig<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, ReadAbiStateMutability> = any,
> = {
  contractName: TContractName;
  functionName: IsContractDeclarationMissing<string, TFunctionName>;
} & Omit<UseContractReadConfig, "chainId" | "abi" | "address" | "functionName" | "args"> &
  UseScaffoldArgsParam<TContractName, TFunctionName>;

export type UseScaffoldWriteConfig<
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, WriteAbiStateMutability>,
> = {
  contractName: TContractName;
  onBlockConfirmation?: (txnReceipt: TransactionReceipt) => void;
  blockConfirmations?: number;
} & IsContractDeclarationMissing<
  Partial<Omit<UseContractWriteConfig, "value"> & { value: string | undefined }>,
  (ExtractStateMutability<TContractName, TFunctionName> extends "payable"
    ? { value: string | undefined }
    : { value?: string }) & {
    functionName: TFunctionName;
  } & UseScaffoldArgsParam<TContractName, TFunctionName> &
    Omit<UseContractWriteConfig, "chainId" | "abi" | "address" | "functionName" | "args">
>;

export type UseScaffoldEventConfig<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>> & string,
> = {
  contractName: TContractName;
} & IsContractDeclarationMissing<
  Omit<UseContractEventConfig, "listener"> & {
    listener: (logs: Prettify<Omit<Log<bigint, number, any>, "args"> & { args: Record<string, unknown> }>[]) => void;
  },
  UseContractEventConfig<ContractAbi<TContractName>, TEventName>
>;

type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

type IndexedEventInputs<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
> = Extract<ArrayElement<AbiEventInputs<ContractAbi<TContractName>, TEventName>>, { indexed: true }>;

export type EventFilters<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
> = IsContractDeclarationMissing<
  any,
  IndexedEventInputs<TContractName, TEventName> extends never
    ? never
    : {
        [Key in IsContractDeclarationMissing<
          any,
          IndexedEventInputs<TContractName, TEventName> extends { name: infer N }
            ? N extends string
              ? N
              : never
            : never
        > as Key extends string ? Key : never]?: AbiParameterToPrimitiveType<
          Extract<IndexedEventInputs<TContractName, TEventName>, { name: Key & string } & { type: string }>
        >;
      }
>;

export type UseScaffoldEventHistoryConfig<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
> = {
  contractName: TContractName;
  eventName: IsContractDeclarationMissing<string, TEventName>;
  fromBlock: bigint;
  filters?: EventFilters<TContractName, TEventName>;
  blockData?: boolean;
  transactionData?: boolean;
  receiptData?: boolean;
};
