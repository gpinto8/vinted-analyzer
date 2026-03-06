import type { ListingResult } from "@/types/listing";
import {
  type AnalyzeListingInput,
  buildAnalysisPrompt,
  parseListingJson,
  mapToListingResult,
} from "./listing-prompt";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const MAX_IMAGES = 5;

export async function analyzeListingWithGroq(
  apiKey: string,
  input: AnalyzeListingInput
): Promise<ListingResult> {
  const { images, condition } = input;
  if (images.length === 0) throw new Error("At least one image is required");
  if (!condition.trim()) throw new Error("Condition is required");

  const limitedImages = images.slice(0, MAX_IMAGES);
  const imageContent = limitedImages.map((b64) => {
    const data = b64.replace(/^data:image\/\w+;base64,/, "");
    return {
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${data}` },
    };
  });

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: [...imageContent, { type: "text", text: buildAnalysisPrompt(input) }],
        },
      ],
      max_tokens: 2048,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${res.status} ${errText}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = json.choices?.[0]?.message?.content ?? "";
  const data = parseListingJson(text);
  return mapToListingResult(data);
}
