interface BidValidationInput {
  auction: {
    id: string;
    status: string;
    endTime: Date;
    currentBid: number;
    sellerId: string;
    highestBidderId: string | null;
  } | null;
  bidderId: string;
  amount: number;
}

interface BidValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBid({
  auction,
  bidderId,
  amount,
}: BidValidationInput): BidValidationResult {
  if (!auction) {
    return { valid: false, error: "Auction not found." };
  }

  if (auction.status !== "ACTIVE") {
    return { valid: false, error: "This auction is no longer active." };
  }

  if (new Date() >= auction.endTime) {
    return { valid: false, error: "This auction has ended." };
  }

  if (auction.sellerId === bidderId) {
    return { valid: false, error: "You cannot bid on your own auction." };
  }

  if (auction.highestBidderId === bidderId) {
    return {
      valid: false,
      error: "You are already the highest bidder.",
    };
  }

  const minimumBid = getMinimumBid(auction.currentBid);
  if (amount < minimumBid) {
    return {
      valid: false,
      error: `Bid must be at least ₹${minimumBid.toFixed(2)} (current: ₹${auction.currentBid.toFixed(2)}).`,
    };
  }

  return { valid: true };
}

/**
 * Calculate minimum acceptable bid based on current bid.
 * Uses tiered increments similar to eBay:
 * - Under ₹25: ₹0.50 increments
 * - ₹25–₹99: ₹1 increments
 * - ₹100–₹249: ₹2.50 increments
 * - ₹250–₹499: ₹5 increments
 * - ₹500–₹999: ₹10 increments
 * - ₹1000+: ₹25 increments
 */
export function getMinimumBid(currentBid: number): number {
  if (currentBid < 25) return Math.ceil((currentBid + 0.5) * 100) / 100;
  if (currentBid < 100) return currentBid + 1;
  if (currentBid < 250) return currentBid + 2.5;
  if (currentBid < 500) return currentBid + 5;
  if (currentBid < 1000) return currentBid + 10;
  return currentBid + 25;
}
