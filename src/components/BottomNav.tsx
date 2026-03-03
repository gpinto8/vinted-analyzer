"use client";

import Link from "next/link";
import { MaterialIcon } from "./MaterialIcon";

interface BottomNavProps {
  onProfileClick?: () => void;
}

export function BottomNav({ onProfileClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/10 bg-white/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-around px-4 py-3">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-xs transition-colors"
          style={{ color: "#007780" }}
        >
          <MaterialIcon name="home" className="text-2xl" style={{ color: "#007780" }} />
          <span>Home</span>
        </Link>
        <button
          type="button"
          onClick={onProfileClick}
          className="flex flex-col items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-700"
        >
          <MaterialIcon name="person" className="text-2xl" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
}
