"use client";

import { useEffect } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEP_KEYS = [
  { icon: "add_a_photo" as const, titleKey: "howItWorks.step1Title", textKey: "howItWorks.step1Text" },
  { icon: "edit_note" as const, titleKey: "howItWorks.step2Title", textKey: "howItWorks.step2Text" },
  { icon: "auto_awesome" as const, titleKey: "howItWorks.step3Title", textKey: "howItWorks.step3Text" },
  { icon: "content_copy" as const, titleKey: "howItWorks.step4Title", textKey: "howItWorks.step4Text" },
];

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const { t } = useLanguage();
  useLockBodyScroll(isOpen);
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Close"
        >
          <MaterialIcon name="close" className="text-xl" />
        </button>
        <h2 id="how-it-works-title" className="pr-8 text-xl font-bold text-black dark:text-slate-100">
          {t("howItWorks.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("howItWorks.subtitle")}
        </p>
        <ul className="mt-6 space-y-5">
          {STEP_KEYS.map((step, index) => (
            <li key={step.titleKey} className="flex gap-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg leading-none"
                style={{ backgroundColor: "rgba(0, 119, 128, 0.08)" }}
              >
                <MaterialIcon name={step.icon} className="text-primary" style={{ color: "#007780" }} />
              </span>
              <div>
                <h3 className="font-semibold text-black dark:text-slate-100">
                  {index + 1}. {t(step.titleKey)}
                </h3>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{t(step.textKey)}</p>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#007780] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006269]"
        >
          {t("howItWorks.gotIt")}
        </button>
      </div>
    </div>
  );
}
