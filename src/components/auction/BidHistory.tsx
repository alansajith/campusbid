import { formatCurrency, formatRelativeTime, getInitials } from "@/lib/utils";
import type { BidWithUser } from "@/types";
import { TrendingUp } from "lucide-react";

interface BidHistoryProps {
  bids: BidWithUser[];
  winnerId?: string | null;
}

export function BidHistory({ bids, winnerId }: BidHistoryProps) {
  if (bids.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <TrendingUp className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(215 20% 35%)" }} />
        <p className="text-sm" style={{ color: "hsl(215 20% 45%)" }}>
          No bids yet. Be the first to bid!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bids.map((bid, index) => {
        const isHighest = index === 0;
        const isWinner = winnerId && bid.bidder.id === winnerId;

        return (
          <div
            key={bid.id}
            className="flex items-center justify-between p-3 rounded-xl transition-colors"
            style={{
              background: isHighest
                ? "rgba(245,158,11,0.08)"
                : "rgba(255,255,255,0.03)",
              border: isHighest
                ? "1px solid rgba(245,158,11,0.2)"
                : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: isHighest ? "hsl(38 92% 40%)" : "rgba(99,102,241,0.3)" }}
              >
                {bid.bidder.image ? (
                  <img
                    src={bid.bidder.image}
                    alt={bid.bidder.name || ""}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(bid.bidder.name)
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {bid.bidder.name || "Anonymous"}
                  </p>
                  {isHighest && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: "rgba(245,158,11,0.2)", color: "hsl(38 92% 60%)" }}
                    >
                      Highest
                    </span>
                  )}
                  {isWinner && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: "rgba(34,197,94,0.15)", color: "hsl(142 71% 55%)" }}
                    >
                      Winner
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>
                  {formatRelativeTime(new Date(bid.createdAt))}
                </p>
              </div>
            </div>

            <p
              className="text-base font-bold"
              style={{
                color: isHighest ? "hsl(38 92% 55%)" : "hsl(213 31% 75%)",
                fontFamily: "var(--font-outfit)",
              }}
            >
              {formatCurrency(bid.amount)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
