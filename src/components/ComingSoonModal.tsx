"use client";

import { useEffect } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
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
      aria-labelledby="coming-soon-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Close"
        >
          <MaterialIcon name="close" className="text-xl" />
        </button>
        <p id="coming-soon-title" className="text-center text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t("modal.comingSoon")}
        </p>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          {t("modal.comingSoonText")}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#007780] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006269]"
        >
          {t("modal.ok")}
        </button>
      </div>
    </div>
  );
}
