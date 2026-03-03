"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { ListingForm } from "@/components/ListingForm";
import { EmptyResult } from "@/components/EmptyResult";
import { ResultCard } from "@/components/ResultCard";
import { FeatureCards } from "@/components/FeatureCards";
import { BottomNav } from "@/components/BottomNav";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import type { ListingResult } from "@/types/listing";

export default function Home() {
  const [result, setResult] = useState<ListingResult | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Header
        onSignInClick={() => setShowComingSoon(true)}
        onHowItWorksClick={() => setShowHowItWorks(true)}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 pb-24 sm:px-6 md:pb-10 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">
            Vinted Analyzer
          </h2>
          <p className="mt-2 text-slate-600">
            Transform your photos into professional, SEO-friendly Vinted descriptions in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Input Details
              </h3>
              <ListingForm onResult={setResult} />
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
              <div className="border-b border-primary/5 bg-slate-50/50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Optimized Result
                </h3>
              </div>
              {result ? <ResultCard data={result} /> : <EmptyResult />}
            </div>
          </section>
        </div>

        <section className="mt-12 mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCards />
        </section>

        <footer className="mt-auto border-t border-primary/5 pt-4 pb-0 text-center">
          <p className="text-xs text-slate-400">
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
