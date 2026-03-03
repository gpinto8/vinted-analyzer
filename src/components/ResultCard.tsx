"use client";

import { useState } from "react";
import { MaterialIcon } from "./MaterialIcon";
import type { ListingResult } from "@/types/listing";

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
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  disabled?: boolean;
}) {
  if (!value && !disabled) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-bold text-black">{label}</h4>
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
            <span className="hidden sm:inline group-hover:underline">{copied ? "Copied!" : "Copy"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ResultCard({ data }: { data: ListingResult }) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedCategory, setCopiedCategory] = useState(false);
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
  const handleCopyBrand = copy(data.brand ?? "", setCopiedBrand);
  const handleCopySize = copy(data.size ?? "", setCopiedSize);
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

  const title = data.title ?? "";
  const description = data.description ?? "";

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1">
        <h4 className="text-sm font-bold text-black md:w-32 md:shrink-0">Title</h4>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="min-w-0 flex-1 text-sm font-medium text-black">{title}</p>
          <button
            type="button"
            onClick={handleCopyTitle}
            className="group flex shrink-0 items-center gap-1 text-xs font-bold text-[#007780]"
          >
            <MaterialIcon name="content_copy" className="text-sm" />
            <span className="hidden group-hover:underline sm:inline">{copiedTitle ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-1">
        <h4 className="pt-0 text-sm font-bold text-black md:w-32 md:shrink-0 md:pt-2.5">Description</h4>
        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <p className="max-h-[4.5rem] min-w-0 flex-1 overflow-y-auto whitespace-pre-wrap px-3 py-2.5 pr-20 text-sm leading-relaxed text-black">
            {description}
          </p>
          <button
            type="button"
            onClick={handleCopyDescription}
            className="group absolute right-4 top-1/2 flex -translate-y-1/2 shrink-0 items-center gap-1 text-xs font-bold text-[#007780]"
          >
            <MaterialIcon name="content_copy" className="text-sm" />
            <span className="hidden group-hover:underline sm:inline">{copiedDesc ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>

      {(data.productType ?? data.category ?? data.brand ?? data.size ?? data.condition ?? data.color ?? (data.priceSuggested != null && data.priceSuggested > 0)) && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          {data.productType && (
            <DetailRow label="Product type" value={data.productType} disabled />
          )}
          <DetailRow
            label="Category"
            value={data.category ?? ""}
            onCopy={handleCopyCategory}
            copied={copiedCategory}
          />
          <DetailRow
            label="Brand"
            value={data.brand ?? ""}
            onCopy={handleCopyBrand}
            copied={copiedBrand}
            disabled={data.brandFromUser}
          />
          {data.condition && (
            <DetailRow label="Condition" value={data.condition} disabled />
          )}
          <DetailRow
            label="Size"
            value={data.size ?? ""}
            onCopy={handleCopySize}
            copied={copiedSize}
          />
          <DetailRow
            label="Color"
            value={data.color ?? ""}
            onCopy={handleCopyColor}
            copied={copiedColor}
          />
          {data.priceSuggested != null && data.priceSuggested > 0 && (
            <DetailRow
              label="Suggested price"
              value={`€ ${data.priceSuggested}`}
              onCopy={handleCopyPrice}
              copied={copiedPrice}
            />
          )}
        </div>
      )}

      {data.tags?.length ? (
        <div className="hidden flex-wrap gap-2 md:flex md:flex-wrap">
          {data.tags.map((t, i) => (
            <span
              key={i}
              className="rounded-full bg-[#007780]/15 px-3 py-1 text-xs font-medium text-[#007780]"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
