/**
 * Frontend Feature Flags
 *
 * Controls which features are visible/active in the frontend.
 * Should match backend feature configuration.
 */

export const FEATURES = {
  // Marketplace features
  MULTI_VENDOR: process.env.NEXT_PUBLIC_ENABLE_MULTI_VENDOR !== "false",
  COMMISSION: process.env.NEXT_PUBLIC_ENABLE_COMMISSION !== "false",

  // Optional features
  REVIEWS: process.env.NEXT_PUBLIC_ENABLE_REVIEWS === "true",
  DISPUTES: process.env.NEXT_PUBLIC_ENABLE_DISPUTES === "true",
  WISHLIST: process.env.NEXT_PUBLIC_ENABLE_WISHLIST === "true",
  LOYALTY: process.env.NEXT_PUBLIC_ENABLE_LOYALTY === "true",
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  PRODUCT_COMPARISON:
    process.env.NEXT_PUBLIC_ENABLE_PRODUCT_COMPARISON === "true",
  LIVE_CHAT: process.env.NEXT_PUBLIC_ENABLE_LIVE_CHAT === "true",

  // Payment providers
  STRIPE: process.env.NEXT_PUBLIC_ENABLE_STRIPE === "true",
  PAYPAL: process.env.NEXT_PUBLIC_ENABLE_PAYPAL === "true",
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key as FeatureKey);
}

/**
 * Hook to check if a feature is enabled
 * Useful for conditional rendering in React components
 */
export function useFeature(feature: FeatureKey): boolean {
  return FEATURES[feature];
}
