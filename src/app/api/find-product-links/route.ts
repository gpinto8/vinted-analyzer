import { NextRequest, NextResponse } from "next/server";
import { findProductLinksWithGemini } from "@/lib/gemini-find-links";

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
    const { title, brand, productType, locale } = body as {
      title?: string;
      brand?: string;
      productType?: string;
      locale?: "it" | "en" | "es";
    };

    const links = await findProductLinksWithGemini(GEMINI_API_KEY, {
      title: title ?? "",
      brand: brand ?? "",
      productType: productType ?? "",
      locale: locale === "it" || locale === "es" ? locale : "it",
    });

    return NextResponse.json(links);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
