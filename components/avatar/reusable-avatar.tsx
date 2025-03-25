import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SteamAvatarProps = {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: number; // in pixels
};

export function SteamAvatar({
  src,
  alt,
  fallback,
  size = 40,
}: SteamAvatarProps) {
  const dimension = `${size}px`;

  return (
    <Avatar style={{ width: dimension, height: dimension }}>
      <AvatarImage src={src || ""} alt={alt} />
      <AvatarFallback className="text-sm">
        {fallback?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
