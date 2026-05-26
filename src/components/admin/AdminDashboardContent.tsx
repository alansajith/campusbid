"use client";

import { useState, useTransition } from "react";
import {
  Users,
  Gavel,
  AlertTriangle,
  BarChart3,
  Search,
  ShieldAlert,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toggleUserBan, cancelAuction, updateReportStatus } from "@/actions/admin";
import { toast } from "sonner";
import Link from "next/link";
import type { ReportStatus } from "@/generated/prisma";

interface AdminDashboardContentProps {
  stats: {
    totalUsers: number;
    activeAuctions: number;
    totalBids: number;
    pendingReports: number;
  };
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    university: string | null;
    verified: boolean;
    banned: boolean;
    createdAt: Date;
    _count: { auctions: number; bids: number };
  }>;
  auctions: Array<{
    id: string;
    title: string;
    status: string;
    currentBid: number;
    createdAt: Date;
    _count: { bids: number };
    seller: { name: string | null; email: string; university: string | null };
  }>;
  reports: Array<{
    id: string;
    reason: string;
    details: string | null;
    status: ReportStatus;
    createdAt: Date;
    reporter: { name: string | null; email: string };
    auction: { id: string; title: string; status: string } | null;
    targetUser: { id: string; name: string | null; email: string } | null;
  }>;
}

export function AdminDashboardContent({
  stats,
  users: initialUsers,
  auctions: initialAuctions,
  reports: initialReports,
}: AdminDashboardContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "auctions" | "reports">("overview");
  const [users, setUsers] = useState(initialUsers);
  const [auctions, setAuctions] = useState(initialAuctions);
  const [reports, setReports] = useState(initialReports);

  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Ban/Unban handler
  function handleToggleBan(userId: string, isCurrentlyBanned: boolean) {
    if (!confirm(`Are you sure you want to ${isCurrentlyBanned ? "unban" : "ban"} this user?`)) return;

    startTransition(async () => {
      const result = await toggleUserBan(userId, !isCurrentlyBanned);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`User ${isCurrentlyBanned ? "unbanned" : "banned"} successfully.`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, banned: !isCurrentlyBanned } : u))
        );
      }
    });
  }

  // Cancel Auction handler
  function handleCancelAuction(auctionId: string) {
    if (!confirm("Are you sure you want to cancel this auction listing?")) return;

    startTransition(async () => {
      const result = await cancelAuction(auctionId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Auction cancelled successfully.");
        setAuctions((prev) =>
          prev.map((a) => (a.id === auctionId ? { ...a, status: "CANCELLED" } : a))
        );
      }
    });
  }

  // Report status handler
  function handleResolveReport(reportId: string, nextStatus: ReportStatus) {
    startTransition(async () => {
      const result = await updateReportStatus(reportId, nextStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Report status updated to ${nextStatus}.`);
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: nextStatus } : r))
        );
      }
    });
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.university?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuctions = auctions.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Tab switches */}
      <div className="flex gap-2 border-b overflow-x-auto pb-px" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "users", label: "Students", icon: Users },
          { id: "auctions", label: "Auctions", icon: Gavel },
          { id: "reports", label: "Reports", icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchTerm("");
              }}
              className="flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap"
              style={{
                borderColor: activeTab === tab.id ? "hsl(239 84% 67%)" : "transparent",
                color: activeTab === tab.id ? "white" : "hsl(215 20% 50%)",
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-slide-up">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Students", value: stats.totalUsers, icon: Users, color: "hsl(239 84% 70%)" },
              { label: "Active Auctions", value: stats.activeAuctions, icon: Gavel, color: "hsl(142 71% 45%)" },
              { label: "Bids Placed", value: stats.totalBids, icon: BarChart3, color: "hsl(38 92% 55%)" },
              { label: "Pending Reports", value: stats.pendingReports, icon: ShieldAlert, color: "hsl(0 84% 65%)" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium" style={{ color: "hsl(215 20% 45%)" }}>
                      {card.label}
                    </span>
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <h3 className="text-3xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                    {card.value}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* Quick Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                Recent Reports
              </h3>
              {reports.length === 0 ? (
                <p className="text-sm" style={{ color: "hsl(215 20% 45%)" }}>No reports logged.</p>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl flex items-center justify-between text-sm"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div>
                        <p className="font-semibold" style={{ color: "hsl(0 84% 70%)" }}>{r.reason}</p>
                        <p className="text-xs mt-1" style={{ color: "hsl(215 20% 45%)" }}>
                          Reported by {r.reporter.name}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          r.status === "PENDING"
                            ? "badge-ended"
                            : r.status === "RESOLVED"
                            ? "badge-active"
                            : "badge-category"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                Latest Active Listings
              </h3>
              {auctions.length === 0 ? (
                <p className="text-sm" style={{ color: "hsl(215 20% 45%)" }}>No active auctions.</p>
              ) : (
                <div className="space-y-3">
                  {auctions.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl flex items-center justify-between text-sm"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div>
                        <p className="font-semibold truncate max-w-xs">{a.title}</p>
                        <p className="text-xs mt-1" style={{ color: "hsl(215 20% 45%)" }}>
                          Seller: {a.seller.name || "Anonymous"} · {a.seller.university}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: "hsl(38 92% 55%)" }}>
                          {formatCurrency(a.currentBid)}
                        </p>
                        <span className="text-xs" style={{ color: "hsl(215 20% 40%)" }}>{a._count.bids} bids</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: USERS */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search students by name, email, or university..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base pl-11"
            />
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="border-b text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: "rgba(255,255,255,0.06)", color: "hsl(215 20% 45%)" }}
                  >
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">University</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-center">Bids / Listings</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-white/5 transition-colors ${u.banned ? "opacity-60 bg-red-950/5" : ""}`}
                    >
                      <td className="p-4 font-medium flex items-center gap-2">
                        {u.name || "Anonymous Student"}
                        {u.verified && (
                          <ShieldCheck className="w-3.5 h-3.5" style={{ color: "hsl(142 71% 45%)" }} />
                        )}
                      </td>
                      <td className="p-4" style={{ color: "hsl(215 20% 65%)" }}>{u.email}</td>
                      <td className="p-4">{u.university || "—"}</td>
                      <td className="p-4">
                        <span
                          className={`badge ${u.role === "ADMIN" ? "badge-active" : "badge-category"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-center font-semibold">
                        {u._count.bids} / {u._count.auctions}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleToggleBan(u.id, u.banned)}
                            disabled={isPending}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-colors ${
                              u.banned
                                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            }`}
                          >
                            <Ban className="w-3 h-3" />
                            {u.banned ? "Unban" : "Ban User"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: AUCTIONS */}
      {activeTab === "auctions" && (
        <div className="space-y-6 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search auctions by title or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base pl-11"
            />
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="border-b text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: "rgba(255,255,255,0.06)", color: "hsl(215 20% 45%)" }}
                  >
                    <th className="p-4">Auction</th>
                    <th className="p-4">Seller</th>
                    <th className="p-4">Current Bid</th>
                    <th className="p-4">Bids</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {filteredAuctions.map((a) => (
                    <tr key={a.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">
                        <Link href={`/auctions/${a.id}`} className="hover:underline">
                          {a.title}
                        </Link>
                        <p className="text-xs mt-1" style={{ color: "hsl(215 20% 40%)" }}>
                          Listed {formatDate(new Date(a.createdAt))}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{a.seller.name || "Anonymous"}</p>
                        <p className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>{a.seller.university}</p>
                      </td>
                      <td className="p-4 font-bold" style={{ color: "hsl(38 92% 55%)" }}>
                        {formatCurrency(a.currentBid)}
                      </td>
                      <td className="p-4">{a._count.bids}</td>
                      <td className="p-4">
                        <span
                          className={`badge ${
                            a.status === "ACTIVE"
                              ? "badge-active"
                              : a.status === "CANCELLED"
                              ? "badge-ended"
                              : "badge-category"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {a.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancelAuction(a.id)}
                            disabled={isPending}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel Listing
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: REPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-6 animate-slide-up">
          {reports.length === 0 ? (
            <div
              className="rounded-2xl p-16 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <CheckCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-lg font-semibold mb-1">All clean!</h4>
              <p className="text-sm" style={{ color: "hsl(215 20% 45%)" }}>No student reports have been filed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: "hsl(215 20% 45%)" }}>
                        Report ID: {r.id}
                      </span>
                      <h4 className="text-lg font-bold mt-1 text-red-400">{r.reason}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          r.status === "PENDING"
                            ? "badge-ended"
                            : r.status === "RESOLVED"
                            ? "badge-active"
                            : "badge-category"
                        }`}
                      >
                        {r.status}
                      </span>

                      {r.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveReport(r.id, "RESOLVED")}
                            disabled={isPending}
                            className="bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(r.id, "DISMISSED")}
                            disabled={isPending}
                            className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm p-4 rounded-xl mb-4 leading-relaxed whitespace-pre-wrap" style={{ background: "rgba(255,255,255,0.02)", color: "hsl(213 31% 80%)" }}>
                    {r.details || "No additional details provided."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs" style={{ color: "hsl(215 20% 50%)" }}>
                    <div>
                      <span className="font-semibold">Reporter:</span> {r.reporter.name} ({r.reporter.email})
                    </div>
                    {r.auction && (
                      <div>
                        <span className="font-semibold">Reported Listing:</span>{" "}
                        <Link href={`/auctions/${r.auction.id}`} className="underline hover:text-white">
                          {r.auction.title}
                        </Link>
                      </div>
                    )}
                    {r.targetUser && (
                      <div>
                        <span className="font-semibold">Reported User:</span> {r.targetUser.name} ({r.targetUser.email})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
