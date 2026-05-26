"use client";

import { useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/actions/watchlist";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface WatchlistButtonProps {
  auctionId: string;
  initialIsWatched: boolean;
}

export function WatchlistButton({ auctionId, initialIsWatched }: WatchlistButtonProps) {
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    // Optimistic toggle
    const nextState = !isWatched;
    setIsWatched(nextState);

    startTransition(async () => {
      let result;
      if (nextState) {
        result = await addToWatchlist(auctionId);
      } else {
        result = await removeFromWatchlist(auctionId);
      }

      if (result && "error" in result) {
        toast.error(result.error as string);
        setIsWatched(!nextState); // Rollback on error
      } else {
        toast.success(nextState ? "Added to watchlist" : "Removed from watchlist");
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="btn btn-secondary flex-1 gap-2 transition-all hover:text-red-400 disabled:opacity-50"
      style={{
        borderColor: isWatched ? "rgba(239, 68, 68, 0.4)" : undefined,
        background: isWatched ? "rgba(239, 68, 68, 0.08)" : undefined,
      }}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${isWatched ? "scale-110" : ""}`}
        fill={isWatched ? "hsl(0 84% 65%)" : "none"}
        style={{
          color: isWatched ? "hsl(0 84% 65%)" : "currentColor",
        }}
      />
      {isWatched ? "Watching" : "Watch"}
    </button>
  );
}
