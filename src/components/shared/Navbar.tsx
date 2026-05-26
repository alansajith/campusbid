"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Gavel,
  Plus,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const navLinks = [
  { href: "/auctions", label: "Browse Auctions" },
  { href: "/create-auction", label: "Sell Item", requiresAuth: true },
  { href: "/watchlist", label: "Watchlist", requiresAuth: true },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = session?.user;

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(8, 10, 20, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(245, 167, 30, 0.15)",
        boxShadow: "0 1px 0 rgba(245, 167, 30, 0.08), 0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-18" style={{ height: "4.5rem" }}>

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-1 group"
            onClick={() => setMobileOpen(false)}
          >
            <img
              src="/logo.png"
              alt="CampusBid Logo"
              className="w-20 h-20 object-contain transition-all duration-200 group-hover:scale-110"
            />
            <span
              style={{
                fontFamily: "var(--font-bodoni), serif",
                fontSize: "1.55rem",
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              <span className="gradient-text">Campus</span>
              <span style={{ color: "hsl(213 31% 85%)" }}>Bid</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !user) return null;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2.5 rounded-lg font-semibold transition-all duration-150",
                    "text-base",
                    isActive
                      ? "text-amber-400"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                  style={
                    isActive
                      ? {
                          background: "rgba(245, 167, 30, 0.1)",
                          color: "hsl(42 95% 60%)",
                          borderBottom: "2px solid hsl(42 95% 55%)",
                        }
                      : {}
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Desktop Right ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/create-auction"
                  className="btn btn-primary"
                  style={{ padding: "0.55rem 1.2rem", fontSize: "1rem" }}
                >
                  <Plus className="w-4 h-4" />
                  List Item
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-white/5 border border-transparent hover:border-white/10"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, hsl(42 95% 55%) 0%, hsl(28 90% 45%) 100%)",
                        color: "hsl(222 47% 5%)",
                      }}
                    >
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || ""}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(user.name)
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-300 max-w-[80px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200 text-slate-500",
                        profileOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div
                        className="absolute right-0 top-12 z-20 w-56 rounded-xl p-1 animate-slide-up"
                        style={{
                          background: "hsl(222 47% 6%)",
                          border: "1px solid rgba(245, 167, 30, 0.2)",
                          boxShadow: "0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(245,167,30,0.08)",
                        }}
                      >
                        <div className="px-3 py-2.5 border-b mb-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                          <p className="text-sm font-bold text-slate-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs truncate mt-0.5" style={{ color: "hsl(215 20% 45%)" }}>
                            {user.email}
                          </p>
                        </div>
                        {(user as any).role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 transition-colors font-semibold"
                            style={{ color: "hsl(42 95% 60%)" }}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 transition-colors"
                          style={{ color: "hsl(215 20% 65%)" }}
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          href="/watchlist"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 transition-colors"
                          style={{ color: "hsl(215 20% 65%)" }}
                        >
                          <Heart className="w-4 h-4" />
                          Watchlist
                        </Link>
                        <div className="border-t mt-1 pt-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              signOut({ callbackUrl: "/" });
                            }}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm w-full hover:bg-red-500/10 transition-colors"
                            style={{ color: "hsl(0 84% 65%)" }}
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="btn btn-ghost"
                  style={{ padding: "0.55rem 1.1rem", fontSize: "1rem" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary"
                  style={{ padding: "0.55rem 1.2rem", fontSize: "1rem" }}
                >
                  <Flame className="w-4 h-4" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Menu Button ────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "hsl(215 20% 60%)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────── */}
        {mobileOpen && (
          <div
            className="md:hidden pb-5 pt-3 border-t animate-slide-up"
            style={{ borderColor: "rgba(245, 167, 30, 0.12)" }}
          >
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => {
                if (link.requiresAuth && !user) return null;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-colors",
                      isActive
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: "linear-gradient(135deg, hsl(42 95% 55%) 0%, hsl(28 90% 45%) 100%)",
                        color: "hsl(222 47% 5%)",
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{user.name}</p>
                      <p className="text-xs" style={{ color: "hsl(215 20% 50%)" }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {(user as any).role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg transition-colors font-semibold"
                      style={{ color: "hsl(42 95% 60%)" }}
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm w-full hover:bg-red-500/10 rounded-lg transition-colors"
                    style={{ color: "hsl(0 84% 65%)" }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-secondary text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary text-center"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
