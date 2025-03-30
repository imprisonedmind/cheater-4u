"use client";

import { FC, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleCheaterStatus } from "@/app/users/actions";
import { Swords } from "lucide-react";
import { Suspect } from "@/lib/types/suspect";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClientMarkAsCheaterProps {
  isAuthorized: boolean;
  suspect: Suspect;
}

export const ClientMarkAsCheater: FC<ClientMarkAsCheaterProps> = ({
  isAuthorized,
  suspect,
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isAuthorized) return null;

  const handleClick = () => {
    startTransition(async () => {
      const successMsg = suspect.cheater
        ? "User unmarked as cheater"
        : "User marked as cheater";

      try {
        await toggleCheaterStatus(suspect.id, !suspect.cheater);
        router.refresh();
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to update cheater status");
      } finally {
        if (!isPending) toast.success(successMsg);
      }
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      className={suspect.cheater ? "!bg-blue-600" : "!bg-orange-500"}
      onClick={handleClick}
    >
      <Swords className="mr-2 h-4 w-4" />
      {isPending
        ? "Updating..."
        : suspect.cheater
          ? "Unmark Cheater"
          : "Mark as Cheater"}
    </Button>
  );
};
