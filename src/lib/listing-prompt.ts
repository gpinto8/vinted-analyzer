export type AnalyzeLocale = "it" | "en" | "es" | "fr";

export interface AnalyzeListingInput {
  images: string[];
  condition: string;
  productType?: string;
  brand?: string;
  locale?: AnalyzeLocale;
}

const LOCALE_LABEL: Record<AnalyzeLocale, string> = {
  it: "Italian",
  en: "English",
  es: "Spanish",
  fr: "French",
};

export function buildAnalysisPrompt(input: AnalyzeListingInput): string {
  const { condition, productType, brand, locale = "it" } = input;
  const language = LOCALE_LABEL[locale];

  return [
    "You are an expert fashion marketplace assistant specializing in secondhand clothing listings for Vinted, Wallapop, and similar platforms.",
    "",
    "Analyze these clothing photos carefully and generate a complete, professional listing.",
    "",
    "=== SELLER INPUT ===",
    `- Condition: ${condition}`,
    `- Product type (hint): ${productType || "Not specified"}`,
    `- Brand (hint): ${brand || "Not specified"}`,
    "",
    "=== INSTRUCTIONS ===",
    "",
    '1. TITLE: Write a catchy, SEO-optimized listing title (max 80 chars). Include brand, item type, key feature (color/pattern), and size if visible. Example: "Bershka Basic Black T-Shirt Size M"',
    "",
    "2. DESCRIPTION: Write a compelling 4-6 line description in paragraphs. Include: what the item is (type, brand), material and fabric (from visual cues), color and pattern, condition matching the seller's stated condition, and a closing line on why it's a good buy. No emojis. Professional tone.",
    "",
    '3. CATEGORY: Marketplace-style category path (e.g. "Men > T-shirts", "Women > Dresses > Mini dresses").',
    "",
    "4. BRAND: Identify from labels, logos, tags. If the seller gave a brand hint, cross-check with what you see. If unidentifiable, use the hint or empty string.",
    "",
    "5. SIZE: From tags/labels if visible. Use XS/S/M/L/XL/XXL or numeric (36, 38, 40, 42). If not visible, estimate from proportions.",
    "",
    '6. COLOR: Primary color (e.g. "Dark grey", "Navy blue", "Cream").',
    "",
    '7. MATERIAL: Fabric from visual texture or care label. Otherwise estimate (e.g. "100% Cotton", "Cotton blend").',
    "",
    '8. MEASUREMENTS: Realistic measurements in cm by garment type and estimated size. Tops: Chest, Length, Sleeve. Bottoms: Waist, Inseam, Length. Dresses: Bust, Waist, Length. If you cannot estimate, use "Not measured".',
    "",
    '9. TAGS: 5-8 search keywords (e.g. ["bershka", "tshirt", "black", "casual", "cotton"]).',
    "",
    "10. PRICING (numbers only):",
    "    - priceNew: Estimated retail price in EUR when new (typical for this brand and item).",
    "    - priceSuggested: Resale price in EUR by condition: New 70-85%, Like new 55-70%, Very good 40-55%, Good 30-45%, Fair 20-35%, Used 15-25% of retail.",
    "",
    "=== OUTPUT ===",
    "",
    "Return ONLY a valid JSON object with exactly these keys. No markdown, no backticks, no text before or after.",
    "",
    "{",
    '  "title": "string",',
    '  "description": "string (use \\\\n for paragraph breaks)",',
    '  "category": "string",',
    '  "brand": "string",',
    '  "size": "string",',
    '  "color": "string",',
    '  "material": "string",',
    `  "condition": "${condition}",`,
    '  "measurements": "string",',
    '  "tags": ["string"],',
    '  "priceNew": number,',
    '  "priceSuggested": number',
    "}",
    "",
    `priceNew and priceSuggested must be numbers (e.g. 29.99). Write all text in ${language}.`,
  ].join("\n");
}

export function extractPrice(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value).trim();
  const num = parseFloat(s);
  if (Number.isFinite(num)) return num;
  const match = s.match(/(\d+([.,]\d+)?)/);
  return match ? parseFloat(match[1].replace(",", ".")) : 0;
}

export function parseListingJson(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json?/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as Record<string, unknown>) : {};
  }
}

import type { ListingResult } from "@/types/listing";

export function mapToListingResult(data: Record<string, unknown>): ListingResult {
  return {
    title: String(data.title ?? data.titolo ?? "").trim() || undefined,
    description: String(data.description ?? data.descrizione ?? "").trim() || undefined,
    category: String(data.category ?? data.categoria ?? "").trim() || undefined,
    brand: String(data.brand ?? "").trim() || undefined,
    size: String(data.size ?? data.taglia ?? "").trim() || undefined,
    color: String(data.color ?? data.colore ?? "").trim() || undefined,
    material: String(data.material ?? data.materiale ?? "").trim() || undefined,
    condition: String(data.condition ?? data.condizione ?? "").trim() || undefined,
    measurements: String(data.measurements ?? data.misure ?? "").trim() || undefined,
    tags: Array.isArray(data.tags ?? data.tag) ? ((data.tags ?? data.tag) as string[]) : undefined,
    priceNew: extractPrice(data.priceNew ?? data.prezzo_nuovo ?? data.price_new),
    priceSuggested: extractPrice(data.priceSuggested ?? data.prezzo_vinted ?? data.price_suggested),
  };
}
