"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { AuctionCategory, AuctionCondition } from "@/generated/prisma";
import type { AuctionFilters } from "@/types";

const createAuctionSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(2000),
  category: z.nativeEnum(AuctionCategory),
  condition: z.nativeEnum(AuctionCondition),
  images: z.array(z.string()).min(1).max(6),
  startingBid: z.number().min(1).max(100000),
  durationHours: z.number().min(1).max(168),
});

export async function createAuction(input: unknown) {
  const user = await requireAuth();

  const parsed = createAuctionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const { title, description, category, condition, images, startingBid, durationHours } = parsed.data;

  // Upload images to Cloudinary if they are base64 data URIs
  let imageUrls = images;
  const needsUpload = images.some((img) => img.startsWith("data:"));
  if (needsUpload) {
    try {
      imageUrls = await uploadMultipleImages(
        images.filter((img) => img.startsWith("data:")),
        "campusbid/auctions"
      );
    } catch {
      return { error: "Image upload failed. Please try again." };
    }
  }

  const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);

  try {
    const auction = await prisma.auction.create({
      data: {
        sellerId: user.id!,
        title,
        description,
        category,
        condition,
        images: imageUrls,
        startingBid,
        currentBid: startingBid,
        endTime,
        status: "ACTIVE",
      },
    });

    revalidatePath("/auctions");
    return { success: true, auctionId: auction.id };
  } catch {
    return { error: "Failed to create auction. Please try again." };
  }
}

export async function getAuctions(filters: AuctionFilters = {}) {
  const {
    category,
    condition,
    minBid,
    maxBid,
    search,
    sortBy = "endTime",
    sortOrder = "asc",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    endTime: { gt: new Date() },
  };

  if (category) where.category = category;
  if (condition) where.condition = condition;
  if (minBid !== undefined || maxBid !== undefined) {
    where.currentBid = {};
    if (minBid !== undefined) (where.currentBid as Record<string, number>).gte = minBid;
    if (maxBid !== undefined) (where.currentBid as Record<string, number>).lte = maxBid;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> = {};
  if (sortBy === "currentBid") orderBy.currentBid = sortOrder;
  else if (sortBy === "createdAt") orderBy.createdAt = sortOrder;
  else orderBy.endTime = sortOrder;

  const [auctions, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        seller: {
          select: { id: true, name: true, image: true, university: true },
        },
        _count: { select: { bids: true, watchlistedBy: true } },
      },
    }),
    prisma.auction.count({ where }),
  ]);

  return { auctions, total, pages: Math.ceil(total / pageSize) };
}

export async function getAuctionById(id: string) {
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      seller: {
        select: { id: true, name: true, image: true, university: true, email: true, phone: true },
      },
      bids: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          bidder: { select: { id: true, name: true, image: true } },
        },
      },
      _count: { select: { bids: true, watchlistedBy: true } },
    },
  });

  if (!auction) return null;

  // Increment view count (fire and forget)
  prisma.auction
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  return auction;
}

export async function getUserAuctions(userId?: string) {
  const user = userId ? { id: userId } : await requireAuth();

  return prisma.auction.findMany({
    where: { sellerId: user.id! },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bids: true } },
    },
  });
}

export async function closeExpiredAuctions() {
  const now = new Date();

  const expired = await prisma.auction.findMany({
    where: {
      status: "ACTIVE",
      endTime: { lt: now },
    },
    include: {
      bids: { orderBy: { amount: "desc" }, take: 1 },
    },
  });

  for (const auction of expired) {
    const topBid = auction.bids[0];
    await prisma.auction.update({
      where: { id: auction.id },
      data: {
        status: topBid ? "SOLD" : "ENDED",
        highestBidderId: topBid?.bidderId ?? null,
      },
    });
  }

  return { closed: expired.length };
}
