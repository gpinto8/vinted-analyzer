import type { ListingResult, SellabilityBreakdown, VerifiedResult } from "@/types/listing";

const HIGH_DEMAND_BRANDS = new Set([
  "nike", "adidas", "carhartt", "stussy", "the north face", "patagonia",
  "ralph lauren", "tommy hilfiger", "levi's", "levis", "converse", "vans",
  "new balance", "puma", "jordan", "champion", "dickies", "timberland",
]);

const MID_DEMAND_BRANDS = new Set([
  "zara", "massimo dutti", "cos", "mango", "uniqlo", "lacoste",
  "calvin klein", "hugo boss", "guess", "superdry", "columbia",
  "pull&bear", "bershka", "asos",
]);

const LOW_DEMAND_BRANDS = new Set([
  "h&m", "hm", "primark", "shein", "kiabi", "terranova", "ovs",
]);

const HIGH_DEMAND_CATEGORIES = [
  "hoodie", "hoodies", "jacket", "jackets", "sneakers", "shoes",
  "jeans", "denim", "coat", "coats", "puffer", "fleece", "windbreaker",
  "cargo", "sweatshirt", "sweatshirts", "bomber",
];

const MID_DEMAND_CATEGORIES = [
  "t-shirt", "t-shirts", "shirt", "shirts", "sweater", "sweaters",
  "pants", "trousers", "shorts", "dress", "dresses", "skirt", "skirts",
  "cardigan", "polo", "blazer",
];

const CONDITION_SCORES: Record<string, number> = {
  "New": 25,
  "Like new": 22,
  "Very good": 18,
  "Good": 14,
  "Fair": 8,
  "Used": 5,
};

const MAX_BRAND = 30;
const MAX_CONDITION = 25;
const MAX_PRICE = 25;
const MAX_CATEGORY = 15;
const MAX_QUALITY = 5;

function normalizeBrand(brand: string): string {
  return brand.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreBrandDemand(brand?: string): number {
  if (!brand?.trim()) return 8;
  const key = normalizeBrand(brand);
  if (HIGH_DEMAND_BRANDS.has(key)) return 27;
  if (MID_DEMAND_BRANDS.has(key)) return 18;
  if (LOW_DEMAND_BRANDS.has(key)) return 10;
  return 14;
}

function scoreCondition(condition?: string): number {
  if (!condition) return 12;
  return CONDITION_SCORES[condition] ?? 12;
}

function scorePricePositioning(
  priceSuggested?: number,
  priceNew?: number,
  verifiedRetail?: VerifiedResult,
  condition?: string,
): number {
  const retailRef = verifiedRetail?.price ?? priceNew;
  if (!retailRef || retailRef <= 0 || !priceSuggested || priceSuggested <= 0) return 13;

  const conditionFactors: Record<string, number> = {
    "New": 0.75, "Like new": 0.60, "Very good": 0.45,
    "Good": 0.35, "Fair": 0.25, "Used": 0.15,
  };
  const factor = conditionFactors[condition ?? ""] ?? 0.40;
  const expectedPrice = retailRef * factor;
  const ratio = priceSuggested / expectedPrice;

  if (ratio >= 0.85 && ratio <= 1.15) return 23;
  if (ratio >= 0.70 && ratio <= 1.30) return 18;
  if (ratio >= 0.50 && ratio <= 1.50) return 13;
  return 7;
}

function scoreCategoryDemand(productType?: string, category?: string): number {
  const text = `${productType ?? ""} ${category ?? ""}`.toLowerCase();
  if (HIGH_DEMAND_CATEGORIES.some((kw) => text.includes(kw))) return 13;
  if (MID_DEMAND_CATEGORIES.some((kw) => text.includes(kw))) return 10;
  return 6;
}

function scoreListingQuality(data: ListingResult): number {
  let score = 0;
  if (data.title?.trim()) score += 1;
  if (data.description && data.description.length > 50) score += 1;
  if (data.measurements && Object.keys(data.measurements).length > 0) score += 1;
  if (data.color?.trim()) score += 0.5;
  if (data.material?.trim()) score += 0.5;
  if (data.size?.trim()) score += 0.5;
  if (data.brand?.trim()) score += 0.5;
  return Math.min(score, MAX_QUALITY);
}

export function computeSellability(data: ListingResult): {
  score: number;
  breakdown: SellabilityBreakdown;
} {
  const brandDemand = scoreBrandDemand(data.brand);
  const condition = scoreCondition(data.condition);
  const pricePositioning = scorePricePositioning(
    data.priceSuggested, data.priceNew, data.verifiedRetail, data.condition,
  );
  const categoryDemand = scoreCategoryDemand(data.productType, data.category);
  const listingQuality = scoreListingQuality(data);

  const raw = brandDemand + condition + pricePositioning + categoryDemand + listingQuality;
  const maxTotal = MAX_BRAND + MAX_CONDITION + MAX_PRICE + MAX_CATEGORY + MAX_QUALITY;
  const score = Math.round((raw / maxTotal) * 100);

  return {
    score: Math.max(0, Math.min(100, score)),
    breakdown: { brandDemand, condition, pricePositioning, categoryDemand, listingQuality },
  };
}

export const SELLABILITY_MAX = {
  brandDemand: MAX_BRAND,
  condition: MAX_CONDITION,
  pricePositioning: MAX_PRICE,
  categoryDemand: MAX_CATEGORY,
  listingQuality: MAX_QUALITY,
} as const;
