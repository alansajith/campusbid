"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function addToWatchlist(auctionId: string) {
  const user = await requireAuth();

  try {
    await prisma.watchlist.create({
      data: { userId: user.id!, auctionId },
    });
    revalidatePath(`/auctions/${auctionId}`);
    revalidatePath("/watchlist");
    return { success: true };
  } catch {
    return { error: "Already in watchlist." };
  }
}

export async function removeFromWatchlist(auctionId: string) {
  const user = await requireAuth();

  await prisma.watchlist.deleteMany({
    where: { userId: user.id!, auctionId },
  });

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/watchlist");
  return { success: true };
}

export async function getWatchlist() {
  const user = await requireAuth();

  return prisma.watchlist.findMany({
    where: { userId: user.id! },
    orderBy: { createdAt: "desc" },
    include: {
      auction: {
        include: {
          seller: {
            select: { id: true, name: true, image: true, university: true },
          },
          _count: { select: { bids: true, watchlistedBy: true } },
        },
      },
    },
  });
}

export async function isWatching(auctionId: string): Promise<boolean> {
  try {
    const user = await requireAuth();
    const item = await prisma.watchlist.findUnique({
      where: { userId_auctionId: { userId: user.id!, auctionId } },
    });
    return !!item;
  } catch {
    return false;
  }
}
