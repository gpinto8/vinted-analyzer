"use client";

import { useState, useMemo } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { MeasurementsCard } from "./MeasurementsCard";
import { EmptyResult } from "./EmptyResult";
import { useLanguage } from "@/contexts/LanguageContext";
import { getVerifyLinks } from "@/lib/verify-links";
import { CONDITION_OPTIONS } from "@/types/listing";
import type { ListingResult } from "@/types/listing";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const inputClassName =
  "min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-black outline-none focus:ring-0 dark:text-slate-200";

function DetailRow({
  label,
  value,
  displayPrefix,
  onChange,
  onCopy,
  copied,
  disabled,
  copyLabel,
  copiedLabel,
  inputType = "text",
}: {
  label: string;
  value: string;
  displayPrefix?: string;
  onChange?: (value: string) => void;
  onCopy?: () => void;
  copied?: boolean;
  disabled?: boolean;
  copyLabel: string;
  copiedLabel: string;
  inputType?: "text" | "number";
}) {
  const isEditable = !disabled && onChange != null;
  const isEmpty = value === "" || value === undefined;
  const displayValue = displayPrefix ? `${displayPrefix}${value}` : value;
  if (!isEmpty && !disabled && !isEditable) return null;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
      <h4 className="text-sm font-bold text-black dark:text-slate-200 sm:w-28 sm:shrink-0 sm:pt-2.5">{label}</h4>
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 dark:border-slate-700 ${
          disabled ? "cursor-not-allowed bg-gray-100 dark:bg-slate-800" : "bg-white dark:bg-slate-800"
        }`}
      >
        {isEditable ? (
          <span className="flex min-w-0 flex-1 items-center gap-1">
            {displayPrefix && (
              <span className="shrink-0 text-sm font-medium text-black dark:text-slate-200">{displayPrefix}</span>
            )}
            <input
              type={inputType}
              value={value}
              onChange={(e) => onChange!(e.target.value)}
              className={inputClassName}
              aria-label={label}
              {...(inputType === "number" && { min: 0, step: 0.01 })}
            />
          </span>
        ) : (
          <p className="min-w-0 flex-1 text-sm font-medium text-black dark:text-slate-200">{displayValue}</p>
        )}
        {!disabled && onCopy && (value != null && String(value).trim() !== "") && (
          <button
            type="button"
            onClick={onCopy}
            className="group flex shrink-0 items-center gap-1 text-xs font-bold text-[#007780] transition-colors hover:text-[#006269] dark:hover:text-[#0099a3]"
          >
            <MaterialIcon name="content_copy" className="text-sm" />
            <span className="hidden sm:inline">{copied ? copiedLabel : copyLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ResultCard({
  data,
  onChange,
}: {
  data: ListingResult;
  onChange?: (updates: Partial<ListingResult>) => void;
}) {
  const { t, locale } = useLanguage();
  const verifyLinks = useMemo(() => getVerifyLinks(data, locale), [data, locale]);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedCategory, setCopiedCategory] = useState(false);
  const [copiedProductType, setCopiedProductType] = useState(false);
  const [copiedBrand, setCopiedBrand] = useState(false);
  const [copiedSize, setCopiedSize] = useState(false);
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
  const handleCopyColor = copy(data.color ?? "", setCopiedColor);
  const handleCopyMaterial = copy(data.material ?? "", setCopiedMaterial);
  const handleCopyPriceNew = copy(
    data.priceNew != null && data.priceNew > 0 ? String(data.priceNew) : "",
    setCopiedPriceNew
  );
  const handleCopyPrice = copy(
    data.priceSuggested != null && data.priceSuggested > 0 ? String(data.priceSuggested) : "",
    setCopiedPrice
  );

  const title = data.title ?? "";
  const description = data.description ?? "";
  const isEmptyResult = !title.trim() && !description.trim();
  const isEditable = onChange != null;

  if (isEmptyResult) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <EmptyResult />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col p-6 lg:max-h-[600px] lg:overflow-y-auto lg:h-[600px] lg:scrollbar-thin">
      <div className="space-y-6 pr-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h4 className="text-sm font-bold text-black dark:text-slate-200 sm:w-28 sm:shrink-0">{t("result.title")}</h4>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
            {isEditable ? (
              <input
                type="text"
                value={title}
                onChange={(e) => onChange!({ title: e.target.value })}
                className={inputClassName}
                aria-label={t("result.title")}
              />
            ) : (
              <p className="min-w-0 flex-1 text-sm font-medium text-black dark:text-slate-200">{title}</p>
            )}
            <button
              type="button"
              onClick={handleCopyTitle}
              className="group flex shrink-0 items-center gap-1 text-xs font-bold text-[#007780] transition-colors hover:text-[#006269] dark:hover:text-[#0099a3]"
            >
              <MaterialIcon name="content_copy" className="text-sm" />
              <span className="hidden sm:inline">{copiedTitle ? t("result.copied") : t("result.copy")}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3 sm:mb-4 pb-4">
          <h4 className="text-sm font-bold text-black dark:text-slate-200 sm:w-28 sm:shrink-0 sm:pt-2.5">{t("result.description")}</h4>
          <div className="relative flex min-h-[7.5rem] min-w-0 flex-1 shrink-0 rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            {isEditable ? (
              <textarea
                value={description}
                onChange={(e) => onChange!({ description: e.target.value })}
                className={`scrollbar-thin min-h-[7.5rem] w-full resize-y flex-1 rounded-lg border-0 bg-transparent px-3 py-2.5 pr-20 pb-6 text-sm leading-relaxed text-black outline-none dark:text-slate-200`}
                aria-label={t("result.description")}
                rows={5}
              />
            ) : (
              <div className="scrollbar-thin min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-2.5 pr-20 pb-6 text-sm leading-relaxed text-black dark:text-slate-200">
                {(description.trim() ? description.split(/\n\n+/) : [""]).map((paragraph, i) => (
                  <p key={i} className={i > 0 ? "mt-3" : ""}>
                    {paragraph.split("\n").map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < paragraph.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            )}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 rounded-b-lg bg-gradient-to-t from-white to-transparent dark:from-slate-800"
              aria-hidden
            />
            <button
              type="button"
              onClick={handleCopyDescription}
              className="group absolute right-4 top-1/2 flex -translate-y-1/2 shrink-0 items-center gap-1 text-xs font-bold text-[#007780] transition-colors hover:text-[#006269] dark:hover:text-[#0099a3]"
            >
              <MaterialIcon name="content_copy" className="text-sm" />
              <span className="hidden sm:inline">{copiedDesc ? t("result.copied") : t("result.copy")}</span>
            </button>
          </div>
        </div>
      </div>
      {(isEditable ||
        data.productType ||
        data.category ||
        data.brand ||
        data.size ||
        (data.measurements && Object.keys(data.measurements).length > 0) ||
        data.condition ||
        data.color ||
        (data.priceNew != null && data.priceNew > 0) ||
        (data.priceSuggested != null && data.priceSuggested > 0)) && (
        <div className="space-y-4 border-t border-gray-200 pt-6 pb-6 dark:border-slate-700">
          {(isEditable || data.productType) && (
            <DetailRow
              label={t("result.productType")}
              value={data.productType ?? ""}
              onChange={isEditable ? (v) => onChange!({ productType: v }) : undefined}
              onCopy={handleCopyProductType}
              copied={copiedProductType}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {(isEditable || data.category) && (
            <DetailRow
              label={t("result.category")}
              value={data.category ?? ""}
              onChange={isEditable ? (v) => onChange!({ category: v }) : undefined}
              onCopy={handleCopyCategory}
              copied={copiedCategory}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {(isEditable || data.brand) && (
            <DetailRow
              label={t("result.brand")}
              value={data.brand ?? ""}
              onChange={isEditable ? (v) => onChange!({ brand: v }) : undefined}
              onCopy={handleCopyBrand}
              copied={copiedBrand}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {(isEditable || data.size) && (
            <DetailRow
              label={t("result.size")}
              value={data.size ?? ""}
              onChange={isEditable ? (v) => onChange!({ size: v }) : undefined}
              onCopy={handleCopySize}
              copied={copiedSize}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {data.measurements && Object.keys(data.measurements).length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
              <h4 className="text-sm font-bold text-black dark:text-slate-200 sm:w-28 sm:shrink-0 sm:pt-2.5">
                {t("result.measurements")}
              </h4>
              <MeasurementsCard measurements={data.measurements} />
            </div>
          )}
          {data.condition && (
            <DetailRow
              label={t("result.condition")}
              value={
                (() => {
                  const key = data.condition as string;
                  if (CONDITION_OPTIONS.includes(key as (typeof CONDITION_OPTIONS)[number])) {
                    return t(`condition.${key}`);
                  }
                  const translated = t(`condition.${key}`);
                  return translated === `condition.${key}` ? key : translated;
                })()
              }
              disabled
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {(isEditable || data.color) && (
            <DetailRow
              label={t("result.color")}
              value={data.color ?? ""}
              onChange={isEditable ? (v) => onChange!({ color: v }) : undefined}
              onCopy={handleCopyColor}
              copied={copiedColor}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {(isEditable || (data.material ?? "")) && (
            <DetailRow
              label={t("result.material")}
              value={data.material ?? ""}
              onChange={isEditable ? (v) => onChange!({ material: v }) : undefined}
              onCopy={handleCopyMaterial}
              copied={copiedMaterial}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
            />
          )}
          {(isEditable || (data.priceNew != null && data.priceNew > 0)) && (
            <DetailRow
              label={t("result.retailPrice")}
              value={data.priceNew != null && data.priceNew > 0 ? String(data.priceNew) : ""}
              displayPrefix="€ "
              onChange={
                isEditable
                  ? (v) => {
                      if (v === "") onChange!({ priceNew: undefined });
                      else {
                        const n = parseFloat(v);
                        if (!Number.isNaN(n) && n >= 0) onChange!({ priceNew: n });
                      }
                    }
                  : undefined
              }
              onCopy={handleCopyPriceNew}
              copied={copiedPriceNew}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
              inputType="number"
            />
          )}
          {(isEditable || (data.priceSuggested != null && data.priceSuggested > 0)) && (
            <DetailRow
              label={t("result.suggestedPrice")}
              value={data.priceSuggested != null && data.priceSuggested > 0 ? String(data.priceSuggested) : ""}
              displayPrefix="€ "
              onChange={
                isEditable
                  ? (v) => {
                      if (v === "") onChange!({ priceSuggested: undefined });
                      else {
                        const n = parseFloat(v);
                        if (!Number.isNaN(n) && n >= 0) onChange!({ priceSuggested: n });
                      }
                    }
                  : undefined
              }
              onCopy={handleCopyPrice}
              copied={copiedPrice}
              copyLabel={t("result.copy")}
              copiedLabel={t("result.copied")}
              inputType="number"
            />
          )}
        </div>
      )}

      {(data.sources?.length ?? 0) > 0 && (
        <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-slate-700">
          <h4 className="text-sm font-bold text-black dark:text-slate-200">{t("result.sources")}</h4>
          <ul className="flex flex-wrap gap-2">
            {data.sources!.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#007780] transition-colors hover:bg-[#007780]/10 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-[#007780]/20"
                >
                  {s.name}
                  <MaterialIcon name="open_in_new" className="text-sm" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isEmptyResult && verifyLinks.length > 0 && (
        <div className="space-y-2 border-t border-gray-200 pt-7 dark:border-slate-700">
          <h4 className="text-sm font-bold text-black dark:text-slate-200">{t("result.verifyListing")}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">{t("result.verifySitesHint")}</p>
          <ul className="flex flex-wrap gap-1.5">
            {verifyLinks.map((link) => (
              <li key={`${link.name}-${link.url}`}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-[#007780] bg-[#007780]/5 px-2 py-1.5 text-xs font-medium text-[#007780] transition-colors hover:bg-[#007780]/15 dark:bg-[#007780]/10 dark:hover:bg-[#007780]/25"
                >
                  {link.name}
                  <MaterialIcon name="open_in_new" className="text-[10px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="pointer-events-none sticky bottom-0 left-0 right-0 mt-auto h-8 bg-gradient-to-t from-white to-transparent dark:from-slate-900"
        aria-hidden
      />
    </div>
  );
}
