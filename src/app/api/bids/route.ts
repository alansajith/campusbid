import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { auctionId, amount } = await request.json();

    if (!auctionId || !amount) {
      return NextResponse.json({ error: "Missing auctionId or amount." }, { status: 400 });
    }

    const { placeBid } = await import("@/actions/bid");
    const result = await placeBid({ auctionId, amount });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ bid: result.bid }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const auctionId = searchParams.get("auctionId");

  if (!auctionId) {
    return NextResponse.json({ error: "auctionId required." }, { status: 400 });
  }

  const bids = await prisma.bid.findMany({
    where: { auctionId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      bidder: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({ bids });
}
