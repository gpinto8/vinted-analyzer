"use client";

import { Skeleton } from "./Skeleton";

export function PageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 pb-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="mt-2 h-5 w-full max-w-xl" />
        <Skeleton className="mt-1 h-5 max-w-lg w-[85%]" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
        <section className="flex min-h-0 flex-col lg:col-span-6">
          <div className="flex min-h-[32rem] flex-col rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:bg-slate-900 dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] lg:min-h-[36rem]">
            <div className="shrink-0 rounded-t-xl border-b border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-3/4 max-w-xs rounded-lg" />
            </div>
          </div>
        </section>

        <section className="hidden lg:flex lg:min-h-0 lg:flex-col lg:col-span-6">
          <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:bg-slate-900 dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] lg:overflow-hidden">
            <div className="shrink-0 rounded-t-xl border-b border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-8 w-3/4 rounded-lg" />
            </div>
          </div>
        </section>
      </div>

      <section className="mt-12 mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl bg-white p-4 dark:bg-slate-900">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-full max-w-[90%]" />
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-auto border-t border-gray-300 pt-4 pb-0 text-center dark:border-slate-700">
        <Skeleton className="mx-auto h-4 w-48" />
        <Skeleton className="mx-auto mt-4 h-4 w-32" />
      </footer>
    </main>
  );
}
