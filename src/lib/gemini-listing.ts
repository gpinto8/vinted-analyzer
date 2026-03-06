import type { ListingResult } from "@/types/listing";
import {
  type AnalyzeListingInput,
  buildAnalysisPrompt,
  parseListingJson,
  mapToListingResult,
} from "./listing-prompt";

export type { AnalyzeListingInput };
export type { AnalyzeLocale } from "./listing-prompt";

const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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
  parts.push({ text: buildAnalysisPrompt(input) });

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

  const json = (await res.json()) as Record<string, unknown>;
  const text =
    (json.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }>)?.[0]?.content
      ?.parts?.[0]?.text ?? "";

  const data = parseListingJson(text);
  return mapToListingResult(data);
}
