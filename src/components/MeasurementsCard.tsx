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

const MAX_CM = 150;

export function MeasurementsCard({ measurements }: { measurements: Record<string, number> }) {
  const { t } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const entries = Object.entries(measurements);

  if (entries.length === 0) return null;

  const handleCopyRow = async (name: string, value: number) => {
    if (await copyToClipboard(String(value))) {
      setCopiedKey(name);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="relative flex min-h-[3.25rem] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2.5 lg:max-h-[8.5rem] lg:resize-y dark:border-slate-700 dark:bg-slate-800">
      <div className="scrollbar-thin min-h-0 flex-1 lg:overflow-y-auto">
        <div className="flex flex-col gap-2">
          {entries.map(([name, value]) => {
            const isCopied = copiedKey === name;
            return (
              <div
                key={name}
                className="flex items-center gap-2 rounded-md bg-gray-50/80 px-3 py-2 dark:bg-slate-700/50"
              >
                <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {name}
                </span>
                <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-600">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#007780]"
                    style={{ width: `${Math.min((value / MAX_CM) * 100, 100)}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-black dark:text-slate-200">
                  {value} cm
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyRow(name, value)}
                  aria-label={t("result.copy")}
                  className="group flex shrink-0 items-center gap-1 text-xs font-bold text-[#007780] transition-colors hover:text-[#006269] dark:hover:text-[#0099a3]"
                >
                  <MaterialIcon name="content_copy" className="text-sm" />
                  <span className="hidden sm:inline">{isCopied ? t("result.copied") : t("result.copy")}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 rounded-b-md bg-gradient-to-t from-white to-transparent dark:from-slate-800"
        aria-hidden
      />
    </div>
  );
}
