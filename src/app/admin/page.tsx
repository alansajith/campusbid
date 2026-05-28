import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { AdminDashboardContent } from "@/components/admin/AdminDashboardContent";
import { getCurrentUser } from "@/lib/auth";
import {
  getAdminStats,
  getAdminUsers,
  getAdminAuctions,
  getAdminReports,
} from "@/actions/admin";
import { ShieldCheck } from "lucide-react";
import type { ReportStatus } from "@/generated/prisma";

export const metadata = {
  title: "Admin Dashboard",
  description: "CampusBid Moderation and Management Panel.",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (user as any).role;
  if (role !== "ADMIN") {
    redirect("/");
  }

  // Fetch admin data in parallel
  const [stats, users, auctions, reports] = await Promise.all([
    getAdminStats(),
    getAdminUsers(),
    getAdminAuctions(),
    getAdminReports(),
  ]);

  return (
    <div className="app-page flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="page-container">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.15)" }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: "hsl(239 84% 70%)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Admin Moderation
              </h1>
              <p className="text-sm" style={{ color: "hsl(215 20% 50%)" }}>
                Monitor users, moderate auction listings, and resolve student reports.
              </p>
            </div>
          </div>

          {/* Core Content */}
          <AdminDashboardContent
            stats={stats}
            users={users as unknown as Parameters<typeof AdminDashboardContent>[0]["users"]}
            auctions={auctions as unknown as Parameters<typeof AdminDashboardContent>[0]["auctions"]}
            reports={reports as unknown as Parameters<typeof AdminDashboardContent>[0]["reports"]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
