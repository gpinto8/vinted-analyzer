import { NextRequest, NextResponse } from "next/server";
import type { ListingResult } from "@/types/listing";

const DEEPL_FREE = "https://api-free.deepl.com/v2/translate";

const LOCALE_TO_DEEPL: Record<string, string> = {
  it: "IT",
  en: "EN",
  es: "ES",
  fr: "FR",
};

const LOCALE_TO_GOOGLE: Record<string, string> = {
  it: "it",
  en: "en",
  es: "es",
  fr: "fr",
};

const TEXT_KEYS: (keyof ListingResult)[] = [
  "title",
  "description",
  "category",
  "productType",
  "brand",
  "size",
  "color",
  "material",
  "condition",
  "measurements",
];

type Locale = "it" | "en" | "es" | "fr";

type RequestTexts = {
  condition?: string;
  productType?: string;
  brand?: string;
};

function collectTexts(result: ListingResult): string[] {
  const texts: string[] = [];

  for (const key of TEXT_KEYS) {
    const value = result[key];
    if (typeof value === "string" && value.trim()) {
      texts.push(value.trim());
    }
  }

  if (Array.isArray(result.tags)) {
    for (const tag of result.tags) {
      if (typeof tag === "string" && tag.trim()) {
        texts.push(tag.trim());
      }
    }
  }

  return texts;
}

function applyTranslations(
  result: ListingResult,
  translations: string[]
): ListingResult {
  const out = { ...result };
  let idx = 0;

  for (const key of TEXT_KEYS) {
    const value = result[key];
    if (typeof value === "string" && value.trim()) {
      if (translations[idx] !== undefined) out[key as keyof ListingResult] = translations[idx];
      idx++;
    }
  }

  if (Array.isArray(result.tags)) {
    const newTags: string[] = [];
    for (const tag of result.tags) {
      if (typeof tag === "string" && tag.trim()) {
        newTags.push(translations[idx] ?? tag);
        idx++;
      } else {
        newTags.push(tag);
      }
    }
    out.tags = newTags;
  }

  return out;
}

function collectRequestTexts(requestTexts?: RequestTexts): string[] {
  const out: string[] = [];
  // Keep ordering stable so we can apply by index.
  for (const key of ["productType", "brand", "condition"] as const) {
    const v = requestTexts?.[key];
    if (typeof v === "string" && v.trim()) out.push(v.trim());
  }
  return out;
}

function applyRequestTranslations(requestTexts: RequestTexts | undefined, translations: string[]): RequestTexts | undefined {
  if (!requestTexts) return undefined;
  const out: RequestTexts = { ...requestTexts };
  let idx = 0;
  for (const key of ["productType", "brand", "condition"] as const) {
    const v = requestTexts[key];
    if (typeof v === "string" && v.trim()) {
      if (translations[idx] !== undefined) out[key] = translations[idx];
      idx++;
    }
  }
  return out;
}

async function translateWithDeepL(texts: string[], targetLocale: Locale, authKey: string): Promise<string[]> {
  const targetLang = LOCALE_TO_DEEPL[targetLocale] ?? "EN";
  const res = await fetch(DEEPL_FREE, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${authKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texts,
      target_lang: targetLang,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { translations?: Array<{ text: string }> };
  return data.translations?.map((t) => t.text) ?? [];
}

async function translateOneWithGoogle(text: string, targetLocale: Locale, signal?: AbortSignal): Promise<string> {
  const tl = LOCALE_TO_GOOGLE[targetLocale] ?? "en";
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", tl);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url.toString(), { method: "GET", signal });
  if (!res.ok) throw new Error(`Google translate error: ${res.status}`);

  const data = (await res.json()) as unknown;
  // Shape: [[["translated","original",null,null,...], ...], null, "en", ...]
  if (!Array.isArray(data) || !Array.isArray(data[0])) return text;
  const parts = data[0]
    .map((chunk) => (Array.isArray(chunk) ? chunk[0] : ""))
    .filter((s) => typeof s === "string" && s.length > 0);
  return parts.join("") || text;
}

async function translateWithGoogle(texts: string[], targetLocale: Locale): Promise<string[]> {
  // Concurrency-limited mapper (avoid hammering the endpoint).
  const concurrency = 5;
  const out: string[] = new Array(texts.length);
  let nextIdx = 0;

  async function worker() {
    while (true) {
      const i = nextIdx++;
      if (i >= texts.length) return;
      const t = texts[i] ?? "";
      if (!t.trim()) {
        out[i] = t;
        continue;
      }
      try {
        out[i] = await translateOneWithGoogle(t, targetLocale);
      } catch {
        out[i] = t;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, texts.length) }, () => worker()));
  return out;
}

async function translateTexts(texts: string[], targetLocale: Locale): Promise<string[]> {
  const authKey = process.env.DEEPL_AUTH_KEY?.trim();
  if (authKey) {
    try {
      return await translateWithDeepL(texts, targetLocale, authKey);
    } catch {
      // Fall back to Google when DeepL is down or rate-limited.
      return await translateWithGoogle(texts, targetLocale);
    }
  }
  return await translateWithGoogle(texts, targetLocale);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetLocale = (body?.targetLocale ?? "en") as Locale;

    // Mode A: translate a ListingResult (+ optional requestTexts)
    if (body?.result && typeof body.result === "object") {
      const { result, requestTexts } = body as {
        result: ListingResult;
        requestTexts?: RequestTexts;
        targetLocale: Locale;
      };

      const texts = collectTexts(result);
      const reqTexts = collectRequestTexts(requestTexts);
      const combined = [...texts, ...reqTexts];

      if (combined.length === 0) {
        return NextResponse.json({ result, requestTexts });
      }

      const translatedCombined = await translateTexts(combined, targetLocale);
      const translatedResult = applyTranslations(result, translatedCombined.slice(0, texts.length));
      const translatedRequestTexts = applyRequestTranslations(
        requestTexts,
        translatedCombined.slice(texts.length)
      );

      return NextResponse.json({ result: translatedResult, requestTexts: translatedRequestTexts });
    }

    // Mode B: translate arbitrary list of strings
    if (Array.isArray(body?.texts)) {
      const { texts, targetLocale: tl } = body as { texts: string[]; targetLocale: Locale };
      const safeTexts = texts.filter((t) => typeof t === "string");
      const translated = safeTexts.length ? await translateTexts(safeTexts, tl) : [];
      return NextResponse.json({ translations: translated });
    }

    return NextResponse.json({ error: "Missing or invalid payload" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
