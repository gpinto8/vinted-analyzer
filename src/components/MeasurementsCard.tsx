"use client";

import { useState } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function formatMeasurementsText(measurements: Record<string, number>): string {
  return Object.entries(measurements)
    .map(([name, value]) => `${name}: ${value} cm`)
    .join(", ");
}

const MAX_CM = 150;

export function MeasurementsCard({ measurements }: { measurements: Record<string, number> }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const entries = Object.entries(measurements);

  if (entries.length === 0) return null;

  const handleCopy = async () => {
    if (await copyToClipboard(formatMeasurementsText(measurements))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MaterialIcon name="straighten" className="text-lg text-[#007780]" />
          <h4 className="text-sm font-bold text-black dark:text-slate-200">
            {t("result.measurementsTitle")}
          </h4>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs font-bold text-[#007780] transition-colors hover:text-[#006269] dark:hover:text-[#0099a3]"
        >
          <MaterialIcon name="content_copy" className="text-sm" />
          <span className="hidden sm:inline">
            {copied ? t("result.copied") : t("result.copyAll")}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {entries.map(([name, value]) => (
          <div
            key={name}
            className="flex items-center gap-3 rounded-md bg-white px-3 py-2 dark:bg-slate-800"
          >
            <span className="min-w-[5rem] text-xs font-medium text-slate-600 dark:text-slate-400">
              {name}
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#007780]/40"
                style={{ width: `${Math.min((value / MAX_CM) * 100, 100)}%` }}
              />
            </div>
            <span className="min-w-[3.5rem] text-right text-xs font-semibold tabular-nums text-black dark:text-slate-200">
              {value} cm
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
