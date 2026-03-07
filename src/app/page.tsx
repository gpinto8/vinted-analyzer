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
import { PageSkeleton } from "@/components/PageSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLastResult, saveLastResult } from "@/lib/listing-storage";
import type { ListingResult } from "@/types/listing";

const OPTIMIZED_RESULT_ID = "optimized-result";

export default function Home() {
  const { t, locale, isLoading } = useLanguage();
  const [result, setResult] = useState<ListingResult | null>(null);
  const [draftProductType, setDraftProductType] = useState("");
  const [draftBrand, setDraftBrand] = useState("");
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isUpdatingResultLocale, setIsUpdatingResultLocale] = useState(false);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [notClothingToast, setNotClothingToast] = useState(false);
  const [analyzeErrorToast, setAnalyzeErrorToast] = useState(false);
  const lastRequestRef = useRef<AnalyzeRequest | null>(null);
  const notClothingToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyzeErrorToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOAST_DURATION_MS = 6000;

  const startNotClothingToastTimer = useCallback(() => {
    notClothingToastTimerRef.current = setTimeout(() => {
      setNotClothingToast(false);
      notClothingToastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  const startAnalyzeErrorToastTimer = useCallback(() => {
    analyzeErrorToastTimerRef.current = setTimeout(() => {
      setAnalyzeErrorToast(false);
      analyzeErrorToastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  const pauseNotClothingToastTimer = useCallback(() => {
    if (notClothingToastTimerRef.current != null) {
      clearTimeout(notClothingToastTimerRef.current);
      notClothingToastTimerRef.current = null;
    }
  }, []);

  const pauseAnalyzeErrorToastTimer = useCallback(() => {
    if (analyzeErrorToastTimerRef.current != null) {
      clearTimeout(analyzeErrorToastTimerRef.current);
      analyzeErrorToastTimerRef.current = null;
    }
  }, []);

  const isEmptyResult = useCallback((r: ListingResult) => {
    const title = (r.title ?? "").trim();
    const desc = (r.description ?? "").trim();
    return !title && !desc;
  }, []);

  const handleResultChange = useCallback((updates: Partial<ListingResult>) => {
    setResult((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      saveLastResult(next, lastRequestRef.current ?? undefined);
      return next;
    });
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
      if (request?.productType) setDraftProductType(request.productType);
      if (request?.brand) setDraftBrand(request.brand);
    },
    [isEmptyResult]
  );

  useEffect(() => {
    if (!notClothingToast) return;
    startNotClothingToastTimer();
    return () => {
      if (notClothingToastTimerRef.current != null) {
        clearTimeout(notClothingToastTimerRef.current);
        notClothingToastTimerRef.current = null;
      }
    };
  }, [notClothingToast, startNotClothingToastTimer]);

  useEffect(() => {
    if (!analyzeErrorToast) return;
    startAnalyzeErrorToastTimer();
    return () => {
      if (analyzeErrorToastTimerRef.current != null) {
        clearTimeout(analyzeErrorToastTimerRef.current);
        analyzeErrorToastTimerRef.current = null;
      }
    };
  }, [analyzeErrorToast, startAnalyzeErrorToastTimer]);

  useEffect(() => {
    if (!result || isEmptyResult(result)) return;
    const timer = setTimeout(() => {
      document.getElementById(OPTIMIZED_RESULT_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(timer);
  }, [result, isEmptyResult]);

  const prevLocaleRef = useRef(locale);
  useEffect(() => {
    if (prevLocaleRef.current === locale) return;
    prevLocaleRef.current = locale;
    if (!result) return;
    const request = lastRequestRef.current ?? getLastResult()?.request;
    setIsUpdatingResultLocale(true);

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        result,
        targetLocale: locale,
        requestTexts: {
          ...(draftProductType.trim() && { productType: draftProductType.trim() }),
          ...(draftBrand.trim() && { brand: draftBrand.trim() }),
        },
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<{ result: ListingResult; requestTexts?: { productType?: string; brand?: string } }>;
      })
      .then((data) => {
        setResult(data.result);
        const translatedProductType = data.requestTexts?.productType;
        const translatedBrand = data.requestTexts?.brand;
        if (typeof translatedProductType === "string") {
          setDraftProductType(translatedProductType);
        }
        if (typeof translatedBrand === "string") {
          setDraftBrand(translatedBrand);
        }
        if (request) {
          const nextRequest: AnalyzeRequest = {
            ...request,
            ...(typeof translatedProductType === "string" ? { productType: translatedProductType } : {}),
            ...(typeof translatedBrand === "string" ? { brand: translatedBrand } : {}),
          };
          lastRequestRef.current = nextRequest;
          saveLastResult(data.result, nextRequest);
        } else {
          saveLastResult(data.result);
        }
      })
      .catch(() => setAnalyzeErrorToast(true))
      .finally(() => setIsUpdatingResultLocale(false));
  }, [locale, result, draftProductType, draftBrand]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
        <Header
          onSignInClick={() => setShowComingSoon(true)}
          onHowItWorksClick={() => setShowHowItWorks(true)}
        />
        <PageSkeleton />
      </div>
    );
  }

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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          <section className="flex min-h-0 flex-col lg:col-span-6">
            <div className="flex flex-col rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:bg-slate-900 dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
              <div className="shrink-0 rounded-t-xl border-b border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-base font-bold tracking-tight text-black dark:text-slate-100">
                  {t("home.inputDetails")}
                </h3>
              </div>
              <div className="p-6">
                <ListingForm
                  onResult={handleResult}
                  onGeneratingChange={setIsGeneratingResult}
                  onAnalyzeError={() => setAnalyzeErrorToast(true)}
                  productType={draftProductType}
                  onProductTypeChange={setDraftProductType}
                  brand={draftBrand}
                  onBrandChange={setDraftBrand}
                  files={formFiles}
                  onFilesChange={setFormFiles}
                />
              </div>
            </div>
          </section>

          <section
            id={OPTIMIZED_RESULT_ID}
            className={result ? "flex min-h-0 flex-col lg:col-span-6" : "hidden lg:flex lg:min-h-0 lg:flex-col lg:col-span-6"}
            aria-label={t("home.optimizedResult")}
          >
            <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:bg-slate-900 dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] lg:h-[1000px] lg:overflow-hidden">
              <div
                className={`shrink-0 rounded-t-xl border-b border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 ${!result || isEmptyResult(result) ? "max-md:hidden" : ""}`}
              >
                {result ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="auto_awesome" className="text-xl shrink-0" style={{ color: "#007780" }} filled />
                      <h3 className="text-base font-bold tracking-tight text-[#007780]">
                        {t("home.optimizedResult")}
                      </h3>
                      {isUpdatingResultLocale && (
                        <div className="flex items-center gap-1.5">
                          <span className="hidden text-xs text-slate-500 md:inline">{t("home.updatingLanguage")}</span>
                          <MaterialIcon name="progress_activity" className="animate-spin text-base text-slate-400 dark:text-slate-500" aria-hidden />
                        </div>
                      )}
                    </div>
                    <span className="rounded-md bg-[#007780] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {t("home.aiGenerated")}
                    </span>
                  </div>
                ) : (
                  <h3 className="text-base font-bold tracking-tight text-black dark:text-slate-100">
                    {t("home.optimizedResult")}
                  </h3>
                )}
              </div>
              <div className="relative flex min-h-0 flex-1 flex-col scrollbar-thin lg:overflow-y-auto">
                {result ? (
                  <>
                    <div
                      className={`flex min-h-0 flex-1 flex-col transition-[filter] duration-200 ${
                        isGeneratingResult ? "pointer-events-none select-none blur-sm" : ""
                      }`}
                    >
                      <ResultCard data={result} onChange={handleResultChange} />
                    </div>
                    {isGeneratingResult && (
                      <div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-b-xl bg-white/70 backdrop-blur-[2px] dark:bg-slate-900/70"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        <MaterialIcon name="progress_activity" className="animate-spin text-4xl text-[#007780]" aria-hidden />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("form.generating")}</p>
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

        <footer className="mt-auto border-t border-gray-300 pt-4 pb-0 text-center dark:border-slate-700">
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
            onMouseEnter={pauseNotClothingToastTimer}
            onMouseLeave={startNotClothingToastTimer}
            className="fixed right-4 top-[4.5rem] z-[100] flex max-w-lg items-center gap-3 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-lg dark:border-amber-500 dark:bg-amber-950/90 dark:text-amber-100 lg:right-4 lg:top-auto lg:bottom-4"
          >
            <span className="min-w-0 flex-1">{t("result.notClothingHint")}</span>
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
      {analyzeErrorToast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="alert"
            aria-live="assertive"
            onMouseEnter={pauseAnalyzeErrorToastTimer}
            onMouseLeave={startAnalyzeErrorToastTimer}
            className="fixed right-4 top-[4.5rem] z-[100] flex w-[80vw] max-w-[500px] animate-[slideInRight_0.3s_ease-out] items-center gap-3 rounded-xl bg-red-100/95 px-4 py-3.5 dark:bg-red-950/90 lg:right-4 lg:top-auto lg:bottom-4 lg:w-auto lg:max-w-lg"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-200/80 dark:bg-red-900/50">
              <MaterialIcon name="error" className="text-xl text-red-700 dark:text-red-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {t("form.aiErrorFull") === "form.aiErrorFull" ? "AI error. Try again or check your connection." : t("form.aiErrorFull")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAnalyzeErrorToast(false)}
              className="shrink-0 rounded-lg p-1.5 text-red-700 transition-colors hover:bg-red-200/80 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-red-300 dark:hover:bg-red-800/50 dark:hover:text-red-100"
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
