import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { getCurrentUser } from "@/lib/auth";
import { getUserAuctions } from "@/actions/auction";
import { getUserBids } from "@/actions/bid";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  Gavel,
  TrendingUp,
  GraduationCap,
  Clock,
  CheckCircle2,
  Package,
  ShieldCheck,
} from "lucide-react";
import type { AuctionWithRelations } from "@/types";

export const metadata = {
  title: "My Profile",
  description: "Your CampusBid seller and bidder dashboard.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/profile");

  const [myAuctions, myBids] = await Promise.all([
    getUserAuctions(),
    getUserBids(),
  ]);

  const activeAuctions = myAuctions.filter((a) => a.status === "ACTIVE");
  const soldAuctions = myAuctions.filter((a) => a.status === "SOLD");
  const wonBids = myBids.filter((b) => b.auction.status === "SOLD");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="page-container">
          {/* Profile header */}
          <div
            className="relative rounded-3xl p-8 mb-10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl"
              style={{ background: "rgba(99,102,241,0.08)" }}
            />
            <div className="relative z-10 flex items-start gap-6 flex-wrap">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              >
                {getInitials(user.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {user.name || "Anonymous Student"}
                  </h1>
                  <span className="badge badge-active">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <GraduationCap className="w-4 h-4" style={{ color: "hsl(239 84% 70%)" }} />
                  <span className="text-sm" style={{ color: "hsl(215 20% 55%)" }}>
                    {(user as { university?: string }).university || "University Student"}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: "hsl(215 20% 45%)" }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              {
                icon: Package,
                label: "Active Listings",
                value: activeAuctions.length,
                color: "hsl(239 84% 70%)",
                bg: "rgba(99,102,241,0.1)",
              },
              {
                icon: CheckCircle2,
                label: "Items Sold",
                value: soldAuctions.length,
                color: "hsl(142 71% 45%)",
                bg: "rgba(34,197,94,0.1)",
              },
              {
                icon: Gavel,
                label: "Total Bids",
                value: myBids.length,
                color: "hsl(38 92% 55%)",
                bg: "rgba(245,158,11,0.1)",
              },
              {
                icon: TrendingUp,
                label: "Auctions Won",
                value: wonBids.length,
                color: "hsl(0 84% 65%)",
                bg: "rgba(239,68,68,0.1)",
              },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p
                    className="text-2xl font-bold"
                    style={{ color, fontFamily: "var(--font-outfit)" }}
                  >
                    {value}
                  </p>
                  <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* My Listings */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                My Listings
              </h2>
              <a href="/create-auction" className="btn btn-primary text-sm py-2 px-4">
                + New Listing
              </a>
            </div>

            {myAuctions.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Package className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(215 20% 30%)" }} />
                <p className="text-sm" style={{ color: "hsl(215 20% 45%)" }}>
                  You haven't listed anything yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {myAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={{
                      ...auction,
                      seller: {
                        id: user.id!,
                        name: user.name ?? null,
                        image: user.image ?? null,
                        university: (user as any).university ?? null,
                      },
                      bids: [],
                      _count: {
                        bids: auction._count.bids,
                        watchlistedBy: 0,
                      },
                    } as unknown as AuctionWithRelations}
                  />
                ))}
              </div>
            )}
          </section>

          {/* My Bid Activity */}
          <section>
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
              Bid Activity
            </h2>

            {myBids.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Gavel className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(215 20% 30%)" }} />
                <p className="text-sm" style={{ color: "hsl(215 20% 45%)" }}>
                  You haven't placed any bids yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myBids.slice(0, 10).map((bid) => (
                  <a
                    key={bid.id}
                    href={`/auctions/${bid.auctionId}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <img
                      src={bid.auction.images[0] || ""}
                      alt={bid.auction.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{bid.auction.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" style={{ color: "hsl(215 20% 45%)" }} />
                        <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>
                          {formatDate(new Date(bid.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-bold"
                        style={{ color: "hsl(38 92% 55%)", fontFamily: "var(--font-outfit)" }}
                      >
                        {formatCurrency(bid.amount)}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{
                          color:
                            bid.auction.status === "ACTIVE"
                              ? "hsl(142 71% 45%)"
                              : "hsl(215 20% 45%)",
                        }}
                      >
                        {bid.auction.status === "ACTIVE" ? "Active" : bid.auction.status}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
