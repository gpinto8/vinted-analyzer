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

export function ResultCard({ data }: { data: ListingResult }) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const handleCopyTitle = async () => {
    if (data.title && (await copyToClipboard(data.title))) {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    }
  };

  const handleCopyDescription = async () => {
    if (data.description && (await copyToClipboard(data.description))) {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const title = data.title ?? "";
  const description = data.description ?? "";

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Suggested Title
          </h4>
          <button
            type="button"
            onClick={handleCopyTitle}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <MaterialIcon name="content_copy" className="text-sm" />
            {copiedTitle ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">{title}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Optimized Description
          </h4>
          <button
            type="button"
            onClick={handleCopyDescription}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <MaterialIcon name="content_copy" className="text-sm" />
            {copiedDesc ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="min-h-64 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {description}
          </p>
        </div>
      </div>

      {(data.category ?? data.brand ?? data.size ?? data.color ?? data.priceSuggested != null) && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Details
          </h4>
          <dl className="space-y-1.5 text-sm text-slate-700">
            {data.category && (
              <div>
                <dt className="inline font-medium">Category: </dt>
                <dd className="inline">{data.category}</dd>
              </div>
            )}
            {data.brand && (
              <div>
                <dt className="inline font-medium">Brand: </dt>
                <dd className="inline">{data.brand}</dd>
              </div>
            )}
            {data.size && (
              <div>
                <dt className="inline font-medium">Size: </dt>
                <dd className="inline">{data.size}</dd>
              </div>
            )}
            {data.color && (
              <div>
                <dt className="inline font-medium">Color: </dt>
                <dd className="inline">{data.color}</dd>
              </div>
            )}
            {data.priceSuggested != null && data.priceSuggested > 0 && (
              <div>
                <dt className="inline font-medium">Suggested price: </dt>
                <dd className="inline">€ {data.priceSuggested}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {data.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {data.tags.map((t, i) => (
            <span
              key={i}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
