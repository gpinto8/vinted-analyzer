"use client";

import { MaterialIcon } from "./MaterialIcon";

export function EmptyResult() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="max-w-xs space-y-4">
        <div
          className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(0, 119, 128, 0.08)" }}
        >
          <MaterialIcon name="description" className="text-3xl leading-none text-primary" style={{ color: "#007780" }} />
        </div>
        <h4 className="text-lg font-bold text-slate-900">No analysis yet</h4>
        <p className="text-sm text-slate-500">
          Upload photos and provide basic details to see your optimized Vinted listing here.
        </p>
      </div>
    </div>
  );
}
