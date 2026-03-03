import { NextRequest, NextResponse } from "next/server";
import { analyzeListingWithGemini } from "@/lib/gemini-listing";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { images, condition, productType, brand } = body as {
      images?: string[];
      condition?: string;
      productType?: string;
      brand?: string;
    };

    const result = await analyzeListingWithGemini(GEMINI_API_KEY, {
      images: images ?? [],
      condition: condition ?? "",
      productType: productType ?? "",
      brand: brand ?? "",
    });

    if (productType?.trim()) result.productType = productType.trim();
    if (brand?.trim()) {
      result.brand = brand.trim();
      result.brandFromUser = true;
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
