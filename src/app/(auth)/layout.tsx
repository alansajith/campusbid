import { Gavel, ShieldCheck, GraduationCap, Trophy } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-page min-h-screen flex" style={{ background: "hsl(222 47% 4%)" }}>

      {/* ── Left Panel — Branding (hidden on mobile) ───────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, hsl(222 50% 6%) 0%, hsl(222 47% 4%) 60%, hsl(263 40% 8%) 100%)",
          borderRight: "1px solid rgba(245, 167, 30, 0.1)",
        }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 retro-grid opacity-30 pointer-events-none" />

        {/* Glow orbs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(245, 167, 30, 0.06)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(220, 60, 60, 0.04)" }}
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 relative z-10">
          <img
            src="/logo.png"
            alt="CampusBid Logo"
            className="w-20 h-20 object-contain"
          />
          <span
            style={{
              fontFamily: "var(--font-bodoni), serif",
              fontSize: "1.6rem",
              fontWeight: 800,
            }}
          >
            <span className="gradient-text">Campus</span>
            <span style={{ color: "hsl(213 31% 80%)" }}>Bid</span>
          </span>
        </Link>

        {/* Tagline block */}
        <div className="relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
            style={{
              background: "rgba(245, 167, 30, 0.1)",
              border: "1px solid rgba(245, 167, 30, 0.25)",
            }}
          >
            <GraduationCap className="w-8 h-8" style={{ color: "hsl(42 95% 55%)" }} />
          </div>

          <h2
            className="leading-tight mb-5"
            style={{
              fontFamily: "var(--font-bodoni), serif",
              fontSize: "2.6rem",
              fontWeight: 800,
              color: "hsl(213 31% 92%)",
              lineHeight: 1.2,
            }}
          >
            The marketplace
            <br />
            <span className="gradient-text">made for students.</span>
          </h2>

          <p
            style={{
              color: "hsl(215 20% 48%)",
              fontFamily: "var(--font-baskerville), serif",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              fontStyle: "italic",
            }}
          >
            Join thousands of verified students buying, selling, and bidding on
            items across your campus — safely and securely.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 space-y-4">
            {[
              { text: "Verified .edu email required", Icon: ShieldCheck, color: "hsl(142 71% 50%)", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.25)" },
              { text: "Real-time bidding with live updates", Icon: Trophy, color: "hsl(42 95% 55%)", bg: "rgba(245, 167, 30, 0.1)", border: "rgba(245, 167, 30, 0.25)" },
              { text: "Safe campus-to-campus exchanges", Icon: GraduationCap, color: "hsl(263 80% 72%)", bg: "rgba(139, 92, 246, 0.1)", border: "rgba(139, 92, 246, 0.25)" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: item.bg, border: `1px solid ${item.border}` }}
                >
                  <item.Icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span
                  style={{
                    color: "hsl(215 20% 58%)",
                    fontFamily: "var(--font-baskerville), serif",
                    fontSize: "1.02rem",
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div
          className="relative z-10 p-5 rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(245, 167, 30, 0.12)",
          }}
        >
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} style={{ color: "hsl(42 95% 55%)", fontSize: "0.9rem" }}>★</span>
            ))}
          </div>
          <p
            className="leading-relaxed mb-4"
            style={{
              color: "hsl(215 20% 55%)",
              fontFamily: "var(--font-baskerville), serif",
              fontSize: "1rem",
              fontStyle: "italic",
            }}
          >
            &ldquo;Found a nearly-new MacBook for half the price. The bidding felt fair and I met the seller at the campus library. 10/10.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: "linear-gradient(135deg, hsl(42 95% 55%) 0%, hsl(28 90% 45%) 100%)",
                color: "hsl(222 47% 5%)",
              }}
            >
              JS
            </div>
            <div>
              <p
                style={{
                  color: "hsl(213 31% 80%)",
                  fontFamily: "var(--font-baskerville), serif",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
              >
                Jordan S.
              </p>
              <p
                style={{
                  color: "hsl(215 20% 42%)",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.8rem",
                }}
              >
                Junior, Computer Science
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ──────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: "hsl(222 47% 4%)" }}
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-1">
              <img
                src="/logo.png"
                alt="CampusBid Logo"
                className="w-16 h-16 object-contain"
              />
              <span
                style={{
                  fontFamily: "var(--font-bodoni), serif",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                }}
              >
                <span className="gradient-text">Campus</span>
                <span style={{ color: "hsl(213 31% 80%)" }}>Bid</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
