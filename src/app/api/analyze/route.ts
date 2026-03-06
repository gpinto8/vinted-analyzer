import { NextRequest, NextResponse } from "next/server";
import { analyzeListingWithGroq } from "@/lib/groq-listing";
import { analyzeListingWithGemini } from "@/lib/gemini-listing";
import type { AnalyzeListingInput } from "@/lib/listing-prompt";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY?.trim() && !GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "No AI API key is configured (GROQ_API_KEY or GEMINI_API_KEY)" },
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
    const input: AnalyzeListingInput = {
      images: images ?? [],
      condition: condition ?? "",
      productType: productType ?? "",
      brand: brand ?? "",
      locale: locale && validLocales.has(locale) ? locale : "it",
    };

    if (GROQ_API_KEY?.trim()) {
      try {
        const result = await analyzeListingWithGroq(GROQ_API_KEY, input);
        return NextResponse.json(result);
      } catch (groqErr) {
        console.warn("[analyze] Groq failed, falling back to Gemini:", groqErr);
        if (!GEMINI_API_KEY?.trim()) throw groqErr;
      }
    }

    const result = await analyzeListingWithGemini(GEMINI_API_KEY!, input);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
