import type { ListingResult } from "@/types/listing";

const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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

function buildPrompt(input: AnalyzeListingInput): string {
  const { images, condition, productType, brand, locale = "it" } = input;
  const language = LOCALE_LABEL[locale];
  const lines = [
    `Analyze these ${images.length} clothing photos and generate listing data for a secondhand marketplace (e.g. Vinted).`,
    "",
    `Write the title, description, category, color, material, measurements, and tags in ${language}. Keep the same structure and keys.`,
    "",
    `SELLER-STATED CONDITION: ${condition}`,
    ...(productType ? [`Product type (hint): ${productType}`] : []),
    ...(brand ? [`Brand (hint): ${brand}`] : []),
    "",
    "Return a valid JSON object with exactly these keys (no other keys):",
    "",
    "- title: catchy listing title, max 80 chars (e.g. 'Black Zara oversize t-shirt size S')",
    "- description: full listing description, 3-6 lines. Describe the item, material, color, actual condition, any flaws, why it's a good buy. No emojis.",
    "- category: category path (e.g. 'Women > T-shirts' or 'Men > Jeans')",
    "- brand: brand if recognizable from photos or labels, else empty string",
    "- size: S, M, L, XL, XXL or numeric (38, 40, 42) as appropriate",
    "- color: main color (e.g. Black, Navy, Beige)",
    "- material: composition if visible (e.g. 100% Cotton, Cotton and elastane)",
    `- condition: repeat exactly: ${condition}`,
    "- measurements: measurements in cm for the buyer (e.g. 'Chest 52cm, Length 68cm, Sleeve 22cm' for a top). If not deducible, use 'Not measured'",
    "- tags: array of 5-8 relevant search tags (e.g. ['oversize', 'casual', 'cotton', 'black'])",
    "- priceNew: number, estimated retail price in EUR when new (e.g. 29.99, 45). Must be a number only.",
    "- priceSuggested: number, suggested selling price in EUR for this condition. Typically 40-60% of priceNew for 'Very good', 50-70% for 'New without tags', 60-80% for 'New with tags'. Must be a number only (e.g. 12, 15.50).",
    "",
    "Rules: priceNew and priceSuggested must be numbers only, no text or symbols. Return ONLY the JSON object, no markdown or text before/after.",
  ];
  return lines.join("\n");
}

function extractPrice(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value).trim();
  const num = parseFloat(s);
  if (Number.isFinite(num)) return num;
  const match = s.match(/(\d+([.,]\d+)?)/);
  return match ? parseFloat(match[1].replace(",", ".")) : 0;
}

function parseGeminiResponse(json: Record<string, unknown>): ListingResult {
  const text =
    (json.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }>)?.[0]?.content
      ?.parts?.[0]?.text ?? "";
  const raw = String(text).replace(/```json?/gi, "").replace(/```/g, "").trim();

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    data = match ? (JSON.parse(match[0]) as Record<string, unknown>) : {};
  }

  const result: ListingResult = {
    title: String(data.title ?? data.titolo ?? "").trim() || undefined,
    description: String(data.description ?? data.descrizione ?? "").trim() || undefined,
    category: String(data.category ?? data.categoria ?? "").trim() || undefined,
    brand: String(data.brand ?? "").trim() || undefined,
    size: String(data.size ?? data.taglia ?? "").trim() || undefined,
    color: String(data.color ?? data.colore ?? "").trim() || undefined,
    material: String(data.material ?? data.materiale ?? "").trim() || undefined,
    condition: String(data.condition ?? data.condizione ?? "").trim() || undefined,
    measurements: String(data.measurements ?? data.misure ?? "").trim() || undefined,
    tags: Array.isArray(data.tags ?? data.tag) ? (data.tags ?? data.tag) as string[] : undefined,
    priceNew: extractPrice(data.priceNew ?? data.prezzo_nuovo ?? data.price_new),
    priceSuggested: extractPrice(data.priceSuggested ?? data.prezzo_vinted ?? data.price_suggested),
  };

  return result;
}

export async function analyzeListingWithGemini(
  apiKey: string,
  input: AnalyzeListingInput
): Promise<ListingResult> {
  const { images, condition } = input;
  if (images.length === 0) throw new Error("At least one image is required");
  if (!condition.trim()) throw new Error("Condition is required");

  const limitedImages = images.slice(0, 16);
  const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> =
    limitedImages.map((b64) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: typeof b64 === "string" ? b64.replace(/^data:image\/\w+;base64,/, "") : "",
      },
    }));
  parts.push({ text: buildPrompt(input) });

  const res = await fetch(`${GEMINI_API_BASE}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const responseJson = (await res.json()) as Record<string, unknown>;
  return parseGeminiResponse(responseJson);
}
