"use client";

import { useState, useCallback } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { CONDITION_OPTIONS } from "@/types/listing";
import type { ConditionOption, ListingResult } from "@/types/listing";
import { resizeImage, blobToBase64 } from "@/utils/image";

const MAX_IMAGES = 20;

async function filesToBase64(files: File[]): Promise<string[]> {
  const list = files.slice(0, MAX_IMAGES);
  const out: string[] = [];
  for (const file of list) {
    try {
      const blob = await resizeImage(file);
      out.push(await blobToBase64(blob));
    } catch {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      out.push(base64);
    }
  }
  return out;
}

export interface ListingFormProps {
  onResult: (result: ListingResult) => void;
}

export function ListingForm({ onResult }: ListingFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [condition, setCondition] = useState<ConditionOption | "">("");
  const [productType, setProductType] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!files.length) {
      setError("Add at least one image.");
      return;
    }
    if (!condition) {
      setError("Select a condition.");
      return;
    }
    setLoading(true);
    try {
      const images = await filesToBase64(files);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          condition,
          ...(productType.trim() && { productType: productType.trim() }),
          ...(brand.trim() && { brand: brand.trim() }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      onResult(data as ListingResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const list = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...list].slice(0, MAX_IMAGES));
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...list].slice(0, MAX_IMAGES));
    e.target.value = "";
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-5">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`group relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragActive ? "upload-zone upload-zone--active" : "upload-zone"
          }`}
          style={
            dragActive
              ? { borderColor: "#007780", backgroundColor: "rgba(0, 119, 128, 0.1)" }
              : undefined
          }
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
            id="file-input"
          />
          <span className="mb-3 flex items-center justify-center">
            <MaterialIcon name="add_a_photo" className="text-primary leading-none" style={{ color: "#007780", fontSize: "3rem" }} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-slate-900">Upload up to {MAX_IMAGES} photos</p>
            <p className="text-xs text-slate-500">Drag & drop or click to browse</p>
          </div>
          {files.length > 0 && (
            <ul className="mt-4 w-full space-y-1 text-left text-sm text-slate-600">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-2 truncate">
                  <span className="truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="shrink-0 text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="condition" className="text-sm font-medium text-slate-700">
              Condition
            </label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition((e.target.value || "") as ConditionOption | "")}
              className="select-material bg-white text-slate-900"
            >
              <option value="">Select condition</option>
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="productType" className="text-sm font-medium text-slate-700">
              Product Type <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              id="productType"
              type="text"
              placeholder="e.g. Oversized Hoodie"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="input-material bg-white text-slate-900"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="brand" className="text-sm font-medium text-slate-700">
              Brand <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              id="brand"
              type="text"
              placeholder="e.g. Nike, Levi's"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="input-material bg-white text-slate-900"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#007780] py-4 text-base font-bold text-white shadow-[0_10px_15px_-3px_rgba(0,119,128,0.2),0_4px_6px_-4px_rgba(0,119,128,0.2)] transition-all hover:bg-[#006269] active:scale-[0.98] disabled:opacity-50"
        >
          <MaterialIcon name="auto_awesome" className="text-xl text-white" />
          <span>{loading ? "Generating…" : "Generate Listing"}</span>
        </button>
      </div>
    </form>
  );
}
