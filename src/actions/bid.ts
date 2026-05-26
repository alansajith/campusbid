"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validateBid } from "@/lib/bid-validator";

const placeBidSchema = z.object({
  auctionId: z.string().cuid(),
  amount: z.number().positive().max(1_000_000),
});

export async function placeBid(input: unknown) {
  const user = await requireAuth();

  const parsed = placeBidSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid bid data." };
  }

  const { auctionId, amount } = parsed.data;

  // Use a transaction to prevent race conditions
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // Fetch the auction with a lock-like pattern
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        select: {
          id: true,
          status: true,
          endTime: true,
          currentBid: true,
          sellerId: true,
          highestBidderId: true,
        },
      });

      // Validate the bid
      const validation = validateBid({ auction, bidderId: user.id!, amount });
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create the bid
      const bid = await tx.bid.create({
        data: {
          auctionId,
          bidderId: user.id!,
          amount,
        },
        include: {
          bidder: { select: { id: true, name: true, image: true } },
        },
      });

      // Update auction current bid
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentBid: amount,
          highestBidderId: user.id!,
        },
      });

      return bid;
    });

    revalidatePath(`/auctions/${auctionId}`);
    return { success: true, bid: result };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to place bid.";
    return { error: message };
  }
}

export async function getBidHistory(auctionId: string) {
  return prisma.bid.findMany({
    where: { auctionId },
    orderBy: { createdAt: "desc" },
    include: {
      bidder: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function getUserBids() {
  const user = await requireAuth();

  return prisma.bid.findMany({
    where: { bidderId: user.id! },
    orderBy: { createdAt: "desc" },
    include: {
      auction: {
        select: {
          id: true,
          title: true,
          images: true,
          currentBid: true,
          endTime: true,
          status: true,
        },
      },
    },
  });
}
