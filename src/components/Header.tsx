"use client";

import { MaterialIcon } from "./MaterialIcon";

interface HeaderProps {
  onSignInClick?: () => void;
  onHowItWorksClick?: () => void;
}

export function Header({ onSignInClick, onHowItWorksClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <MaterialIcon name="analytics" className="text-3xl text-primary" style={{ color: "#007780" }} />
          <h1 className="text-xl font-bold tracking-tight text-primary" style={{ color: "#007780" }}>Vinted Analyzer</h1>
        </div>
        <nav className="flex items-center gap-4">
          <button
            type="button"
            onClick={onHowItWorksClick}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={onSignInClick}
            className="rounded-lg bg-[#007780] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#006269]"
          >
            Sign In
          </button>
        </nav>
      </div>
    </header>
  );
}
