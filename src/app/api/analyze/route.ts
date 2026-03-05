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
    const { images, condition, productType, brand, locale } = body as {
      images?: string[];
      condition?: string;
      productType?: string;
      brand?: string;
      locale?: "it" | "en" | "es" | "fr";
    };

    const validLocales = new Set(["it", "en", "es", "fr"] as const);
    const result = await analyzeListingWithGemini(GEMINI_API_KEY, {
      images: images ?? [],
      condition: condition ?? "",
      productType: productType ?? "",
      brand: brand ?? "",
      locale: locale && validLocales.has(locale) ? locale : "it",
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
