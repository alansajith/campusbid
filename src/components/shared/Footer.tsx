"use client";

import Link from "next/link";
import { Gavel, Globe, Mail, MessageCircle, ArrowUpRight, Flame } from "lucide-react";
import { useState } from "react";

function SocialIcon({ Icon, label }: { Icon: React.ElementType; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      aria-label={label}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
      style={{
        background: hovered ? "rgba(245, 167, 30, 0.08)" : "rgba(255, 255, 255, 0.05)",
        border: hovered ? "1px solid rgba(245, 167, 30, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
        color: hovered ? "hsl(42 95% 60%)" : "hsl(215 20% 50%)",
        boxShadow: hovered ? "0 0 12px rgba(245, 167, 30, 0.2)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      className="group flex items-center gap-1 transition-colors duration-150"
      style={{
        color: hovered ? "hsl(213 31% 85%)" : "hsl(215 20% 50%)",
        fontFamily: "var(--font-baskerville), serif",
        fontSize: "1.05rem",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function BottomLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      className="transition-colors"
      style={{
        color: hovered ? "hsl(42 95% 55%)" : "hsl(215 20% 38%)",
        fontFamily: "var(--font-sans), sans-serif",
        fontSize: "0.9rem",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(222 47% 4%) 0%, hsl(222 50% 3%) 100%)",
        borderColor: "rgba(245, 167, 30, 0.12)",
      }}
    >
      {/* Decorative glow top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(245, 167, 30, 0.4), transparent)",
        }}
      />

      {/* Retro grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-30 retro-grid" />

      <div className="page-container py-20 px-6 sm:px-12 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">

          {/* ── Brand ─────────────────────────────────────────── */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-1 group mb-5">
              <img
                src="/logo.png"
                alt="CampusBid Logo"
                className="w-20 h-20 object-contain transition-all duration-200 group-hover:scale-110"
              />
              <span
                style={{
                  fontFamily: "var(--font-bodoni), serif",
                  fontSize: "1.7rem",
                  fontWeight: 800,
                }}
              >
                <span className="gradient-text">Campus</span>
                <span style={{ color: "hsl(213 31% 80%)" }}>Bid</span>
              </span>
            </Link>

            <p
              className="leading-relaxed mb-6 max-w-sm"
              style={{
                color: "hsl(215 20% 50%)",
                fontSize: "1.05rem",
                fontFamily: "var(--font-baskerville), serif",
                fontStyle: "italic",
              }}
            >
              A college-exclusive auction marketplace where verified students buy, sell, and trade with their campus community.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <SocialIcon Icon={Globe} label="Website" />
              <SocialIcon Icon={Mail} label="Email" />
              <SocialIcon Icon={MessageCircle} label="Chat" />
            </div>
          </div>

          {/* ── Platform Links ─────────────────────────────────── */}
          <div className="md:col-span-3">
            <h4
              className="mb-5"
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "hsl(42 95% 55%)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/auctions", label: "Browse Auctions" },
                { href: "/create-auction", label: "Sell an Item" },
                { href: "/watchlist", label: "My Watchlist" },
                { href: "/profile", label: "My Profile" },
              ].map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support Links ──────────────────────────────────── */}
          <div className="md:col-span-4">
            <h4
              className="mb-5"
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "hsl(42 95% 55%)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { href: "#", label: "How It Works" },
                { href: "#", label: "Safety Guidelines" },
                { href: "#", label: "Report a Listing" },
                { href: "#", label: "Contact Us" },
              ].map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/register"
                className="btn btn-primary inline-flex"
                style={{ fontSize: "0.95rem", padding: "0.65rem 1.4rem" }}
              >
                <Flame className="w-4 h-4" />
                Join CampusBid
              </Link>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────── */}
        <div
          className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <p
            style={{
              color: "hsl(215 20% 38%)",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.9rem",
            }}
          >
            © {year} CampusBid. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <BottomLink href="#">Privacy Policy</BottomLink>
            <BottomLink href="#">Terms of Service</BottomLink>
          </div>

          <p
            style={{
              color: "hsl(215 20% 38%)",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.9rem",
            }}
          >
            Built for students, by students 🎓
          </p>
        </div>
      </div>
    </footer>
  );
}
