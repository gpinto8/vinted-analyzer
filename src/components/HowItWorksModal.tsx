"use client";

import { useEffect } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: "add_a_photo",
    title: "Upload photos",
    text: "Add up to 20 photos of your item. Our AI analyzes them to detect style, brand, and details.",
  },
  {
    icon: "edit_note",
    title: "Set condition & details",
    text: "Choose the item condition and optionally add product type or brand to improve the result.",
  },
  {
    icon: "auto_awesome",
    title: "Generate listing",
    text: "Click Generate Listing. AI creates a title, description, suggested price, and tags for Vinted.",
  },
  {
    icon: "content_copy",
    title: "Copy & publish",
    text: "Copy the suggested title and description, then paste them into the Vinted app to list your item.",
  },
];

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-primary/10 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <MaterialIcon name="close" className="text-xl" />
        </button>
        <h2 id="how-it-works-title" className="pr-8 text-xl font-bold text-slate-900">
          How it works
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Get optimized Vinted listings in a few steps.
        </p>
        <ul className="mt-6 space-y-5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg leading-none"
                style={{ backgroundColor: "rgba(0, 119, 128, 0.08)" }}
              >
                <MaterialIcon name={step.icon} className="text-primary" style={{ color: "#007780" }} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-0.5 text-sm text-slate-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#007780] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006269]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
