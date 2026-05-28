import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { AnimatedNumber } from "@/components/landing/AnimatedNumber";
import {
  Gavel,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  Clock,
  TrendingUp,
  BookOpen,
  Laptop,
  Shirt,
  Music,
  Flame,
  Trophy,
  Star,
} from "lucide-react";

// Mock featured auctions for the landing page
const FEATURED_AUCTIONS = [
  {
    id: "1",
    title: "MacBook Pro M3 14\"",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
    currentBid: 1200,
    startingBid: 800,
    bids: 14,
    hoursLeft: 3,
    urgent: true,
  },
  {
    id: "2",
    title: "Calculus Early Transcendentals 9th Ed.",
    category: "Textbooks",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
    currentBid: 45,
    startingBid: 20,
    bids: 7,
    hoursLeft: 18,
    urgent: false,
  },
  {
    id: "3",
    title: "Acoustic Guitar — Taylor 214ce",
    category: "Music",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
    currentBid: 580,
    startingBid: 400,
    bids: 21,
    hoursLeft: 1,
    urgent: true,
  },
  {
    id: "4",
    title: "Ergonomic Desk Chair",
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
    currentBid: 110,
    startingBid: 60,
    bids: 9,
    hoursLeft: 36,
    urgent: false,
  },
];

const STATS = [
  { value: 12000, suffix: "+", label: "Active Students", icon: Users },
  { value: 3400, suffix: "+", label: "Auctions Monthly", icon: Gavel },
  { value: 98, suffix: "%", label: "Satisfaction Rate", icon: Star },
  { value: 17, prefix: "₹", suffix: "Cr+", decimals: 0, label: "Items Exchanged", icon: TrendingUp },
];

const HOW_IT_WORKS = [
  {
    icon: ShieldCheck,
    step: "01",
    title: "Verify Your .edu",
    description:
      "Sign up with your college email. Only verified students get access — no outsiders, no scams.",
    color: "hsl(142 71% 50%)",
    glow: "rgba(34, 197, 94, 0.15)",
  },
  {
    icon: Gavel,
    step: "02",
    title: "List or Bid",
    description:
      "Upload photos, set a starting price, and go live in minutes. Bid on items from your campus peers.",
    color: "hsl(42 95% 55%)",
    glow: "rgba(245, 167, 30, 0.15)",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Win & Exchange",
    description:
      "Highest bidder wins when time's up. Arrange a safe on-campus meetup to complete the exchange.",
    color: "hsl(0 85% 60%)",
    glow: "rgba(220, 60, 60, 0.15)",
  },
];

const CATEGORIES = [
  { icon: Laptop, label: "Electronics", count: 234 },
  { icon: BookOpen, label: "Textbooks", count: 512 },
  { icon: Shirt, label: "Clothing", count: 189 },
  { icon: Music, label: "Music", count: 97 },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(222 47% 4%)" }}>
      <Navbar />

      <main className="flex-1">

        {/* ─── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-28 md:py-40">
          {/* Background layers */}
          <div
            className="absolute inset-0 pointer-events-none retro-grid opacity-40"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(245, 167, 30, 0.22) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-40"
            style={{ background: "rgba(245, 167, 30, 0.2)" }}
          />
          <div
            className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-20"
            style={{ background: "rgba(245, 167, 30, 0.15)" }}
          />

          <div className="page-container relative z-10 text-center">
            {/* Status Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10 border"
              style={{
                background: "rgba(245, 167, 30, 0.08)",
                borderColor: "rgba(245, 167, 30, 0.25)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "hsl(142 71% 50%)" }}
              />
              <span
                style={{
                  color: "hsl(42 95% 65%)",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                College-exclusive · Verified students only
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mb-6 leading-tight"
              style={{
                fontFamily: "var(--font-bodoni), serif",
                fontSize: "clamp(3rem, 8vw, 5.5rem)",
                fontWeight: 900,
                color: "hsl(213 31% 94%)",
              }}
            >
              Your Campus.
              <br />
              <span className="gradient-text">Your Marketplace.</span>
            </h1>

            <p
              className="max-w-2xl mx-auto mb-12 leading-relaxed"
              style={{
                color: "hsl(215 20% 55%)",
                fontSize: "1.3rem",
                fontFamily: "var(--font-baskerville), serif",
              }}
            >
              The only auction platform built exclusively for college students.
              List items, bid in real time, and trade safely with verified peers
              on your campus.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ padding: "1rem 2.2rem", fontSize: "1.15rem" }}
              >
                <Flame className="w-5 h-5" />
                Start Bidding Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auctions"
                className="btn btn-secondary"
                style={{ padding: "1rem 2.2rem", fontSize: "1.15rem" }}
              >
                Browse Auctions
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                "No listing fees",
                ".edu verified only",
                "Campus-safe exchanges",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-2"
                  style={{
                    color: "hsl(215 20% 45%)",
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                >
                  <ShieldCheck
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "hsl(142 71% 50%)" }}
                  />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Stats ─────────────────────────────────────────────────────── */}
        <section
          className="py-16 border-y relative"
          style={{ borderColor: "rgba(245, 167, 30, 0.1)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(245,167,30,0.03) 0%, transparent 100%)",
            }}
          />
          <div className="page-container relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="flex justify-center mb-2">
                    <stat.icon
                      className="w-6 h-6"
                      style={{ color: "hsl(42 95% 50%)" }}
                    />
                  </div>
                  <p
                    className="stat-number mb-1"
                    style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
                  >
                    <AnimatedNumber
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                    />
                  </p>
                  <p
                    style={{
                      color: "hsl(215 20% 45%)",
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ───────────────────────────────────────────────── */}
        <section className="py-28 relative overflow-hidden">
          {/* Ambient Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[160px] pointer-events-none opacity-25"
            style={{ background: "rgba(245, 167, 30, 0.18)" }}
          />
          <div className="page-container">
            <div className="text-center mb-16">
              <p
                className="mb-3 uppercase tracking-widest"
                style={{
                  color: "hsl(42 95% 55%)",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                }}
              >
                How It Works
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-bodoni), serif",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 800,
                  color: "hsl(213 31% 92%)",
                }}
              >
                Simple. Safe.{" "}
                <span className="gradient-text">Student-first.</span>
              </h2>
              <p
                className="mt-4 max-w-xl mx-auto"
                style={{
                  color: "hsl(215 20% 50%)",
                  fontFamily: "var(--font-baskerville), serif",
                  fontSize: "1.1rem",
                }}
              >
                Get started in under 5 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.title}
                  className="relative p-8 rounded-2xl card-hover"
                  style={{
                    background: "rgba(20, 25, 45, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                  }}
                >
                  {/* Step number watermark */}
                  <div
                    className="absolute top-5 right-6 font-black opacity-[0.3]"
                    style={{
                      fontFamily: "var(--font-bodoni), serif",
                      fontSize: "5rem",
                      color: "#f8f5f5ff",
                      lineHeight: 1,
                    }}
                  >
                    {step.step}
                  </div>

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: step.glow, border: `1px solid ${step.color}30` }}
                  >
                    <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>

                  <p
                    className="mb-1 uppercase tracking-widest"
                    style={{
                      color: step.color,
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                    }}
                  >
                    Step {step.step}
                  </p>

                  <h3
                    className="mb-3"
                    style={{
                      fontFamily: "var(--font-bodoni), serif",
                      fontSize: "1.55rem",
                      fontWeight: 700,
                      color: "hsl(213 31% 90%)",
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      color: "hsla(214, 5%, 71%, 1.00)",
                      fontFamily: "var(--font-baskerville), serif",
                      fontSize: "1.05rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Auctions ──────────────────────────────────────────── */}
        <section
          className="py-24"
          style={{
            background: "linear-gradient(180deg, rgba(245,167,30,0.03) 0%, rgba(8,10,20,0) 100%)",
          }}
        >
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p
                  className="mb-2 uppercase tracking-widest"
                  style={{
                    color: "hsl(42 95% 55%)",
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                  }}
                >
                  Live Now
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-bodoni), serif",
                    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                    fontWeight: 800,
                    color: "hsl(213 31% 92%)",
                  }}
                >
                  Active Auctions
                </h2>
                <p
                  className="mt-1"
                  style={{
                    color: "hsl(215 20% 45%)",
                    fontFamily: "var(--font-baskerville), serif",
                    fontSize: "1.05rem",
                    fontStyle: "italic",
                  }}
                >
                  Ending soon — place your bid now
                </p>
              </div>
              <Link
                href="/auctions"
                className="btn btn-secondary hidden sm:flex"
                style={{ fontSize: "1rem", padding: "0.6rem 1.3rem" }}
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURED_AUCTIONS.map((auction) => (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="group rounded-2xl overflow-hidden card-hover block"
                  style={{
                    background: "rgba(18, 22, 40, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="badge badge-category">{auction.category}</span>
                    </div>
                    {auction.urgent && (
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-critical animate-pulse">
                          <Clock className="w-2.5 h-2.5" />
                          {auction.hoursLeft}h left
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontFamily: "var(--font-sans), sans-serif",
                          fontSize: "0.8rem",
                        }}
                      >
                        {auction.bids} bids
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3
                      className="leading-snug mb-3 line-clamp-2"
                      style={{
                        fontFamily: "var(--font-baskerville), serif",
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "hsl(213 31% 88%)",
                      }}
                    >
                      {auction.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          style={{
                            color: "hsl(215 20% 45%)",
                            fontFamily: "var(--font-sans), sans-serif",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Current Bid
                        </p>
                        <p
                          style={{
                            color: "hsl(42 95% 58%)",
                            fontFamily: "var(--font-bodoni), serif",
                            fontSize: "1.4rem",
                            fontWeight: 700,
                          }}
                        >
                          ${auction.currentBid.toLocaleString()}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        style={{ color: "hsl(142 71% 50%)" }}
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span
                          style={{
                            fontFamily: "var(--font-sans), sans-serif",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          +{Math.round(((auction.currentBid - auction.startingBid) / auction.startingBid) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link href="/auctions" className="btn btn-secondary">
                View All Auctions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Categories ────────────────────────────────────────────────── */}
        <section className="py-20 relative overflow-hidden">
          {/* Side Ambient Glow */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-20"
            style={{ background: "rgba(245, 167, 30, 0.15)" }}
          />
          <div className="page-container">
            <div className="text-center mb-12">
              <p
                className="mb-2 uppercase tracking-widest"
                style={{
                  color: "hsl(42 95% 55%)",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                }}
              >
                Explore
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-bodoni), serif",
                  fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                  fontWeight: 800,
                  color: "hsl(213 31% 92%)",
                }}
              >
                Browse by Category
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/auctions?category=${cat.label.toUpperCase()}`}
                  className="p-7 rounded-2xl card-hover text-center group"
                  style={{
                    background: "rgba(18, 22, 40, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{
                      background: "rgba(245, 167, 30, 0.1)",
                      border: "1px solid rgba(245, 167, 30, 0.2)",
                    }}
                  >
                    <cat.icon
                      className="w-7 h-7"
                      style={{ color: "hsl(42 95% 55%)" }}
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-baskerville), serif",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "hsl(213 31% 88%)",
                    }}
                  >
                    {cat.label}
                  </p>
                  <p
                    className="mt-1"
                    style={{
                      color: "hsl(215 20% 45%)",
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.85rem",
                    }}
                  >
                    {cat.count} listings
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ─────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="page-container">
            <div
              className="relative overflow-hidden rounded-3xl p-14 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(245,167,30,0.08) 0%, rgba(220,60,60,0.06) 50%, rgba(8,10,20,0.9) 100%)",
                border: "1px solid rgba(245, 167, 30, 0.2)",
                boxShadow: "0 0 60px rgba(245, 167, 30, 0.08), inset 0 1px 0 rgba(245,167,30,0.1)",
              }}
            >
              {/* Decorative orbs */}
              <div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(245, 167, 30, 0.08)" }}
              />
              <div
                className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(220, 60, 60, 0.06)" }}
              />
              {/* Grid */}
              <div className="absolute inset-0 retro-grid opacity-30 pointer-events-none" />

              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8 border"
                  style={{
                    background: "rgba(245, 167, 30, 0.1)",
                    borderColor: "rgba(245, 167, 30, 0.3)",
                  }}
                >
                  <ShieldCheck
                    className="w-4 h-4"
                    style={{ color: "hsl(142 71% 50%)" }}
                  />
                  <span
                    style={{
                      color: "hsl(42 95% 65%)",
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    Verified .edu emails only
                  </span>
                </div>

                <h2
                  className="mb-5"
                  style={{
                    fontFamily: "var(--font-bodoni), serif",
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    fontWeight: 900,
                    color: "hsl(213 31% 94%)",
                    lineHeight: 1.15,
                  }}
                >
                  Ready to join your
                  <br />
                  <span className="gradient-text">campus marketplace?</span>
                </h2>

                <p
                  className="mb-10 max-w-md mx-auto"
                  style={{
                    color: "hsl(215 20% 55%)",
                    fontFamily: "var(--font-baskerville), serif",
                    fontSize: "1.15rem",
                    fontStyle: "italic",
                  }}
                >
                  It takes under 2 minutes to get verified and start bidding.
                </p>

                <Link
                  href="/register"
                  className="btn btn-primary"
                  style={{ padding: "1.1rem 2.5rem", fontSize: "1.2rem" }}
                >
                  <Flame className="w-5 h-5" />
                  Get Started — It&apos;s Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
