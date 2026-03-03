"use client";

import { MaterialIcon } from "./MaterialIcon";

const FEATURES = [
  {
    icon: "search_check",
    title: "SEO Optimized",
    description: "Titles designed to show up first in Vinted searches.",
  },
  {
    icon: "visibility",
    title: "Visual Recognition",
    description: "Our AI detects fabric patterns, cuts, and key details automatically.",
  },
  {
    icon: "content_copy",
    title: "Instant Copy",
    description: "Paste directly into the Vinted app and sell 2x faster.",
  },
];

export function FeatureCards() {
  return (
    <>
      {FEATURES.map(({ icon, title, description }) => (
        <div
          key={title}
          className="flex items-start gap-4 rounded-xl border border-primary/5 bg-white/50 p-4"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg p-2"
            style={{ backgroundColor: "rgba(0, 119, 128, 0.08)" }}
          >
            <MaterialIcon name={icon} className="text-primary leading-none" style={{ color: "#007780" }} />
          </span>
          <div>
            <h5 className="text-sm font-bold text-slate-900">{title}</h5>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      ))}
    </>
  );
}
