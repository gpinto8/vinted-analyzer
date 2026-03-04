import type { AnalyzeRequest, ListingResult } from "@/types/listing";

const STORAGE_KEY_LAST = "vinted-listing-last";
const STORAGE_KEY_QUEUE = "vinted-listing-queue";
const MAX_QUEUE_SIZE = 10;

export interface StoredListing {
  result: ListingResult;
  savedAt: number;
  /** Optional request used to produce this result; enables re-analysis on locale change. */
  request?: AnalyzeRequest;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveLastResult(result: ListingResult, request?: AnalyzeRequest): void {
  if (typeof window === "undefined") return;
  const item: StoredListing = { result, savedAt: Date.now(), ...(request && { request }) };
  try {
    localStorage.setItem(STORAGE_KEY_LAST, JSON.stringify(item));
    const queue = getQueue();
    const next = [item, ...queue.filter((e) => e.savedAt !== item.savedAt)].slice(0, MAX_QUEUE_SIZE);
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(next));
  } catch {
    // ignore quota or disabled storage
  }
}

export function getLastResult(): StoredListing | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY_LAST);
  const parsed = safeParse<StoredListing | null>(raw, null);
  if (!parsed?.result) return null;
  return parsed;
}

export function getQueue(): StoredListing[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY_QUEUE);
  const parsed = safeParse<StoredListing[]>(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function clearListingStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_LAST);
    localStorage.removeItem(STORAGE_KEY_QUEUE);
  } catch {
    // ignore
  }
}
