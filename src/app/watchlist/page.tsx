import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { getWatchlist } from "@/actions/watchlist";
import { getCurrentUser } from "@/lib/auth";
import { Heart, Gavel } from "lucide-react";
import Link from "next/link";
import type { AuctionWithRelations } from "@/types";

export const metadata = {
  title: "My Watchlist",
  description: "Auctions you're watching.",
};

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/watchlist");

  const watchlist = await getWatchlist();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="page-container">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <Heart className="w-5 h-5" style={{ color: "hsl(0 84% 65%)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                My Watchlist
              </h1>
              <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>
                {watchlist.length} saved auction{watchlist.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {watchlist.length === 0 ? (
            <div
              className="rounded-2xl p-16 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Gavel className="w-16 h-16 mx-auto mb-4" style={{ color: "hsl(215 20% 30%)" }} />
              <h2 className="text-xl font-semibold mb-2">Nothing saved yet</h2>
              <p className="text-sm mb-6" style={{ color: "hsl(215 20% 45%)" }}>
                Browse auctions and click Watch to save items here.
              </p>
              <Link href="/auctions" className="btn btn-primary">
                Browse Auctions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {watchlist.map((item) => (
                <AuctionCard
                  key={item.auction.id}
                  auction={item.auction as unknown as AuctionWithRelations}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
