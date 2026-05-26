import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const imageUrls: string[] = [];

    for (const file of files) {
      // Limit size to 10MB per image
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64Data}`;

      const url = await uploadImage(dataUri, "campusbid/auctions");
      imageUrls.push(url);
    }

    return NextResponse.json({ urls: imageUrls });
  } catch (error) {
    console.error("[UPLOAD ERROR]", error);
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
  }
}
