"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Gavel, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { placeBid } from "@/actions/bid";
import { formatCurrency } from "@/lib/utils";
import { getMinimumBid } from "@/lib/bid-validator";

interface BidFormProps {
  auctionId: string;
  currentBid: number;
  startingBid: number;
  endTime: Date | string;
  status: string;
  sellerId: string;
  onBidPlaced?: (newBid: number) => void;
}

export function BidForm({
  auctionId,
  currentBid,
  startingBid,
  endTime,
  status,
  sellerId,
  onBidPlaced,
}: BidFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bidAmount, setBidAmount] = useState("");

  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  const isEnded = new Date() >= end || status !== "ACTIVE";
  const isOwner = session?.user?.id === sellerId;
  const minimumBid = getMinimumBid(currentBid);

  function handleQuickBid(amount: number) {
    setBidAmount(amount.toString());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!session) {
      router.push(`/login?callbackUrl=/auctions/${auctionId}`);
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minimumBid) {
      toast.error(`Minimum bid is ${formatCurrency(minimumBid)}`);
      return;
    }

    startTransition(async () => {
      const result = await placeBid({ auctionId, amount });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Bid of ${formatCurrency(amount)} placed! You're winning.`);
        setBidAmount("");
        onBidPlaced?.(amount);
        router.refresh();
      }
    });
  }

  if (isEnded) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: "rgba(100,116,139,0.08)",
          border: "1px solid rgba(100,116,139,0.15)",
        }}
      >
        <p className="font-semibold" style={{ color: "hsl(215 20% 55%)" }}>
          This auction has ended
        </p>
        <p className="text-sm mt-1" style={{ color: "hsl(215 20% 40%)" }}>
          Final price: {formatCurrency(currentBid)}
        </p>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div
        className="rounded-2xl p-5 flex items-center gap-3"
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "hsl(239 84% 70%)" }} />
        <p className="text-sm" style={{ color: "hsl(239 84% 75%)" }}>
          You cannot bid on your own listing.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Current bid display */}
      <div className="mb-5">
        <p className="text-xs mb-1" style={{ color: "hsl(215 20% 45%)" }}>
          Current Highest Bid
        </p>
        <p
          className="text-3xl font-bold"
          style={{ color: "hsl(38 92% 55%)", fontFamily: "var(--font-outfit)" }}
        >
          {formatCurrency(currentBid)}
        </p>
        <p className="text-xs mt-1" style={{ color: "hsl(215 20% 45%)" }}>
          Minimum next bid:{" "}
          <span style={{ color: "hsl(213 31% 75%)" }}>
            {formatCurrency(minimumBid)}
          </span>
        </p>
      </div>

      {/* Quick bid buttons */}
      <div className="flex gap-2 mb-4">
        {[minimumBid, minimumBid * 1.1, minimumBid * 1.25].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleQuickBid(Math.ceil(amount * 100) / 100)}
            className="flex-1 py-2 text-xs rounded-lg btn-secondary transition-all hover:border-amber-500/30"
            style={{ fontFamily: "var(--font-outfit)", fontWeight: 600 }}
          >
            {formatCurrency(Math.ceil(amount * 100) / 100)}
          </button>
        ))}
      </div>

      {/* Custom bid form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
            style={{ color: "hsl(215 20% 50%)" }}
          >
            $
          </span>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={minimumBid.toFixed(2)}
            min={minimumBid}
            step="0.01"
            className="input-base pl-8 text-lg font-semibold"
            style={{ fontFamily: "var(--font-outfit)" }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !bidAmount}
          className="btn btn-bid w-full py-3.5 text-base font-bold"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Placing Bid…
            </>
          ) : (
            <>
              <Gavel className="w-5 h-5" />
              {session ? "Place Bid" : "Sign In to Bid"}
            </>
          )}
        </button>
      </form>

      {/* Info */}
      <div
        className="flex items-start gap-2 mt-4 p-3 rounded-xl"
        style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}
      >
        <TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "hsl(239 84% 70%)" }} />
        <p className="text-xs leading-relaxed" style={{ color: "hsl(215 20% 55%)" }}>
          By placing a bid, you commit to purchase this item if you win. Arrange a safe on-campus meeting for exchange.
        </p>
      </div>
    </div>
  );
}
