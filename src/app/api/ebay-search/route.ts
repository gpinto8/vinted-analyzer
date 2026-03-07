import { NextRequest, NextResponse } from "next/server";
import type { VerifiedResult } from "@/types/listing";

// MOCK: replace with real eBay Browse API call when credentials are ready.
// To use the real API, obtain EBAY_CLIENT_ID and EBAY_CLIENT_SECRET from
// https://developer.ebay.com and implement the OAuth + Browse API flow.

const BRAND_PRICE_RANGES: Record<string, [number, number]> = {
  nike: [45, 90],
  adidas: [40, 85],
  "the north face": [60, 120],
  patagonia: [55, 110],
  carhartt: [50, 100],
  "ralph lauren": [55, 110],
  zara: [20, 50],
  "massimo dutti": [35, 70],
  mango: [25, 55],
  uniqlo: [15, 40],
  "h&m": [10, 30],
  hm: [10, 30],
  bershka: [12, 35],
  "pull&bear": [12, 35],
  primark: [8, 20],
};

const DEFAULT_PRICE_RANGE: [number, number] = [20, 60];

function mockEbaySearch(brand: string, productType: string, title: string): VerifiedResult | null {
  // MOCK: Return a verified result ~60% of the time when brand is known, ~30% otherwise
  const hasBrand = brand.trim().length > 0;
  const threshold = hasBrand ? 0.4 : 0.7;
  const rand = Math.random();
  if (rand > threshold) {
    return null;
  }

  const normalizedBrand = brand.toLowerCase().replace(/\s+/g, " ").trim();
  const [min, max] = BRAND_PRICE_RANGES[normalizedBrand] ?? DEFAULT_PRICE_RANGE;
  const price = Math.round((min + Math.random() * (max - min)) * 100) / 100;

  const mockItemId = Math.floor(100000000 + Math.random() * 900000000);
  const productName = title || `${brand} ${productType}`.trim() || "Fashion item";

  return {
    source: {
      name: "eBay",
      url: `https://www.ebay.it/itm/${mockItemId}`,
    },
    price,
    currency: "EUR",
    productName,
    brand: brand || undefined,
    fetchedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, productType, title } = body as {
      brand?: string;
      productType?: string;
      title?: string;
    };

    // MOCK: In production, check for EBAY_CLIENT_ID/EBAY_CLIENT_SECRET
    // const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
    // const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
    // if (!EBAY_CLIENT_ID?.trim() || !EBAY_CLIENT_SECRET?.trim()) {
    //   return NextResponse.json({ verified: null });
    // }

    const verified = mockEbaySearch(
      brand ?? "",
      productType ?? "",
      title ?? "",
    );

    return NextResponse.json({ verified });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
