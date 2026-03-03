export const CONDITION_OPTIONS = [
  "New with tags",
  "New without tags",
  "Very good",
  "Good",
  "Satisfactory",
] as const;

export type ConditionOption = (typeof CONDITION_OPTIONS)[number];

export interface ListingResult {
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  condition?: string;
  measurements?: string;
  tags?: string[];
  priceNew?: number;
  priceSuggested?: number;
}
