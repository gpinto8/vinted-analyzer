"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Logo } from "./Logo";
import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/contexts/LanguageContext";

const THEME_KEY = "theme";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return { isDark, toggleTheme };
}

interface HeaderProps {
  onSignInClick?: () => void;
  onHowItWorksClick?: () => void;
}

const LOCALES: { value: Locale; labelKey: string }[] = [
  { value: "it", labelKey: "languages.it" },
  { value: "en", labelKey: "languages.en" },
  { value: "es", labelKey: "languages.es" },
  { value: "fr", labelKey: "languages.fr" },
];

export function Header({ onSignInClick, onHowItWorksClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [langDropdownPosition, setLangDropdownPosition] = useState({ top: 0, left: 0 });
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const langListRef = useRef<HTMLUListElement>(null);
  const { t, locale, setLocale } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (langOpen && langButtonRef.current) {
      const rect = langButtonRef.current.getBoundingClientRect();
      setLangDropdownPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [langOpen]);

  useEffect(() => {
    if (!langOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !langButtonRef.current?.contains(target) &&
        !langListRef.current?.contains(target)
      ) {
        setLangOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [langOpen]);

  function handleHowItWorks() {
    onHowItWorksClick?.();
    setMenuOpen(false);
  }

  function handleSignIn() {
    onSignInClick?.();
    setMenuOpen(false);
  }

  return (
    <header className="isolate sticky top-0 z-50 w-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-none dark:bg-slate-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-2 rounded-md border-0 bg-transparent p-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-0"
          aria-label="Scroll to top"
        >
          <Logo className="h-8 w-8 shrink-0" />
          <h1 className="text-xl font-bold tracking-tight text-primary" style={{ color: "#007780" }}>Vinted Analyzer</h1>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={onHowItWorksClick}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-500 dark:text-slate-300 dark:hover:text-slate-200"
          >
            {t("header.howItWorks")}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-0 active:bg-transparent dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <MaterialIcon name={isDark ? "light_mode" : "dark_mode"} className="text-2xl" />
          </button>
          <div className="relative">
            <button
              ref={langButtonRef}
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-0 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              aria-label={t("header.language")}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <MaterialIcon name="language" className="text-2xl" />
            </button>
            {langOpen &&
              typeof document !== "undefined" &&
              createPortal(
                <ul
                  ref={langListRef}
                  role="listbox"
                  className="fixed z-[100] min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
                  style={
                    menuOpen
                      ? { top: 112, left: 16 }
                      : { top: langDropdownPosition.top, left: langDropdownPosition.left }
                  }
                >
                  {LOCALES.map((loc) => (
                    <li key={loc.value} role="option" aria-selected={locale === loc.value}>
                      <button
                        type="button"
                        onClick={() => {
                          setLocale(loc.value);
                          setLangOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-0 ${
                          locale === loc.value
                            ? "bg-[#007780]/10 font-medium text-[#007780]"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        {t(loc.labelKey)}
                      </button>
                    </li>
                  ))}
                </ul>,
                document.body
              )}
          </div>
          <button
            type="button"
            onClick={onSignInClick}
            className="rounded-lg bg-[#007780] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#006269]"
          >
            {t("header.signIn")}
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-md border-0 bg-transparent text-slate-700 transition-colors focus:outline-none focus:ring-0 active:bg-transparent dark:text-slate-300 md:hidden"
          aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
          aria-expanded={menuOpen}
        >
          <MaterialIcon name={menuOpen ? "close" : "menu"} className="text-3xl" />
        </button>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-white/50 dark:bg-black/50 md:hidden"
            aria-hidden
            onClick={() => {
              setMenuOpen(false);
              setLangOpen(false);
            }}
          />
          <nav
            className="absolute left-0 right-0 z-50 flex w-full flex-row items-start justify-between gap-4 bg-white px-4 py-3 dark:bg-slate-900 md:hidden"
            role="dialog"
            aria-label="Mobile menu"
          >
            <div className="relative flex flex-row items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-0 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                <MaterialIcon name={isDark ? "light_mode" : "dark_mode"} className="text-2xl" />
              </button>
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                className="flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-0 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                aria-label={t("header.language")}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
              >
                <MaterialIcon name="language" className="text-2xl" />
              </button>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={handleHowItWorks}
                className="w-fit border-0 bg-transparent py-2 text-right text-sm font-medium text-slate-600 transition-colors hover:text-slate-500 focus:outline-none focus:ring-0 dark:text-slate-300 dark:hover:text-slate-200"
              >
                {t("header.howItWorks")}
              </button>
              <button
                type="button"
                onClick={handleSignIn}
                className="w-fit rounded-lg border-0 bg-[#007780] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#006269] focus:outline-none focus:ring-0"
              >
                {t("header.signIn")}
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
