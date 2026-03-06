"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { MaterialIcon } from "./MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { CONDITION_OPTIONS } from "@/types/listing";
import type { AnalyzeRequest, ConditionOption, ListingResult } from "@/types/listing";
import { resizeImage, blobToBase64 } from "@/utils/image";
import { CameraCaptureModal } from "./CameraCaptureModal";

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

export type { AnalyzeRequest };

export interface ListingFormProps {
  onResult: (result: ListingResult, request?: AnalyzeRequest) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
  onAnalyzeError?: () => void;
  productType?: string;
  onProductTypeChange?: (value: string) => void;
  brand?: string;
  onBrandChange?: (value: string) => void;
  files?: File[];
  onFilesChange?: React.Dispatch<React.SetStateAction<File[]>>;
}

export function ListingForm({
  onResult,
  onGeneratingChange,
  onAnalyzeError,
  productType: productTypeProp,
  onProductTypeChange,
  brand: brandProp,
  onBrandChange,
  files: filesProp,
  onFilesChange,
}: ListingFormProps) {
  const { t, locale } = useLanguage();
  const [filesInternal, setFilesInternal] = useState<File[]>([]);
  const files = filesProp !== undefined ? filesProp : filesInternal;
  const setFiles = onFilesChange ?? setFilesInternal;
  const [condition, setCondition] = useState<ConditionOption | "">("");
  const [productTypeInternal, setProductTypeInternal] = useState("");
  const [brandInternal, setBrandInternal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<"images" | "condition" | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [maxPhotosToast, setMaxPhotosToast] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const conditionDropdownRef = useRef<HTMLDivElement>(null);
  const conditionListRef = useRef<HTMLUListElement>(null);
  const conditionButtonRef = useRef<HTMLButtonElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const productType = productTypeProp ?? productTypeInternal;
  const setProductType = onProductTypeChange ?? setProductTypeInternal;
  const brand = brandProp ?? brandInternal;
  const setBrand = onBrandChange ?? setBrandInternal;

  useEffect(() => {
    if (!conditionOpen || !conditionButtonRef.current) return;
    const rect = conditionButtonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, [conditionOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = conditionDropdownRef.current?.contains(target);
      const inList = conditionListRef.current?.contains(target);
      if (!inTrigger && !inList) setConditionOpen(false);
    }
    if (conditionOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [conditionOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorField(null);
    if (!files.length) {
      setError(t("form.addOneImage"));
      setErrorField("images");
      return;
    }
    if (!condition) {
      setError(t("form.selectConditionError"));
      setErrorField("condition");
      return;
    }
    setLoading(true);
    onGeneratingChange?.(true);
    try {
      const images = await filesToBase64(files);
      const payload = {
        images,
        condition,
        locale,
        ...(productType.trim() && { productType: productType.trim() }),
        ...(brand.trim() && { brand: brand.trim() }),
      };
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        onAnalyzeError?.();
        setError(null);
        return;
      }
      const request: AnalyzeRequest = {
        images,
        condition,
        ...(productType.trim() && { productType: productType.trim() }),
        ...(brand.trim() && { brand: brand.trim() }),
      };
      onResult(data as ListingResult, request);
    } catch {
      onAnalyzeError?.();
      setError(null);
      setErrorField(null);
    } finally {
      setLoading(false);
      onGeneratingChange?.(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (errorField === "images") {
      setError(null);
      setErrorField(null);
    }
    const list = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => {
      const combined = [...prev, ...list];
      const next = combined.slice(0, MAX_IMAGES);
      if (next.length === MAX_IMAGES && combined.length > MAX_IMAGES) setMaxPhotosToast(true);
      return next;
    });
  }, [errorField]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as Node | null;
    // Only clear when we know we left: relatedTarget exists and is outside drop zone.
    // When hovering over <img>, relatedTarget is often null - stay active to avoid flashing.
    if (related && dropZoneRef.current && !dropZoneRef.current.contains(related)) {
      setDragActive(false);
    }
  }, []);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorField === "images") {
      setError(null);
      setErrorField(null);
    }
    const list = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const combined = [...prev, ...list];
      const next = combined.slice(0, MAX_IMAGES);
      if (next.length === MAX_IMAGES && combined.length > MAX_IMAGES) setMaxPhotosToast(true);
      return next;
    });
    e.target.value = "";
  }, [errorField]);

  const previewUrlCacheRef = useRef<Map<File, string>>(new Map());

  const previewUrls = useMemo(() => {
    const currentSet = new Set(files);
    const cache = previewUrlCacheRef.current;
    for (const [file, url] of Array.from(cache.entries())) {
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

  useEffect(() => {
    if (!maxPhotosToast) return;
    const id = setTimeout(() => setMaxPhotosToast(false), 4500);
    return () => clearTimeout(id);
  }, [maxPhotosToast]);

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function downloadFile(file: File, index: number) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name || `image-${index + 1}.${file.type.split("/")[1] || "jpg"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleTakePhotoClick = useCallback(() => {
    const useCameraModal =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches &&
      navigator.mediaDevices?.getUserMedia;
    if (useCameraModal) {
      setShowCameraModal(true);
    } else {
      cameraInputRef.current?.click();
    }
  }, []);

  const handleCameraCapture = useCallback((file: File) => {
    setFiles((prev) => [...prev, file].slice(0, MAX_IMAGES));
    setShowCameraModal(false);
  }, []);

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
            } ${errorField === "images" ? "border-red-500 dark:border-red-400" : ""}`}
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
              <p className="text-center text-sm font-bold text-black dark:text-slate-100">{t("form.uploadPhotos", { max: MAX_IMAGES })}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("form.dragDrop")}</p>
            </div>
            <div className="relative z-10 mt-4 flex w-full flex-col gap-2 sm:flex-row sm:flex-initial sm:flex-wrap sm:justify-center">
              <button
                type="button"
                onClick={handleTakePhotoClick}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-0 bg-[#007780] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#006269] focus:outline-none focus:ring-0 sm:w-auto sm:flex-1 sm:min-w-0"
              >
                <MaterialIcon name="photo_camera" className="text-lg shrink-0" />
                {t("form.takePhoto")}
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-0 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto sm:flex-1 sm:min-w-0"
              >
                <MaterialIcon name="photo_library" className="text-lg shrink-0" />
                {t("form.chooseFromGallery")}
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={dropZoneRef}
            className="relative w-full"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {dragActive && (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm dark:bg-slate-900/60"
                aria-hidden
              >
                <span className="rounded-lg border-2 border-dashed border-[#007780] bg-white/80 px-4 py-2.5 text-sm font-medium text-[#007780] dark:bg-slate-800/80 dark:text-[#00a0a8]">
                  {t("form.dropImagesHere")}
                </span>
              </div>
            )}
            <div
              className={`relative flex w-full gap-3 overflow-x-auto rounded-xl pb-2 scrollbar-thin sm:gap-4 ${dragActive ? "ring-2 ring-[#007780] ring-inset" : ""}`}
            >
            {files.length < MAX_IMAGES && (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`flex size-36 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-3 text-center transition-colors sm:size-40 ${
                  dragActive ? "upload-zone upload-zone--active" : "upload-zone"
                }`}
                style={
                  dragActive
                    ? { borderColor: "#007780", backgroundColor: "rgba(0, 119, 128, 0.1)" }
                    : undefined
                }
              >
                <MaterialIcon name="add_a_photo" className="shrink-0" style={{ color: "#007780", fontSize: "1.75rem" }} />
                <p className="text-center text-xs font-bold text-black dark:text-slate-100 sm:text-sm">{t("form.uploadPhotosShort", { max: MAX_IMAGES })}</p>
                <p className="hidden text-[10px] text-slate-500 sm:block sm:text-xs">{t("form.dragDropShort")}</p>
                <div className="mt-1 flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleTakePhotoClick}
                    className="flex size-8 items-center justify-center rounded-lg border-0 bg-[#007780] text-white transition-colors hover:bg-[#006269] focus:outline-none focus:ring-0 sm:size-9"
                    aria-label={t("form.takePhoto")}
                  >
                    <MaterialIcon name="photo_camera" className="text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-0 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:size-9"
                    aria-label={t("form.chooseFromGallery")}
                  >
                    <MaterialIcon name="photo_library" className="text-base" />
                  </button>
                </div>
              </div>
            )}
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="group relative size-36 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:size-40 dark:border-slate-600 dark:bg-slate-800"
                onDragOver={onDragOver}
              >
                <img
                  src={previewUrls[i]}
                  alt={`Listing photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  decoding="async"
                  style={{ imageRendering: "auto" }}
                />
                <div className="absolute right-1 top-1 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="flex size-4 shrink-0 items-center justify-center rounded-full border-0 bg-black/40 p-0 text-white opacity-90 transition-opacity hover:bg-black/60 hover:opacity-100 focus:outline-none focus:ring-0 sm:size-5"
                    aria-label={`Remove ${f.name}`}
                  >
                    <svg className="m-auto block size-3 shrink-0 sm:size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(f, i);
                    }}
                    className="flex size-4 shrink-0 items-center justify-center rounded-full border-0 bg-black/40 p-0 text-white opacity-90 transition-opacity hover:bg-black/60 hover:opacity-100 focus:outline-none focus:ring-0 sm:size-5"
                    aria-label={`Download ${f.name}`}
                  >
                    <svg className="m-auto block size-3 shrink-0 sm:size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet" aria-hidden>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            </div>
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 shrink-0 bg-gradient-to-l from-white to-transparent dark:from-slate-900"
              aria-hidden
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-2" ref={conditionDropdownRef}>
            <label className="text-sm font-medium text-black dark:text-slate-200">{t("form.condition")}</label>
            <div className="relative">
              <button
                ref={conditionButtonRef}
                type="button"
                onClick={() => setConditionOpen((open) => !open)}
                className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-left text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-0 dark:bg-slate-800 dark:text-slate-200 ${
                  errorField === "condition"
                    ? "border-2 border-red-500 dark:border-red-400"
                    : conditionOpen
                      ? "border-2 border-[#007780] px-[15px] py-[11px] shadow-[0_0_0_1px_#007780]"
                      : "border border-slate-300 hover:border-slate-400 focus-visible:border-2 focus-visible:border-[#007780] focus-visible:px-[15px] focus-visible:py-[11px] focus-visible:shadow-[0_0_0_1px_#007780] dark:border-slate-600 dark:hover:border-slate-500 dark:focus-visible:border-[#007780]"
                }`}
                aria-haspopup="listbox"
                aria-expanded={conditionOpen}
                aria-label={t("form.selectCondition")}
              >
                <span className={condition ? "" : "text-slate-500"}>
                  {condition ? t(`condition.${condition}`) : t("form.selectCondition")}
                </span>
                <MaterialIcon
                  name={conditionOpen ? "expand_less" : "expand_more"}
                  className="text-xl text-slate-500"
                />
              </button>
              {conditionOpen &&
                typeof document !== "undefined" &&
                createPortal(
                  <ul
                    ref={conditionListRef}
                    role="listbox"
                    className="fixed z-[100] max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800"
                    style={{
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      width: dropdownPosition.width,
                    }}
                  >
                    {CONDITION_OPTIONS.map((opt) => (
                      <li key={opt} role="option" aria-selected={condition === opt}>
                        <button
                          type="button"
                          onClick={() => {
                            setCondition(opt);
                            setConditionOpen(false);
                            if (errorField === "condition") {
                              setError(null);
                              setErrorField(null);
                            }
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-0 ${
                            condition === opt
                              ? "bg-[#007780]/10 font-medium text-[#007780]"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          {t(`condition.${opt}`)}
                        </button>
                      </li>
                    ))}
                  </ul>,
                  document.body
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
            {showMoreOptions ? t("form.hideOptions") : t("form.seeMoreOptions")}
          </button>

          <div className={`space-y-4 ${showMoreOptions ? "block" : "hidden md:block"}`}>
              <div className="flex flex-col gap-2">
                <label htmlFor="productType" className="text-sm font-medium text-black dark:text-slate-200">
                  {t("form.productTypeOptional")}{" "}
                  <span className="text-xs font-normal text-slate-400">{t("form.optional")}</span>
                </label>
                <input
                  id="productType"
                  type="text"
                  placeholder={(() => {
                    const s = t("form.placeholderProductType");
                    return s === "form.placeholderProductType" ? "e.g. Oversized Hoodie" : s;
                  })()}
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="input-material border border-slate-300 bg-white !text-black dark:border-slate-600 dark:bg-slate-800 dark:!text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="brand" className="text-sm font-medium text-black dark:text-slate-200">
                  {t("form.brandOptional")}{" "}
                  <span className="text-xs font-normal text-slate-400">{t("form.optional")}</span>
                </label>
                <input
                  id="brand"
                  type="text"
                  placeholder={(() => {
                    const s = t("form.placeholderBrand");
                    return s === "form.placeholderBrand" ? "e.g. Nike" : s;
                  })()}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="input-material border border-slate-300 bg-white !text-black dark:border-slate-600 dark:bg-slate-800 dark:!text-slate-200"
                />
              </div>
            </div>
          </div>

        {error && <p className="text-sm font-normal text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#007780] py-4 text-base font-bold text-white shadow-[0_10px_15px_-3px_rgba(0,119,128,0.2),0_4px_6px_-4px_rgba(0,119,128,0.2)] transition-all hover:bg-[#006269] active:scale-[0.98] disabled:opacity-50"
        >
          <MaterialIcon name="auto_awesome" className="text-xl text-white" />
          {loading ? (
            <span className="inline-flex items-baseline">
              {t("form.generating")}
              <span className="ml-1.5 inline-flex">
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
            <span>{t("form.generateListing")}</span>
          )}
        </button>
      </div>

      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCameraCapture}
      />

      {maxPhotosToast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="fixed right-4 top-[4.5rem] z-[100] flex max-w-lg items-center gap-3 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-lg dark:border-amber-500 dark:bg-amber-950/90 dark:text-amber-100 lg:right-4 lg:top-auto lg:bottom-4"
          >
            <span className="min-w-0 flex-1">{t("form.maxPhotosReached")}</span>
            <button
              type="button"
              onClick={() => setMaxPhotosToast(false)}
              className="shrink-0 rounded p-0.5 text-amber-700 transition-colors hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:text-amber-300 dark:hover:bg-amber-800"
              aria-label="Close"
            >
              <MaterialIcon name="close" className="text-lg" />
            </button>
          </div>,
          document.body
        )}
    </form>
  );
}
