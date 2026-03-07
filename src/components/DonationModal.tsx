"use client";

import { useState, useEffect, useRef } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const DEFAULT_PRESETS = [1, 2, 5, 10];
const MIN_CUSTOM = 0.5;
const CURRENCY = "EUR";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  const cancelPayment = () => {
    cancelledRef.current = true;
    abortRef.current?.abort();
  };

  const handleClose = () => {
    cancelPayment();
    onClose();
  };

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedAmount(null);
    setCustomAmount("");
    setShowCustomInput(false);
    setError("");
    cancelledRef.current = false;
    abortRef.current = null;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelPayment();
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const presets = DEFAULT_PRESETS;
  const amount = selectedAmount ?? (customAmount ? parseFloat(customAmount.replace(",", ".")) : null);
  const isValid = amount != null && !Number.isNaN(amount) && amount >= MIN_CUSTOM;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError("");
    cancelledRef.current = false;
    abortRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortRef.current?.abort(), 15000);
    try {
      const res = await fetch("/api/create-donation-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: CURRENCY,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        }),
        signal: abortRef.current.signal,
      });
      clearTimeout(timeoutId);
      const data = (await res.json()) as { url?: string; error?: string };
      if (cancelledRef.current) return;
      if (!res.ok || !data.url || typeof data.url !== "string") {
        setError(t("donation.error"));
        return;
      }
      window.location.replace(data.url);
    } catch (err) {
      if ((err as Error).name === "AbortError" && cancelledRef.current) return;
      setError(t("donation.error"));
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
      aria-labelledby="donation-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label={t("howItWorks.close")}
        >
          <MaterialIcon name="close" className="text-xl" />
        </button>

        <h2 id="donation-title" className="pr-8 text-xl font-bold text-black dark:text-slate-100">
          {t("donation.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("donation.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("donation.selectAmount")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (loading) cancelPayment();
                    setSelectedAmount(val);
                    setCustomAmount("");
                    setShowCustomInput(false);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedAmount === val
                      ? "bg-[#007780] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  €{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (loading) cancelPayment();
                  const willOpen = !showCustomInput;
                  setShowCustomInput(willOpen);
                  if (willOpen) {
                    setSelectedAmount(null);
                    setCustomAmount("");
                  } else {
                    setCustomAmount("");
                  }
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  showCustomInput
                    ? "bg-[#007780] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {t("donation.custom")}
              </button>
            </div>
          </div>

          {showCustomInput && (
          <div>
            <label htmlFor="donation-custom" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("donation.customAmount")}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">€</span>
              <input
                id="donation-custom"
                type="text"
                inputMode="decimal"
                value={customAmount}
                onChange={(e) => {
                  if (loading) cancelPayment();
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder={t("donation.customPlaceholder")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                aria-invalid={customAmount.length > 0 && (!isValid || parseFloat(customAmount.replace(",", ".")) < MIN_CUSTOM)}
              />
            </div>
            {customAmount && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("donation.minAmount", { min: MIN_CUSTOM })}
              </p>
            )}
          </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full rounded-lg bg-[#007780] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006269] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <MaterialIcon name="progress_activity" className="animate-spin text-lg" />
                {t("donation.processing")}
              </span>
            ) : (
              t("donation.cta", { amount: amount != null ? amount.toFixed(2) : "0.00" })
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
