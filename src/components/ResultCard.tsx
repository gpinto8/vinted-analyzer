"use client";

import { useState, useCallback, useEffect } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { EmptyResult } from "./EmptyResult";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ListingResult } from "@/types/listing";

interface ProductLink {
  name: string;
  url: string;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function DetailRow({
  label,
  value,
  onCopy,
  copied,
  disabled,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  disabled?: boolean;
  copyLabel: string;
  copiedLabel: string;
}) {
  if (!value && !disabled) return null;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <h4 className="text-sm font-bold text-black sm:w-28 sm:shrink-0">{label}</h4>
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 ${
          disabled ? "cursor-not-allowed bg-gray-100" : "bg-white"
        }`}
      >
        <p className="min-w-0 flex-1 text-sm font-medium text-black">{value}</p>
        {!disabled && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="group flex shrink-0 items-center gap-1 text-xs font-bold text-[#007780]"
          >
            <MaterialIcon name="content_copy" className="text-sm" />
            <span className="hidden sm:inline group-hover:underline">{copied ? copiedLabel : copyLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ResultCard({ data }: { data: ListingResult }) {
  const { t, locale } = useLanguage();
  const [aiLinks, setAiLinks] = useState<ProductLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [errorLinks, setErrorLinks] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedCategory, setCopiedCategory] = useState(false);
  const [copiedProductType, setCopiedProductType] = useState(false);
  const [copiedBrand, setCopiedBrand] = useState(false);
  const [copiedSize, setCopiedSize] = useState(false);
  const [copiedMeasurements, setCopiedMeasurements] = useState(false);
  const [copiedColor, setCopiedColor] = useState(false);
  const [copiedMaterial, setCopiedMaterial] = useState(false);
  const [copiedPriceNew, setCopiedPriceNew] = useState(false);
  const [copiedPrice, setCopiedPrice] = useState(false);

  const copy = (text: string, setter: (v: boolean) => void) => {
    return async () => {
      if (text && (await copyToClipboard(text))) {
        setter(true);
        setTimeout(() => setter(false), 2000);
      }
    };
  };

  const handleCopyTitle = copy(data.title ?? "", setCopiedTitle);
  const handleCopyDescription = copy(data.description ?? "", setCopiedDesc);
  const handleCopyCategory = copy(data.category ?? "", setCopiedCategory);
  const handleCopyProductType = copy(data.productType ?? "", setCopiedProductType);
  const handleCopyBrand = copy(data.brand ?? "", setCopiedBrand);
  const handleCopySize = copy(data.size ?? "", setCopiedSize);
  const handleCopyMeasurements = copy(data.measurements ?? "", setCopiedMeasurements);
  const handleCopyColor = copy(data.color ?? "", setCopiedColor);
  const handleCopyMaterial = copy(data.material ?? "", setCopiedMaterial);
  const handleCopyPriceNew = copy(
    data.priceNew != null && data.priceNew > 0 ? `€ ${data.priceNew}` : "",
    setCopiedPriceNew
  );
  const handleCopyPrice = copy(
    data.priceSuggested != null && data.priceSuggested > 0 ? `€ ${data.priceSuggested}` : "",
    setCopiedPrice
  );

  const fetchProductLinks = useCallback(async () => {
    setErrorLinks(null);
    setLoadingLinks(true);
    try {
      const res = await fetch("/api/find-product-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title ?? "",
          brand: data.brand ?? "",
          productType: data.productType ?? "",
          locale,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAiLinks([]);
        setErrorLinks(json?.error ?? t("result.findProductLinksError"));
        return;
      }
      setAiLinks(Array.isArray(json) ? json : []);
    } catch {
      setAiLinks([]);
      setErrorLinks(t("result.findProductLinksError"));
    } finally {
      setLoadingLinks(false);
    }
  }, [data.title, data.brand, data.productType, locale, t]);

  useEffect(() => {
    const title = (data.title ?? "").trim();
    const desc = (data.description ?? "").trim();
    if (!title && !desc) return;
    fetchProductLinks();
  }, [fetchProductLinks]);

  const title = data.title ?? "";
  const description = data.description ?? "";
  const isEmptyResult = !title.trim() && !description.trim();

  if (isEmptyResult) {
    return (
      <div className="flex flex-1 flex-col p-6">
        <EmptyResult />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h4 className="text-sm font-bold text-black sm:w-28 sm:shrink-0">{t("result.title")}</h4>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
            <p className="min-w-0 flex-1 text-sm font-medium text-black">{title}</p>
            <button
              type="button"
              onClick={handleCopyTitle}
              className="group flex shrink-0 items-center gap-1 text-xs font-bold text-[#007780]"
            >
              <MaterialIcon name="content_copy" className="text-sm" />
              <span className="hidden group-hover:underline sm:inline">{copiedTitle ? t("result.copied") : t("result.copy")}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
          <h4 className="text-sm font-bold text-black sm:w-28 sm:shrink-0 sm:pt-2.5">{t("result.description")}</h4>
          <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <p className="scrollbar-thin min-h-[7.5rem] max-h-[7.5rem] min-w-0 flex-1 overflow-y-auto whitespace-pre-wrap px-3 py-2.5 pr-20 text-sm leading-relaxed text-black">
              {description}
            </p>
            <button
              type="button"
              onClick={handleCopyDescription}
              className="group absolute right-4 top-1/2 flex -translate-y-1/2 shrink-0 items-center gap-1 text-xs font-bold text-[#007780]"
            >
              <MaterialIcon name="content_copy" className="text-sm" />
              <span className="hidden group-hover:underline sm:inline">{copiedDesc ? t("result.copied") : t("result.copy")}</span>
            </button>
          </div>
        </div>
      </div>

      {(data.productType ?? data.category ?? data.brand ?? data.size ?? data.measurements ?? data.condition ?? data.color ?? ((data.priceNew != null && data.priceNew > 0) || (data.priceSuggested != null && data.priceSuggested > 0))) && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          {data.productType && (
            <DetailRow
              label={t("result.productType")}
              value={data.productType}
              onCopy={handleCopyProductType}
              copied={copiedProductType}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          <DetailRow
            label={t("result.category")}
            value={data.category ?? ""}
            onCopy={handleCopyCategory}
            copied={copiedCategory}
            copyLabel={t("result.copy")}
            copiedLabel={t("result.copied")}
          />
          <DetailRow
            label={t("result.brand")}
            value={data.brand ?? ""}
            onCopy={handleCopyBrand}
            copied={copiedBrand}
            copyLabel={t("result.copy")}
            copiedLabel={t("result.copied")}
          />
          <DetailRow
            label={t("result.size")}
            value={data.size ?? ""}
            onCopy={handleCopySize}
            copied={copiedSize}
            copyLabel={t("result.copy")}
            copiedLabel={t("result.copied")}
          />
          {data.measurements && (
            <DetailRow
              label={t("result.measurements")}
              value={data.measurements}
              onCopy={handleCopyMeasurements}
              copied={copiedMeasurements}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {data.condition && (
            <DetailRow label={t("result.condition")} value={data.condition ? t(`condition.${data.condition}`) : ""} disabled copyLabel={t("result.copy")} copiedLabel={t("result.copied")} />
          )}
          <DetailRow
            label={t("result.color")}
            value={data.color ?? ""}
            onCopy={handleCopyColor}
            copied={copiedColor}
            copyLabel={t("result.copy")}
            copiedLabel={t("result.copied")}
          />
          {data.priceNew != null && data.priceNew > 0 && (
            <DetailRow
              label={t("result.retailPrice")}
              value={`€ ${data.priceNew}`}
              onCopy={handleCopyPriceNew}
              copied={copiedPriceNew}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {data.priceSuggested != null && data.priceSuggested > 0 && (
            <DetailRow
              label={t("result.suggestedPrice")}
              value={`€ ${data.priceSuggested}`}
              onCopy={handleCopyPrice}
              copied={copiedPrice}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
        </div>
      )}

      {(data.sources?.length ?? 0) > 0 && (
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-black">{t("result.sources")}</h4>
          <ul className="flex flex-wrap gap-2">
            {data.sources!.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#007780] transition-colors hover:bg-[#007780]/10"
                >
                  {s.name}
                  <MaterialIcon name="open_in_new" className="text-sm" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isEmptyResult && (
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-bold text-black">{t("result.verifyListing")}</h4>
          {loadingLinks && (
            <div className="flex items-center gap-2 py-2 text-sm text-slate-600">
              <MaterialIcon name="progress_activity" className="animate-spin text-lg text-[#007780]" />
              {t("result.loadingLinks")}
            </div>
          )}
          {errorLinks && !loadingLinks && (
            <p className="text-xs text-red-600" role="alert">
              {errorLinks}
            </p>
          )}
          {aiLinks.length > 0 && !loadingLinks && (
            <ul className="flex flex-wrap gap-2">
              {aiLinks.map((link) => (
                <li key={`${link.name}-${link.url}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-[#007780] bg-[#007780]/5 px-3 py-2 text-sm font-medium text-[#007780] transition-colors hover:bg-[#007780]/15"
                  >
                    {link.name}
                    <MaterialIcon name="open_in_new" className="text-sm" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
