"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Header } from "@/components/Header";
import { ListingForm, type AnalyzeRequest } from "@/components/ListingForm";
import { EmptyResult } from "@/components/EmptyResult";
import { ResultCard } from "@/components/ResultCard";
import { FeatureCards } from "@/components/FeatureCards";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveLastResult } from "@/lib/listing-storage";
import type { ListingResult } from "@/types/listing";

const OPTIMIZED_RESULT_ID = "optimized-result";

export default function Home() {
  const { t, locale } = useLanguage();
  const [result, setResult] = useState<ListingResult | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isUpdatingResultLocale, setIsUpdatingResultLocale] = useState(false);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [notClothingToast, setNotClothingToast] = useState(false);
  const lastRequestRef = useRef<AnalyzeRequest | null>(null);

  const isEmptyResult = useCallback((r: ListingResult) => {
    const title = (r.title ?? "").trim();
    const desc = (r.description ?? "").trim();
    return !title && !desc;
  }, []);

  const handleResult = useCallback(
    (newResult: ListingResult, request?: AnalyzeRequest) => {
      if (isEmptyResult(newResult)) {
        setNotClothingToast(true);
        return;
      }
      setResult(newResult);
      saveLastResult(newResult, request);
      if (request) lastRequestRef.current = request;
    },
    [isEmptyResult]
  );

  useEffect(() => {
    if (!notClothingToast) return;
    const id = setTimeout(() => setNotClothingToast(false), 4000);
    return () => clearTimeout(id);
  }, [notClothingToast]);

  useEffect(() => {
    if (result) {
      document.getElementById(OPTIMIZED_RESULT_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const prevLocaleRef = useRef(locale);
  useEffect(() => {
    if (prevLocaleRef.current === locale) return;
    prevLocaleRef.current = locale;
    const request = lastRequestRef.current;
    if (!request || !result) return;
    setIsUpdatingResultLocale(true);
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, locale }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        const next = data as ListingResult;
        if (!(next.title ?? "").trim() && !(next.description ?? "").trim()) {
          setNotClothingToast(true);
          return;
        }
        setResult(next);
        saveLastResult(next, lastRequestRef.current ?? undefined);
      })
      .finally(() => setIsUpdatingResultLocale(false));
  }, [locale, result]);

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <Header
        onSignInClick={() => setShowComingSoon(true)}
        onHowItWorksClick={() => setShowHowItWorks(true)}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 pb-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary dark:text-primary" style={{ color: "var(--color-primary)" }}>
            {t("home.title")}
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t("home.subtitle")}
          </p>
        </div>

        <div className="grid min-h-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:h-[min(954px,calc(100vh-14rem))] lg:max-h-[min(954px,calc(100vh-14rem))] lg:overflow-y-auto">
          <section className="flex min-h-0 flex-col overflow-hidden lg:col-span-6 lg:h-[min(954px,calc(100vh-14rem))]">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <div className="shrink-0 rounded-t-xl border-b border-gray-200 bg-white p-4">
                <h3 className="text-base font-bold tracking-tight text-black">
                  {t("home.inputDetails")}
                </h3>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:scrollbar-thin">
                <ListingForm onResult={handleResult} onGeneratingChange={setIsGeneratingResult} />
              </div>
            </div>
          </section>

          <section
            id={OPTIMIZED_RESULT_ID}
            className={result ? "flex min-h-0 flex-col lg:col-span-6 lg:h-[min(954px,calc(100vh-14rem))]" : "hidden lg:flex lg:min-h-0 lg:flex-col lg:col-span-6 lg:h-[min(954px,calc(100vh-14rem))]"}
            aria-label={t("home.optimizedResult")}
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <div
                className={`shrink-0 rounded-t-xl border-b border-gray-200 bg-white p-4 ${!result || isEmptyResult(result) ? "max-md:hidden" : ""}`}
              >
                {result ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="auto_awesome" className="text-xl shrink-0" style={{ color: "#007780" }} filled />
                      <h3 className="text-base font-bold tracking-tight text-[#007780]">
                        {t("home.optimizedResult")}
                      </h3>
                      {isUpdatingResultLocale && (
                        <span className="text-xs text-slate-500">{t("home.updatingLanguage")}</span>
                      )}
                    </div>
                    <span className="rounded-md bg-[#007780] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {t("home.aiGenerated")}
                    </span>
                  </div>
                ) : (
                  <h3 className="text-base font-bold tracking-tight text-black">
                    {t("home.optimizedResult")}
                  </h3>
                )}
              </div>
              <div className="relative flex min-h-0 flex-1 flex-col lg:scrollbar-thin lg:overflow-y-auto">
                {result ? (
                  <>
                    <div
                      className={`flex min-h-0 flex-1 flex-col transition-[filter] duration-200 ${
                        isGeneratingResult ? "pointer-events-none select-none blur-sm" : ""
                      }`}
                    >
                      <ResultCard data={result} />
                    </div>
                    {isGeneratingResult && (
                      <div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-b-xl bg-white/70 backdrop-blur-[2px]"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        <MaterialIcon name="progress_activity" className="animate-spin text-4xl text-[#007780]" aria-hidden />
                        <p className="text-sm font-medium text-slate-700">{t("form.generating")}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyResult />
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-12 mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCards />
        </section>

        <footer className="mt-auto border-t border-gray-300 pt-4 pb-0 text-center dark:border-gray-500">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t("footer.loveShopping")}{" "}
            <a
              href="https://www.vinted.it/member/286326599"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#007780] underline-offset-2 hover:underline dark:text-primary"
            >
              {t("footer.showLove")}
            </a>
          </p>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </footer>
      </main>
      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      {notClothingToast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="fixed right-4 top-4 z-[100] flex items-start gap-2 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-lg dark:border-amber-500 dark:bg-amber-950/90 dark:text-amber-100 lg:top-auto lg:bottom-4"
          >
            <span className="flex-1 pr-1">{t("result.notClothingHint")}</span>
            <button
              type="button"
              onClick={() => setNotClothingToast(false)}
              className="shrink-0 rounded p-0.5 text-amber-700 transition-colors hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:text-amber-300 dark:hover:bg-amber-800"
              aria-label="Close"
            >
              <MaterialIcon name="close" className="text-lg" />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
