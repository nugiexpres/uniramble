import { createAvatar } from "@dicebear/core";
import * as notionists from "@dicebear/notionists";
import { AvatarComponent } from "@rainbow-me/rainbowkit";

export const BlockieAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  if (ensImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="rounded-full" src={ensImage} width={size} height={size} alt={`${address} avatar`} />;
  }

  const avatarSvg = createAvatar(notionists, {
    seed: address?.toLowerCase() || "default",
    size: 64, // internal SVG pixel size
    backgroundColor: ["transparent"],
  }).toString();

  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: avatarSvg }}
    />
  );
};
