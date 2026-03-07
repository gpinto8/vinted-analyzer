"use client";

import { useState, useEffect, useCallback } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const FEATURE_KEYS = [
  "feedback.featureLogin",
  "feedback.featurePostToVinted",
  "feedback.featureDashboard",
  "feedback.featurePriceHistory",
  "feedback.featureBulkListing",
  "feedback.featureAnalytics",
] as const;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [features, setFeatures] = useState<Set<string>>(new Set());
  const [customIdeas, setCustomIdeas] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useLockBodyScroll(isOpen);

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setFeatures(new Set());
    setCustomIdeas("");
    setHoneypot("");
    setStatus("idle");
    setErrorMessage("");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const toggleFeature = (key: string) => {
    setFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isValid = features.size > 0 || customIdeas.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          features: Array.from(features).map((k) => t(k)),
          customIdeas: customIdeas.trim() || undefined,
          website: honeypot || undefined,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(t("feedback.error"));
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(t("feedback.error"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
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
          aria-label={t("howItWorks.close")}
        >
          <MaterialIcon name="close" className="text-xl" />
        </button>

        {status === "success" ? (
          <div className="py-4">
            <h2 id="feedback-title" className="pr-8 text-xl font-bold text-black dark:text-slate-100">
              {t("feedback.title")}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("feedback.success")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-[#007780] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006269]"
            >
              {t("modal.ok")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 id="feedback-title" className="pr-8 text-xl font-bold text-black dark:text-slate-100">
              {t("feedback.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("feedback.subtitle")}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="feedback-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("feedback.nameOptional")}
                </label>
                <input
                  id="feedback-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="feedback-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("feedback.emailOptional")}
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  autoComplete="email"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("feedback.featuresLabel")}
                </p>
                <ul className="mt-2 space-y-2">
                  {FEATURE_KEYS.map((key) => (
                    <li key={key}>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={features.has(key)}
                          onChange={() => toggleFeature(key)}
                          className="rounded border-gray-300 text-[#007780] focus:ring-[#007780] dark:border-slate-600 dark:bg-slate-800"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {t(key)}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label htmlFor="feedback-ideas" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("feedback.customIdeasLabel")}
                </label>
                <textarea
                  id="feedback-ideas"
                  value={customIdeas}
                  onChange={(e) => setCustomIdeas(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  placeholder={t("feedback.customIdeasPlaceholder")}
                />
              </div>

              <div className="absolute -left-[9999px] opacity-0" aria-hidden>
                <label htmlFor="feedback-website">Website</label>
                <input
                  id="feedback-website"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
            </div>

            {status === "error" && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || loading}
              className="mt-6 w-full rounded-lg bg-[#007780] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006269] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <MaterialIcon name="progress_activity" className="animate-spin text-lg" />
                  {t("feedback.sending")}
                </span>
              ) : (
                t("feedback.sendButton")
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
