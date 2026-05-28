import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ImageGallery } from "@/components/auction/ImageGallery";
import { BidHistory } from "@/components/auction/BidHistory";
import { BidForm } from "@/components/auction/BidForm";
import { CountdownDisplay } from "@/components/auction/CountdownTimer";
import { getAuctionById } from "@/actions/auction";
import { isWatching } from "@/actions/watchlist";
import { WatchlistButton } from "@/components/auction/WatchlistButton";
import {
  formatCurrency,
  formatDate,
  getInitials,
  CATEGORY_LABELS,
  CONDITION_LABELS,
} from "@/lib/utils";
import {
  Eye,
  Tag,
  Calendar,
  GraduationCap,
  MessageSquare,
  Share2,
  Heart,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const auction = await getAuctionById(id);
  if (!auction) return { title: "Auction Not Found" };
  return {
    title: auction.title,
    description: auction.description.slice(0, 160),
  };
}

export default async function AuctionDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const [auction, watched] = await Promise.all([
    getAuctionById(id),
    isWatching(id),
  ]);

  if (!auction) notFound();

  const {
    title,
    description,
    images,
    currentBid,
    startingBid,
    endTime,
    status,
    category,
    condition,
    seller,
    bids,
    _count,
    highestBidderId,
    viewCount,
    createdAt,
    startTime,
    sellerId,
  } = auction;

  const isActive = status === "ACTIVE" && new Date() < endTime;

  return (
    <div className="app-page flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="page-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "hsl(215 20% 45%)" }}>
            <Link href="/auctions" className="hover:text-white transition-colors">
              Browse
            </Link>
            <span>/</span>
            <span style={{ color: "hsl(239 84% 70%)" }}>
              {CATEGORY_LABELS[category] || category}
            </span>
            <span>/</span>
            <span className="truncate max-w-xs">{title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left — Image gallery */}
            <div>
              <ImageGallery images={images} title={title} />
            </div>

            {/* Right — Details + Bidding */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="badge badge-category">
                    {CATEGORY_LABELS[category] || category}
                  </span>
                  <span className="badge badge-category">
                    <Tag className="w-2.5 h-2.5" />
                    {CONDITION_LABELS[condition] || condition}
                  </span>
                  {isActive ? (
                    <span className="badge badge-active">Live</span>
                  ) : (
                    <span className="badge badge-ended">{status}</span>
                  )}
                </div>

                <h1
                  className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {title}
                </h1>

                <div
                  className="flex items-center gap-4 text-sm"
                  style={{ color: "hsl(215 20% 45%)" }}
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {viewCount} views
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {_count.bids} bids
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Listed {formatDate(new Date(createdAt))}
                  </span>
                </div>
              </div>

              {/* Countdown */}
              {isActive && (
                <CountdownDisplay endTime={endTime} />
              )}

              {/* Bid form */}
              <BidForm
                auctionId={id}
                currentBid={currentBid}
                startingBid={startingBid}
                endTime={endTime}
                status={status}
                sellerId={sellerId}
              />

              {/* Starting bid info */}
              <div
                className="flex items-center justify-between text-sm px-1"
                style={{ color: "hsl(215 20% 45%)" }}
              >
                <span>
                  Starting bid: <span className="font-medium" style={{ color: "hsl(213 31% 70%)" }}>
                    {formatCurrency(startingBid)}
                  </span>
                </span>
                {endTime && (
                  <span>
                    Ends: <span style={{ color: "hsl(213 31% 70%)" }}>
                      {formatDate(new Date(endTime))}
                    </span>
                  </span>
                )}
              </div>

              {/* Seller info */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "hsl(215 20% 40%)" }}>
                  Listed By
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {getInitials(seller.name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{seller.name || "Anonymous"}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <GraduationCap className="w-3.5 h-3.5" style={{ color: "hsl(239 84% 70%)" }} />
                      <span className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>
                        {seller.university || "University Student"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(142 71% 45%)" }}>
                    <ShieldCheck className="w-4 h-4" />
                    Verified
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <WatchlistButton auctionId={id} initialIsWatched={watched} />
                <button className="btn btn-secondary flex-1 gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Description + Bid History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2
                className="text-xl font-bold mb-5"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Item Description
              </h2>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "hsl(215 20% 60%)" }}
                >
                  {description}
                </p>
              </div>

              {/* Campus Exchange Info */}
              <div
                className="mt-5 rounded-2xl p-5 flex items-start gap-4"
                style={{
                  background: "rgba(34,197,94,0.05)",
                  border: "1px solid rgba(34,197,94,0.15)",
                }}
              >
                <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(142 71% 45%)" }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "hsl(142 71% 55%)" }}>
                    Safe Campus Exchange
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(215 20% 50%)" }}>
                    All exchanges happen on campus between verified students. We recommend meeting in a public, well-lit campus location such as the library or student union.
                  </p>
                </div>
              </div>
            </div>

            {/* Bid History */}
            <div>
              <h2
                className="text-xl font-bold mb-5"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Bid History
              </h2>
              <BidHistory
                bids={bids as Parameters<typeof BidHistory>[0]["bids"]}
                winnerId={highestBidderId}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
