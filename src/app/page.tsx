"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ListingForm } from "@/components/ListingForm";
import { EmptyResult } from "@/components/EmptyResult";
import { ResultCard } from "@/components/ResultCard";
import { FeatureCards } from "@/components/FeatureCards";
import { BottomNav } from "@/components/BottomNav";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { ListingResult } from "@/types/listing";

const OPTIMIZED_RESULT_ID = "optimized-result";

export default function Home() {
  const [result, setResult] = useState<ListingResult | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    if (result) {
      document.getElementById(OPTIMIZED_RESULT_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <Header
        onSignInClick={() => setShowComingSoon(true)}
        onHowItWorksClick={() => setShowHowItWorks(true)}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 pb-24 sm:px-6 md:pb-10 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary dark:text-primary" style={{ color: "var(--color-primary)" }}>
            Create your listing
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Upload your photos and our AI will generate professional, SEO-friendly titles, descriptions, and suggested prices for your Vinted listings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="flex flex-col gap-6 lg:col-span-6">
            <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] md:h-[700px]">
              <div className="shrink-0 rounded-t-xl border-b border-gray-200 bg-white p-4">
                <h3 className="text-base font-bold tracking-tight text-black">
                  Input Details
                </h3>
              </div>
              <div className="overflow-y-auto p-6 md:min-h-0 md:flex-1">
                <ListingForm onResult={setResult} />
              </div>
            </div>
          </section>

          <section
            id={OPTIMIZED_RESULT_ID}
            className={result ? "lg:col-span-6" : "hidden lg:block lg:col-span-6"}
            aria-label="Optimized result"
          >
            <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] md:h-[700px]">
              <div className="shrink-0 rounded-t-xl border-b border-gray-200 bg-white p-4">
                {result ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="auto_awesome" className="text-xl shrink-0" style={{ color: "#007780" }} />
                      <h3 className="text-base font-bold tracking-tight text-[#007780]">
                        Optimized Result
                      </h3>
                    </div>
                    <span className="rounded-md bg-[#007780] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      AI Generated
                    </span>
                  </div>
                ) : (
                  <h3 className="text-base font-bold tracking-tight text-black">
                    Optimized Result
                  </h3>
                )}
              </div>
              <div className="flex flex-col overflow-visible md:min-h-0 md:flex-1 md:overflow-y-auto">
                {result ? <ResultCard data={result} /> : <EmptyResult />}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-12 mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCards />
        </section>

        <footer className="mt-auto border-t border-gray-300 pt-4 pb-0 text-center dark:border-gray-500">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Love shopping?{" "}
            <a
              href="https://www.vinted.it/member/286326599"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#007780] underline-offset-2 hover:underline dark:text-primary"
            >
              Show me some love on my Vinted
            </a>
          </p>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Vinted Analyzer. Not affiliated with Vinted Ltd.
          </p>
        </footer>
      </main>
      <BottomNav onProfileClick={() => setShowComingSoon(true)} />
      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </div>
  );
}
