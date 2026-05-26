"use client";

import Link from "next/link";
import { Eye, Tag, Zap } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { formatCurrency, getInitials, truncate, CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/utils";
import type { AuctionWithRelations } from "@/types";

interface AuctionCardProps {
  auction: AuctionWithRelations;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const { id, title, images, currentBid, startingBid, endTime, category, condition, seller, _count, status } = auction;

  const mainImage = images[0] || "/placeholder-auction.jpg";
  const bidCount = _count.bids;
  const isActive = status === "ACTIVE";
  const percentAbove = startingBid > 0
    ? Math.round(((currentBid - startingBid) / startingBid) * 100)
    : 0;

  return (
    <Link
      href={`/auctions/${id}`}
      className="group block rounded-2xl overflow-hidden glass card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(222_47%_10%)]">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1495121605193-b116b5b9c40e?w=400&q=60";
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="badge badge-category">{CATEGORY_LABELS[category] || category}</span>
        </div>

        {/* Timer */}
        {isActive && (
          <div className="absolute top-3 right-3">
            <CountdownTimer endTime={endTime} size="sm" />
          </div>
        )}

        {/* Ended/Sold badge */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span
              className="badge text-sm px-4 py-2"
              style={{
                background: status === "SOLD" ? "rgba(245,158,11,0.3)" : "rgba(100,116,139,0.3)",
                color: status === "SOLD" ? "hsl(38 92% 65%)" : "hsl(215 20% 65%)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: "0.8rem",
              }}
            >
              {status === "SOLD" ? "Sold" : "Ended"}
            </span>
          </div>
        )}

        {/* Bid count */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.75)" }}>
            <Zap className="w-3 h-3" />
            {bidCount} {bidCount === 1 ? "bid" : "bids"}
          </span>
        </div>

        {/* View count */}
        <div className="absolute bottom-3 right-3">
          <span className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            <Eye className="w-3 h-3" />
            {auction.viewCount || 0}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Condition */}
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-3 h-3" style={{ color: "hsl(215 20% 45%)" }} />
          <span className="text-xs" style={{ color: "hsl(215 20% 50%)" }}>
            {CONDITION_LABELS[condition] || condition}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight mb-3 line-clamp-2 group-hover:text-white transition-colors">
          {truncate(title, 60)}
        </h3>

        {/* Bid info */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs mb-0.5" style={{ color: "hsl(215 20% 45%)" }}>
              {isActive ? "Current Bid" : "Final Bid"}
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: "hsl(38 92% 55%)", fontFamily: "var(--font-outfit)" }}
            >
              {formatCurrency(currentBid)}
            </p>
          </div>
          {percentAbove > 0 && (
            <div
              className="text-xs font-medium px-2 py-1 rounded-lg"
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "hsl(142 71% 50%)",
              }}
            >
              +{percentAbove}%
            </div>
          )}
        </div>

        {/* Seller */}
        <div
          className="flex items-center gap-2 mt-3 pt-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
          >
            {getInitials(seller.name)}
          </div>
          <span className="text-xs truncate" style={{ color: "hsl(215 20% 50%)" }}>
            {seller.name || "Anonymous"} · {seller.university || "Student"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader
export function AuctionCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden glass">
      <div className="aspect-[4/3] shimmer bg-[hsl(222_47%_10%)]" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded shimmer bg-[hsl(222_47%_12%)]" />
        <div className="h-4 w-full rounded shimmer bg-[hsl(222_47%_12%)]" />
        <div className="h-4 w-3/4 rounded shimmer bg-[hsl(222_47%_12%)]" />
        <div className="h-6 w-24 rounded shimmer bg-[hsl(222_47%_12%)]" />
      </div>
    </div>
  );
}
