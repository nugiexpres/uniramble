import { useEffect, useState } from "react";
import Link from "next/link";
import { notionists } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { useCopyToClipboard } from "react-use";
import { isAddress } from "viem";
import { useEnsAvatar, useEnsName } from "wagmi";
import { hardhat } from "wagmi/chains";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { getBlockExplorerAddressLink, getTargetNetwork } from "~~/utils/scaffold-eth";

type TAddressProps = {
  address?: string;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
};

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
};

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */
export const Address = ({ address, disableAddressLink, format, size = "base" }: TAddressProps) => {
  const [ens, setEns] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);
  const [, copyToClipboard] = useCopyToClipboard();

  const { data: fetchedEns } = useEnsName({ address, enabled: isAddress(address ?? ""), chainId: 1 });
  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEns,
    enabled: Boolean(fetchedEns),
    chainId: 1,
    cacheTime: 30_000,
  });

  const avatarSvg = createAvatar(notionists, {
    seed: (address ?? "default").toLowerCase(),
    size: 64,
    backgroundColor: ["transparent"],
  }).toString();

  useEffect(() => {
    setEns(fetchedEns ?? null);
  }, [fetchedEns]);

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar ?? null);
  }, [fetchedEnsAvatar]);

  if (!address) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAddress(address)) {
    return <span className="text-error">Wrong address</span>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(getTargetNetwork(), address);
  let displayAddress = address.slice(0, 5) + "..." + address.slice(-4);

  if (ens) {
    displayAddress = ens;
  } else if (format === "long") {
    displayAddress = address;
  }

  const handleCopy = () => {
    copyToClipboard(address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 800);
  };

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {ensAvatar ? (
          // eslint-disable-next-line
          <img
            className="rounded-full"
            src={ensAvatar}
            width={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
            height={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
            alt={`${address} avatar`}
          />
        ) : (
          <div
            className="mx-auto rounded-full overflow-hidden"
            style={{
              width: (blockieSizeMap[size] * 24) / blockieSizeMap["base"],
              height: (blockieSizeMap[size] * 24) / blockieSizeMap["base"],
            }}
            dangerouslySetInnerHTML={{ __html: avatarSvg }}
          />
        )}
      </div>

      {/* Address */}
      {disableAddressLink ? (
        <span className={`ml-1.5 text-${size} font-normal`}>{displayAddress}</span>
      ) : getTargetNetwork().id === hardhat.id ? (
        <span className={`ml-1.5 text-${size} font-normal`}>
          <Link href={blockExplorerAddressLink}>{displayAddress}</Link>
        </span>
      ) : (
        <a
          className={`ml-1.5 text-${size} font-normal`}
          target="_blank"
          href={blockExplorerAddressLink}
          rel="noopener noreferrer"
        >
          {displayAddress}
        </a>
      )}

      {/* Copy Icon */}
      {addressCopied ? (
        <CheckCircleIcon className="ml-1.5 text-xl text-green-500 h-5 w-5 cursor-pointer" aria-hidden="true" />
      ) : (
        <DocumentDuplicateIcon
          onClick={handleCopy}
          className="ml-1.5 text-xl text-sky-600 h-5 w-5 cursor-pointer"
          aria-hidden="true"
          title="Copy address"
        />
      )}
    </div>
  );
};
