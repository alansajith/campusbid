import type { User, Auction, Bid, Watchlist, Report, AuctionStatus, AuctionCategory, AuctionCondition, UserRole } from "@/generated/prisma";

// Re-export prisma enums for convenience
export type { AuctionStatus, AuctionCategory, AuctionCondition, UserRole };

// Extended types with relations
export type AuctionWithRelations = Auction & {
  seller: Pick<User, "id" | "name" | "image" | "university">;
  bids: BidWithUser[];
  _count: { bids: number; watchlistedBy: number };
};

export type BidWithUser = Bid & {
  bidder: Pick<User, "id" | "name" | "image">;
};

export type WatchlistWithAuction = Watchlist & {
  auction: AuctionWithRelations;
};

export type UserProfile = User & {
  auctions: Auction[];
  bids: Bid[];
  watchlist: Watchlist[];
  _count: {
    auctions: number;
    bids: number;
  };
};

// Form types
export interface CreateAuctionInput {
  title: string;
  description: string;
  category: AuctionCategory;
  condition: AuctionCondition;
  images: string[];
  startingBid: number;
  durationHours: number;
}

export interface PlaceBidInput {
  auctionId: string;
  amount: number;
}

// API response types
export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}

// Filter types
export interface AuctionFilters {
  category?: AuctionCategory;
  condition?: AuctionCondition;
  minBid?: number;
  maxBid?: number;
  search?: string;
  sortBy?: "endTime" | "currentBid" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// Auth types
export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  university: string | null;
  verified: boolean;
}
