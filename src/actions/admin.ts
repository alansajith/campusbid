"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import type { ReportStatus } from "@/generated/prisma";

// Helper to ensure the current user is an admin
async function requireAdmin() {
  const user = await requireAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (user as any).role;
  if (role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return user;
}

export async function getAdminStats() {
  await requireAdmin();

  const [totalUsers, activeAuctions, totalBids, pendingReports] = await Promise.all([
    prisma.user.count(),
    prisma.auction.count({ where: { status: "ACTIVE" } }),
    prisma.bid.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  return { totalUsers, activeAuctions, totalBids, pendingReports };
}

export async function getAdminUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      university: true,
      verified: true,
      banned: true,
      createdAt: true,
      _count: {
        select: {
          auctions: true,
          bids: true,
        },
      },
    },
  });
}

export async function getAdminAuctions() {
  await requireAdmin();

  return prisma.auction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: { id: true, name: true, email: true, university: true },
      },
      _count: {
        select: { bids: true },
      },
    },
  });
}

export async function getAdminReports() {
  await requireAdmin();

  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        select: { id: true, name: true, email: true },
      },
      auction: {
        select: { id: true, title: true, status: true },
      },
      targetUser: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function toggleUserBan(userId: string, ban: boolean) {
  await requireAdmin();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { banned: ban },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update ban status." };
  }
}

export async function cancelAuction(auctionId: string) {
  await requireAdmin();

  try {
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: "CANCELLED" },
    });
    revalidatePath("/admin");
    revalidatePath("/auctions");
    revalidatePath(`/auctions/${auctionId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to cancel auction." };
  }
}

export async function updateReportStatus(reportId: string, status: ReportStatus) {
  await requireAdmin();

  try {
    await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update report status." };
  }
}
