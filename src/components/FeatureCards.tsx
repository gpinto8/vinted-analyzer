"use client";

import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";

export function FeatureCards() {
  const { t } = useLanguage();
  const features = [
    { icon: "search_check" as const, titleKey: "features.seoTitle", descKey: "features.seoDesc" },
    { icon: "visibility" as const, titleKey: "features.visualTitle", descKey: "features.visualDesc" },
    { icon: "content_copy" as const, titleKey: "features.copyTitle", descKey: "features.copyDesc" },
  ];
  return (
    <>
      {features.map(({ icon, titleKey, descKey }) => (
        <div
          key={titleKey}
          className="flex items-start gap-4 rounded-xl bg-white p-4 dark:bg-slate-900"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg p-2"
            style={{ backgroundColor: "rgba(0, 119, 128, 0.08)" }}
          >
            <MaterialIcon name={icon} className="text-primary leading-none" style={{ color: "#007780" }} />
          </span>
          <div>
            <h5 className="text-sm font-bold text-black dark:text-slate-100">{t(titleKey)}</h5>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(descKey)}</p>
          </div>
        </div>
      ))}
    </>
  );
}
