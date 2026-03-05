import type { ListingResult } from "@/types/listing";
import type { Locale } from "@/contexts/LanguageContext";

export interface VerifyLink {
  name: string;
  url: string;
  isOfficialBrand?: boolean;
}

function encodeQuery(q: string): string {
  return encodeURIComponent(q.trim());
}

function buildSearchQuery(data: ListingResult): string {
  const title = (data.title ?? "").trim();
  if (title) return title;
  const parts = [data.brand, data.productType].filter(Boolean);
  return parts.join(" ") || "";
}

const LOCALE_SUFFIX: Record<Locale, { zalando: string; aboutYou: string; hm: string; zara: string }> = {
  it: { zalando: "it", aboutYou: "it", hm: "it_it", zara: "it/it" },
  en: { zalando: "co.uk", aboutYou: "com", hm: "en_gb", zara: "com/en" },
  es: { zalando: "es", aboutYou: "es", hm: "es_es", zara: "es/es" },
  fr: { zalando: "fr", aboutYou: "fr", hm: "fr_fr", zara: "fr/fr" },
};

function getRetailerSearchUrls(query: string, locale: Locale): VerifyLink[] {
  const q = encodeQuery(query);
  if (!q) return [];
  const s = LOCALE_SUFFIX[locale];
  return [
    {
      name: "Zalando",
      url: `https://www.zalando.${s.zalando}/search/?q=${q}`,
    },
    {
      name: "About You",
      url: `https://www.aboutyou.${s.aboutYou}/search?q=${q}`,
    },
    {
      name: "ASOS",
      url: `https://www.asos.com/search/?q=${q}`,
    },
    {
      name: "H&M",
      url: `https://www2.hm.com/${s.hm}/search-results.html?q=${q}`,
    },
    {
      name: "Zara",
      url: `https://www.zara.com/${s.zara}/search?q=${q}`,
    },
  ];
}

const OFFICIAL_BRAND_SITES: Record<
  string,
  { name: string; getSearchUrl: (query: string, locale: Locale) => string }
> = {
  bershka: { name: "Bershka", getSearchUrl: (q, loc) => `https://www.bershka.com/${loc === "it" ? "it" : loc === "es" ? "es" : loc === "fr" ? "fr" : "com"}/search?q=${encodeQuery(q)}` },
  zara: { name: "Zara", getSearchUrl: (q, loc) => `https://www.zara.com/${LOCALE_SUFFIX[loc].zara}/search?q=${encodeQuery(q)}` },
  "pull&bear": { name: "Pull&Bear", getSearchUrl: (q, loc) => `https://www.pullandbear.com/${loc === "it" ? "it" : loc === "es" ? "es" : loc === "fr" ? "fr" : "com"}/search?q=${encodeQuery(q)}` },
  "massimo dutti": { name: "Massimo Dutti", getSearchUrl: (q, loc) => `https://www.massimodutti.com/${loc === "it" ? "it" : loc === "es" ? "es" : loc === "fr" ? "fr" : "com"}/search?q=${encodeQuery(q)}` },
  "h&m": { name: "H&M", getSearchUrl: (q, loc) => `https://www2.hm.com/${LOCALE_SUFFIX[loc].hm}/search-results.html?q=${encodeQuery(q)}` },
  hm: { name: "H&M", getSearchUrl: (q, loc) => `https://www2.hm.com/${LOCALE_SUFFIX[loc].hm}/search-results.html?q=${encodeQuery(q)}` },
  mango: { name: "Mango", getSearchUrl: (q, loc) => `https://shop.mango.com/${loc === "it" ? "it" : loc === "es" ? "es" : loc === "fr" ? "fr" : "gb"}/search?q=${encodeQuery(q)}` },
  uniqlo: { name: "Uniqlo", getSearchUrl: (q) => `https://www.uniqlo.com/eu/en/search/?q=${encodeQuery(q)}` },
  nike: { name: "Nike", getSearchUrl: (q, loc) => `https://www.nike.com/${loc === "it" ? "it" : loc === "es" ? "es" : loc === "fr" ? "fr" : "gb"}/w?q=${encodeQuery(q)}` },
  adidas: { name: "Adidas", getSearchUrl: (q, loc) => `https://www.adidas.${loc === "it" ? "it" : loc === "es" ? "es" : loc === "fr" ? "fr" : "com"}/search?q=${encodeQuery(q)}` },
};

function normalizeBrand(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function getVerifyLinks(data: ListingResult, locale: Locale): VerifyLink[] {
  const query = buildSearchQuery(data);
  if (!query) return getRetailerSearchUrls("dress", locale);

  const links: VerifyLink[] = [];
  const brand = (data.brand ?? "").trim();
  const normalizedBrand = normalizeBrand(brand);
  const official = brand && OFFICIAL_BRAND_SITES[normalizedBrand];
  if (official) {
    links.push({
      name: official.name,
      url: official.getSearchUrl(query, locale),
      isOfficialBrand: true,
    });
  }

  const retailers = getRetailerSearchUrls(query, locale);
  if (official) {
    const skipName = official.name.toLowerCase();
    links.push(...retailers.filter((r) => r.name.toLowerCase() !== skipName));
  } else {
    links.push(...retailers);
  }

  return links;
}
