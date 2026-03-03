/** Condition scale from new to used, aligned with Vinted/eBay-style grading. */
export const CONDITION_OPTIONS = [
  "New",
  "Like new",
  "Very good",
  "Good",
  "Fair",
  "Used",
] as const;

export type ConditionOption = (typeof CONDITION_OPTIONS)[number];

export interface ListingResult {
  title?: string;
  description?: string;
  category?: string;
  productType?: string;
  brand?: string;
  /** True when brand came from user input (show as disabled like condition) */
  brandFromUser?: boolean;
  size?: string;
  color?: string;
  material?: string;
  condition?: string;
  measurements?: string;
  tags?: string[];
  priceNew?: number;
  priceSuggested?: number;
}
