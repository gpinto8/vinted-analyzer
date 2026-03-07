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
    "You are a top-performing Vinted seller and SEO specialist for secondhand fashion marketplaces (Vinted, Wallapop, Depop). Your listings consistently rank #1 in search results and convert at 3x the average rate.",
    "",
    "Analyze these clothing photos and generate a listing engineered to SELL.",
    "",
    "=== SELLER INPUT ===",
    `- Condition: ${condition}`,
    `- Product type (hint): ${productType || "Not specified"}`,
    `- Brand (hint): ${brand || "Not specified"}`,
    "",
    "=== INSTRUCTIONS ===",
    "",
    "1. TITLE (max 80 chars):",
    "   Structure: [Brand] [Differentiator?] [Specific Garment Type] [Color/Pattern] [Size]",
    '   - LEAD with the brand name (most-searched keyword on Vinted)',
    "   - Use the SPECIFIC garment type buyers search for (not generic 'top' — use 'oversized hoodie', 'slim fit chinos', 'crop cardigan', etc.)",
    "   - Add the dominant color or pattern (e.g. 'navy blue', 'plaid', 'striped')",
    "   - End with size (e.g. 'Size M', 'EU 42')",
    "   - Add ONE truthful differentiator if applicable: vintage, Y2K, limited edition, deadstock, streetwear, gorpcore, minimalist, archive",
    "   - No emojis, no ALL CAPS, no special symbols",
    "   - Think: what would a buyer TYPE in the Vinted search bar to find this exact item?",
    '   - Example: "Nike Vintage Oversized Hoodie Grey Size L"',
    "",
    "2. DESCRIPTION (5-8 lines, paragraph-based, use \\n between paragraphs):",
    "   Paragraph 1 — HOOK: One compelling line stating what the item is and why it's desirable.",
    '     Example: "Hard-to-find Nike ACG fleece in excellent condition — perfect for layering."',
    "   Paragraph 2 — FEATURES: Detailed fabric/material feel, fit description (oversized/slim/regular/relaxed), accurate color, notable details (zip type, logo placement, pockets, embroidery, stitching).",
    "   Paragraph 3 — CONDITION: Honest description matching the seller's stated condition. If below 'Like new', mention any visible wear honestly — buyers trust transparent sellers.",
    "   Paragraph 4 — SIZE & FIT: Size guidance with fit advice (e.g. 'Tagged M, fits true to size. Works for a relaxed look on S.').",
    "   Final line — CTA: Warm closing (e.g. 'Message me for more details or bundle discounts!').",
    "   Rules: NO emojis. Professional but warm/conversational tone. Naturally weave in searchable keywords (brand name, garment type, style, 'secondhand') without keyword-stuffing.",
    "",
    '3. CATEGORY: Marketplace category path (e.g. "Men > T-shirts", "Women > Dresses > Mini dresses").',
    "",
    "4. BRAND: Identify from labels, logos, tags visible in the photos. Cross-check with seller hint. Use hint or empty string if unidentifiable.",
    "",
    "5. SIZE: Read from tags/labels. Use XS/S/M/L/XL/XXL or numeric (36, 38, 40, 42). Estimate from proportions if not visible.",
    "",
    '6. COLOR: Primary color as buyers search it (e.g. "Dark grey", "Navy blue", "Cream", "Burgundy").',
    "",
    '7. MATERIAL: From care label or visual texture. Be specific (e.g. "100% Cotton", "80% Cotton 20% Polyester", "Wool blend").',
    "",
    "8. MEASUREMENTS: Return as a JSON object with measurement names as keys and cm values as numbers (no units in values).",
    "   By garment type:",
    "   - Tops (t-shirts, shirts, hoodies, sweaters, jackets): Chest, Length, Shoulder, Sleeve",
    "   - Bottoms (pants, jeans, shorts, skirts): Waist, Hips, Inseam, Length",
    "   - Dresses/Jumpsuits: Bust, Waist, Hips, Length",
    "   - Outerwear (coats, jackets): Chest, Length, Shoulder, Sleeve",
    "   Estimate realistic measurements based on the detected size using standard sizing charts for that brand tier.",
    '   Example for a Size M hoodie: { "Chest": 56, "Length": 70, "Shoulder": 48, "Sleeve": 64 }',
    "   If you truly cannot estimate, return an empty object {}.",
    "",
    '9. TAGS: 5-8 lowercase search keywords buyers would use (e.g. ["nike", "hoodie", "vintage", "grey", "streetwear", "oversized", "cotton"]).',
    "",
    "10. PRICING (numbers only, in EUR):",
    "    - priceNew: Estimated original retail price. Consider the brand tier:",
    "      Luxury (Gucci, Prada, etc.): use actual retail ranges.",
    "      Premium (Nike, Adidas, The North Face, etc.): typically 40-120 EUR.",
    "      Mid-range (Zara, Massimo Dutti, COS): typically 20-80 EUR.",
    "      Fast-fashion (Bershka, Primark, H&M): typically 8-35 EUR.",
    "    - priceSuggested: Competitive resale price factoring brand demand, condition, and secondhand market reality:",
    "      New: 65-80% of retail. Like new: 50-65%. Very good: 35-50%. Good: 25-40%. Fair: 15-30%. Used: 10-20%.",
    "      For high-demand brands (Nike, Carhartt, Stussy, etc.) use the upper end. For fast-fashion use the lower end.",
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
    '  "measurements": { "MeasurementName": number },',
    '  "tags": ["string"],',
    '  "priceNew": number,',
    '  "priceSuggested": number',
    "}",
    "",
    `priceNew and priceSuggested must be plain numbers (e.g. 29.99). measurements must be a JSON object (not a string). Write all text in ${language}.`,
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

function parseMeasurements(raw: unknown): Record<string, number> | undefined {
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    const result: Record<string, number> = {};
    for (const [key, val] of Object.entries(obj)) {
      const num = typeof val === "number" ? val : parseFloat(String(val));
      if (Number.isFinite(num) && num > 0) result[key] = Math.round(num);
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  if (typeof raw === "string" && raw.trim()) {
    const result: Record<string, number> = {};
    const pairs = raw.split(/[,;]+/);
    for (const pair of pairs) {
      const match = pair.match(/([A-Za-z\s]+)\s*[:\-]\s*(\d+(?:\.\d+)?)/);
      if (match) {
        const name = match[1].trim();
        const val = parseFloat(match[2]);
        if (name && Number.isFinite(val) && val > 0) result[name] = Math.round(val);
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  return undefined;
}

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
    measurements: parseMeasurements(data.measurements ?? data.misure),
    tags: Array.isArray(data.tags ?? data.tag) ? ((data.tags ?? data.tag) as string[]) : undefined,
    priceNew: extractPrice(data.priceNew ?? data.prezzo_nuovo ?? data.price_new),
    priceSuggested: extractPrice(data.priceSuggested ?? data.prezzo_vinted ?? data.price_suggested),
  };
}
