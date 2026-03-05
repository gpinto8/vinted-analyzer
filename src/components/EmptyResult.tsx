"use client";

import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";

export function EmptyResult() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="max-w-xs space-y-4">
        <div
          className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(0, 119, 128, 0.08)" }}
        >
          <MaterialIcon name="description" className="text-3xl leading-none text-primary" style={{ color: "#007780" }} />
        </div>
        <h4 className="text-lg font-bold text-black">{t("empty.noAnalysisYet")}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("empty.hint")}
        </p>
      </div>
    </div>
  );
}
