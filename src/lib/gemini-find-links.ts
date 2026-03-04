export interface ProductLink {
  name: string;
  url: string;
}

export type FindProductLocale = "it" | "en" | "es";

export interface FindProductLinksInput {
  title: string;
  brand?: string;
  productType?: string;
  locale?: FindProductLocale;
}

function extractUrlsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s\]"')>]+/g;
  const matches = text.match(urlRegex) ?? [];
  const seen = new Set<string>();
  return matches
    .map((u) => {
      try {
        const url = new URL(u);
        if (!url.hostname || (url.protocol !== "https:" && url.protocol !== "http:")) return null;
        const clean = url.origin + url.pathname.replace(/\/+$/, "");
        if (seen.has(clean)) return null;
        seen.add(clean);
        return clean;
      } catch {
        return null;
      }
    })
    .filter((u): u is string => u != null)
    .slice(0, 8);
}

function extractChunkUris(metadata: unknown): string[] {
  const chunks = (metadata as { groundingChunks?: Array<{ web?: { uri?: string } }> })?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    if (typeof uri === "string" && uri.startsWith("http") && !seen.has(uri)) {
      seen.add(uri);
      urls.push(uri);
    }
  }
  return urls.slice(0, 8);
}

function domainName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const base = host.split(".").slice(-2).join(".");
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "Link";
  }
}

const LOCALE_HINT: Record<FindProductLocale, string> = {
  it: "Prefer Italian or .it e-commerce sites (e.g. zalando.it, bershka.com/it). Search in Italian.",
  en: "Prefer UK/International or .co.uk/.com e-commerce sites. Search in English.",
  es: "Prefer Spanish or .es e-commerce sites (e.g. zalando.es). Search in Spanish.",
};

export async function findProductLinksWithGemini(
  apiKey: string,
  input: FindProductLinksInput
): Promise<ProductLink[]> {
  const { title, brand = "", productType = "", locale = "it" } = input;
  const query = [title, brand, productType].filter(Boolean).join(" ");
  if (!query.trim()) return [];

  const localeHint = LOCALE_HINT[locale];
  const prompt = `Find 4-6 real product detail page (PDP) URLs or official product search URLs where a customer can buy this clothing item or a very similar one. Product: "${query}". ${localeHint} Return only valid https URLs. List each URL on a new line, nothing else.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.2 },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      groundingMetadata?: unknown;
    }>;
  };

  const candidate = json.candidates?.[0];
  if (!candidate) return [];

  let urls: string[] = [];
  const metadata = candidate.groundingMetadata;
  if (metadata) {
    urls = extractChunkUris(metadata);
  }
  const text = candidate.content?.parts?.[0]?.text ?? "";
  if (urls.length < 3 && text) {
    const fromText = extractUrlsFromText(text);
    const merged = [...urls];
    for (const u of fromText) {
      if (!merged.includes(u)) merged.push(u);
    }
    urls = merged.slice(0, 8);
  }

  return urls.map((url) => ({ name: domainName(url), url }));
}
