"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const conditionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (conditionDropdownRef.current && !conditionDropdownRef.current.contains(e.target as Node)) {
        setConditionOpen(false);
      }
    }
    if (conditionOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [conditionOpen]);

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

  const previewUrlCacheRef = useRef<Map<File, string>>(new Map());

  const previewUrls = useMemo(() => {
    const currentSet = new Set(files);
    const cache = previewUrlCacheRef.current;
    for (const [file, url] of cache.entries()) {
      if (!currentSet.has(file)) {
        URL.revokeObjectURL(url);
        cache.delete(file);
      }
    }
    return files.map((file) => {
      let url = cache.get(file);
      if (!url) {
        url = URL.createObjectURL(file);
        cache.set(file, url);
      }
      return url;
    });
  }, [files]);

  useEffect(() => {
    return () => {
      previewUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlCacheRef.current.clear();
    };
  }, []);

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-5">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={onFileInput}
          className="hidden"
          aria-hidden
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFileInput}
          className="hidden"
          aria-hidden
        />

        {files.length === 0 ? (
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
            <span className="relative z-0 mb-3 flex items-center justify-center">
              <MaterialIcon name="add_a_photo" className="text-primary leading-none" style={{ color: "#007780", fontSize: "3rem" }} />
            </span>
            <div className="relative z-0 flex flex-col gap-1">
              <p className="text-sm font-bold text-black">Upload up to {MAX_IMAGES} photos</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Drag & drop or use the buttons below</p>
            </div>
            <div className="relative z-10 mt-4 flex w-full flex-col gap-2 sm:flex-row sm:flex-initial sm:flex-wrap sm:justify-center">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-0 bg-[#007780] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006269] focus:outline-none focus:ring-0 sm:w-auto sm:flex-1 sm:min-w-0"
              >
                <MaterialIcon name="photo_camera" className="text-lg shrink-0" />
                Take photo
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-0 sm:w-auto sm:flex-1 sm:min-w-0"
              >
                <MaterialIcon name="photo_library" className="text-lg shrink-0" />
                Choose from gallery
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            <div className="flex w-full gap-3 overflow-x-auto pb-2 sm:gap-4">
            {files.length < MAX_IMAGES && (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`flex size-32 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-3 text-center transition-colors sm:size-36 ${
                  dragActive ? "upload-zone upload-zone--active" : "upload-zone"
                }`}
                style={
                  dragActive
                    ? { borderColor: "#007780", backgroundColor: "rgba(0, 119, 128, 0.1)" }
                    : undefined
                }
              >
                <MaterialIcon name="add_a_photo" className="shrink-0" style={{ color: "#007780", fontSize: "1.75rem" }} />
                <p className="text-xs font-bold text-black sm:text-sm">Upload up to {MAX_IMAGES}</p>
                <p className="hidden text-[10px] text-slate-500 sm:block sm:text-xs">Drag & drop</p>
                <div className="mt-1 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex size-8 items-center justify-center rounded-lg border-0 bg-[#007780] text-white transition-colors hover:bg-[#006269] focus:outline-none focus:ring-0 sm:size-9"
                    aria-label="Take photo"
                  >
                    <MaterialIcon name="photo_camera" className="text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-0 sm:size-9"
                    aria-label="Choose from gallery"
                  >
                    <MaterialIcon name="photo_library" className="text-base" />
                  </button>
                </div>
              </div>
            )}
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="group relative size-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:size-36 dark:border-slate-600 dark:bg-slate-800"
              >
                <img
                  src={previewUrls[i]}
                  alt={f.name}
                  className="h-full w-full object-cover"
                  decoding="async"
                  style={{ imageRendering: "auto" }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full border-0 bg-red-500 text-white shadow transition-colors hover:bg-red-600 focus:outline-none focus:ring-0 sm:size-7"
                  aria-label={`Remove ${f.name}`}
                >
                  <MaterialIcon name="close" className="text-base sm:text-lg" />
                </button>
              </div>
            ))}
            </div>
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 shrink-0 bg-gradient-to-l from-white to-transparent"
              aria-hidden
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-2" ref={conditionDropdownRef}>
            <label className="text-sm font-medium text-black">Condition</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setConditionOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007780]/30 focus:ring-offset-1"
                aria-haspopup="listbox"
                aria-expanded={conditionOpen}
                aria-label="Select condition"
              >
                <span className={condition ? "" : "text-slate-500"}>
                  {condition || "Select condition"}
                </span>
                <MaterialIcon
                  name={conditionOpen ? "expand_less" : "expand_more"}
                  className="text-xl text-slate-500"
                />
              </button>
              {conditionOpen && (
                <ul
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                >
                  {CONDITION_OPTIONS.map((opt) => (
                    <li key={opt} role="option" aria-selected={condition === opt}>
                      <button
                        type="button"
                        onClick={() => {
                          setCondition(opt);
                          setConditionOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-0 ${
                          condition === opt
                            ? "bg-[#007780]/10 font-medium text-[#007780]"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMoreOptions((prev) => !prev)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#007780] hover:text-[#006269] focus:outline-none focus:ring-0 dark:text-primary dark:hover:text-[#0099a3] md:hidden"
            aria-expanded={showMoreOptions}
          >
            <MaterialIcon
              name={showMoreOptions ? "expand_less" : "expand_more"}
              className="text-xl"
            />
            {showMoreOptions ? "Hide options" : "See more options"}
          </button>

          <div className={`space-y-4 ${showMoreOptions ? "block" : "hidden md:block"}`}>
              <div className="flex flex-col gap-2">
                <label htmlFor="productType" className="text-sm font-medium text-black">
                  Product Type <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="productType"
                  type="text"
                  placeholder="e.g. Oversized Hoodie"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="input-material bg-white !text-black"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="brand" className="text-sm font-medium text-black">
                  Brand <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="brand"
                  type="text"
                  placeholder="e.g. Nike"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="input-material bg-white !text-black"
                />
              </div>
            </div>
          </div>

        {error && <p className="text-sm font-normal text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#007780] py-4 text-base font-bold text-white shadow-[0_10px_15px_-3px_rgba(0,119,128,0.2),0_4px_6px_-4px_rgba(0,119,128,0.2)] transition-all hover:bg-[#006269] active:scale-[0.98] disabled:opacity-50"
        >
          <MaterialIcon name="auto_awesome" className="text-xl text-white" />
          {loading ? (
            <span className="inline-flex items-baseline">
              Generating
              <span className="ml-0.5 inline-flex">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    .
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span>Generate Listing</span>
          )}
        </button>
      </div>
    </form>
  );
}
