"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "./MaterialIcon";

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

export function Header({ onSignInClick, onHowItWorksClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  // const { isDark, toggleTheme } = useTheme();

  function handleHowItWorks() {
    onHowItWorksClick?.();
    setMenuOpen(false);
  }

  function handleSignIn() {
    onSignInClick?.();
    setMenuOpen(false);
  }

  return (
    <header className="isolate sticky top-0 z-50 w-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-2 rounded-md border-0 bg-transparent p-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-0"
          aria-label="Scroll to top"
        >
          <MaterialIcon name="analytics" className="text-3xl text-primary" style={{ color: "#007780" }} />
          <h1 className="text-xl font-bold tracking-tight text-primary" style={{ color: "#007780" }}>Vinted Analyzer</h1>
        </button>

        <nav className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onHowItWorksClick}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-500"
          >
            How it works
          </button>
          {/* Dark mode - re-enable later
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-black transition-colors hover:text-gray-600 focus:outline-none focus:ring-0 active:bg-transparent"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <MaterialIcon name={isDark ? "light_mode" : "dark_mode"} className="text-2xl" />
          </button>
          */}
          <button
            type="button"
            onClick={onSignInClick}
            className="rounded-lg bg-[#007780] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#006269]"
          >
            Sign In
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-md border-0 bg-transparent text-slate-700 transition-colors focus:outline-none focus:ring-0 active:bg-transparent dark:text-slate-300 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <MaterialIcon name={menuOpen ? "close" : "menu"} className="text-3xl" />
        </button>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-white/50 md:hidden"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="absolute left-0 right-0 top-16 z-50 flex justify-end bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] md:hidden"
            role="dialog"
            aria-label="Mobile menu"
          >
            {/* Dark mode - re-enable later
            <button
              type="button"
              onClick={toggleTheme}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-black transition-colors focus:outline-none focus:ring-0"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <MaterialIcon name={isDark ? "light_mode" : "dark_mode"} className="text-2xl" />
            </button>
            */}
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={handleHowItWorks}
                className="w-fit border-0 bg-transparent py-2 text-right text-sm font-medium text-slate-600 transition-colors hover:text-slate-500 focus:outline-none focus:ring-0"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={handleSignIn}
                className="w-fit rounded-lg border-0 bg-[#007780] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#006269] focus:outline-none focus:ring-0"
              >
                Sign In
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
