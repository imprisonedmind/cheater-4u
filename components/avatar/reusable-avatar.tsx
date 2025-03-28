import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SteamAvatarProps = {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
};

export function SteamAvatar({
  src,
  alt,
  fallback,
  className = "size-8 rounded-full",
}: SteamAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={src || ""} alt={alt} />
      <AvatarFallback className="text-sm">
        {fallback?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
