"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";

interface BottomNavProps {
  onProfileClick?: () => void;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function BottomNav({ onProfileClick }: BottomNavProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-4 py-3">
        {isHome ? (
          <button
            type="button"
            onClick={scrollToTop}
            className="flex flex-col items-center gap-1 rounded-md border-0 bg-transparent p-0 text-xs transition-colors focus:outline-none focus:ring-0"
            style={{ color: "#007780" }}
            aria-label="Scroll to top"
          >
            <MaterialIcon name="home" className="text-2xl" style={{ color: "#007780" }} />
            <span>{t("nav.home")}</span>
          </button>
        ) : (
          <Link
            href="/"
            className="flex flex-col items-center gap-1 rounded-md border-0 bg-transparent p-0 text-xs transition-colors focus:outline-none focus:ring-0"
            style={{ color: "#007780" }}
          >
            <MaterialIcon name="home" className="text-2xl" style={{ color: "#007780" }} />
            <span>{t("nav.home")}</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onProfileClick}
          className="flex flex-col items-center gap-1 rounded-md border-0 bg-transparent p-0 text-xs text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus:ring-0 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <MaterialIcon name="person" className="text-2xl" />
          <span>{t("nav.profile")}</span>
        </button>
      </div>
    </nav>
  );
}
