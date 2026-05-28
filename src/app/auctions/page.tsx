import { Suspense } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { AuctionCard, AuctionCardSkeleton } from "@/components/auction/AuctionCard";
import { getAuctions } from "@/actions/auction";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/utils";
import { Search, SlidersHorizontal, Gavel } from "lucide-react";
import Link from "next/link";
import type { AuctionCategory, AuctionCondition } from "@/generated/prisma";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    condition?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Browse Auctions",
  description: "Browse active campus auctions and place your bids.",
};

async function AuctionGrid({ searchParams }: { searchParams: Awaited<PageProps["searchParams"]> }) {
  const page = parseInt(searchParams.page || "1");

  const { auctions, total, pages } = await getAuctions({
    category: searchParams.category as AuctionCategory | undefined,
    condition: searchParams.condition as AuctionCondition | undefined,
    search: searchParams.search,
    sortBy: (searchParams.sort as "endTime" | "currentBid" | "createdAt") || "endTime",
    sortOrder: "asc",
    page,
    pageSize: 12,
  });

  if (auctions.length === 0) {
    return (
      <div className="col-span-full text-center py-20">
        <Gavel className="w-16 h-16 mx-auto mb-4" style={{ color: "hsl(215 20% 30%)" }} />
        <h3 className="text-xl font-semibold mb-2">No auctions found</h3>
        <p className="text-sm mb-6" style={{ color: "hsl(215 20% 45%)" }}>
          {searchParams.search
            ? `No results for "${searchParams.search}"`
            : "No active auctions match your filters"}
        </p>
        <Link href="/create-auction" className="btn btn-primary">
          List the First Item
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full flex items-center justify-between mb-2">
        <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>
          {total} auction{total !== 1 ? "s" : ""} found
        </p>
      </div>
      {auctions.map((auction) => (
        <AuctionCard key={auction.id} auction={auction as unknown as Parameters<typeof AuctionCard>[0]["auction"]} />
      ))}

      {/* Pagination */}
      {pages > 1 && (
        <div className="col-span-full flex justify-center gap-2 mt-8">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/auctions?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                p === page ? "btn btn-primary py-0 px-0" : "btn btn-secondary py-0 px-0"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default async function AuctionsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const categories = Object.entries(CATEGORY_LABELS);
  const conditions = Object.entries(CONDITION_LABELS);

  const sortOptions = [
    { value: "endTime", label: "Ending Soon" },
    { value: "currentBid", label: "Highest Bid" },
    { value: "createdAt", label: "Newest First" },
  ];

  function buildFilterUrl(key: string, value: string | null) {
    const newParams = { ...params };
    if (value === null || value === (params as Record<string, string>)[key]) {
      delete (newParams as Record<string, string>)[key];
    } else {
      (newParams as Record<string, string>)[key] = value;
    }
    delete (newParams as Record<string, string>).page;
    return `/auctions?${new URLSearchParams(newParams as Record<string, string>)}`;
  }

  return (
    <div className="app-page flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="page-container">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Browse Auctions
            </h1>
            <p style={{ color: "hsl(215 20% 50%)" }} className="text-sm">
              Live auctions from verified students on your campus.
            </p>
          </div>

          {/* Search bar */}
          <form className="mb-6">
            <div className="relative max-w-lg">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "hsl(215 20% 45%)" }}
              />
              <input
                type="search"
                name="search"
                defaultValue={params.search}
                placeholder="Search auctions…"
                className="input-base pl-11 pr-4 py-3 w-full"
              />
              {/* Preserve other params */}
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.condition && <input type="hidden" name="condition" value={params.condition} />}
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            </div>
          </form>

          <div className="flex gap-8">
            {/* Sidebar filters */}
            <aside className="hidden lg:block w-52 flex-shrink-0 space-y-6">
              {/* Sort */}
              <div>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "hsla(200, 20%, 97%, 1.00)" }}
                >
                  Sort By
                </h3>
                <div className="space-y-1">
                  {sortOptions.map((opt) => (
                    <Link
                      key={opt.value}
                      href={buildFilterUrl("sort", opt.value)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        background:
                          (params.sort || "endTime") === opt.value
                            ? "rgba(99,102,241,0.15)"
                            : "transparent",
                        color:
                          (params.sort || "endTime") === opt.value
                            ? "hsl(239 84% 75%)"
                            : "hsl(215 20% 55%)",
                      }}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "hsla(210, 14%, 97%, 1.00)" }}
                >
                  Category
                </h3>
                <div className="space-y-1">
                  {categories.map(([value, label]) => (
                    <Link
                      key={value}
                      href={buildFilterUrl("category", value)}
                      className="flex items-center px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        background:
                          params.category === value
                            ? "rgba(99,102,241,0.15)"
                            : "transparent",
                        color:
                          params.category === value
                            ? "hsl(239 84% 75%)"
                            : "hsl(215 20% 55%)",
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "hsla(214, 33%, 96%, 1.00)" }}
                >
                  Condition
                </h3>
                <div className="space-y-1">
                  {conditions.map(([value, label]) => (
                    <Link
                      key={value}
                      href={buildFilterUrl("condition", value)}
                      className="flex items-center px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        background:
                          params.condition === value
                            ? "rgba(99,102,241,0.15)"
                            : "transparent",
                        color:
                          params.condition === value
                            ? "hsl(239 84% 75%)"
                            : "hsl(215 20% 55%)",
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {(params.category || params.condition || params.sort) && (
                <Link
                  href="/auctions"
                  className="btn btn-ghost text-sm px-3 py-2 w-full"
                  style={{ color: "hsl(0 84% 65%)" }}
                >
                  Clear Filters
                </Link>
              )}
            </aside>

            {/* Auction grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <Suspense
                fallback={
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <AuctionCardSkeleton key={i} />
                    ))}
                  </>
                }
              >
                <AuctionGrid searchParams={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
