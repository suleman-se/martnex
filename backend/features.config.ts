/**
 * Feature Flags Configuration
 *
 * Philosophy: "Give users the banana, not the monkey holding the banana"
 *
 * Each feature can be enabled/disabled independently via environment variables.
 * This allows users to pick only the features they need.
 */

export const FEATURES = {
  // ============================================
  // CORE MARKETPLACE FEATURES
  // ============================================
  // These features are enabled by default but can be disabled
  // for simple e-commerce stores that don't need marketplace functionality

  /**
   * Multi-vendor seller management
   * Allows multiple sellers to list and sell products
   * Default: enabled (set ENABLE_MULTI_VENDOR=false to disable)
   */
  MULTI_VENDOR: process.env.ENABLE_MULTI_VENDOR !== "false",

  /**
   * Commission tracking and calculation
   * Tracks platform commission on each sale
   * Default: enabled (set ENABLE_COMMISSION=false to disable)
   */
  COMMISSION: process.env.ENABLE_COMMISSION !== "false",

  /**
   * Payout management for sellers
   * Handles seller payout requests and processing
   * Default: enabled (set ENABLE_PAYOUT=false to disable)
   */
  PAYOUT: process.env.ENABLE_PAYOUT !== "false",

  // ============================================
  // OPTIONAL FEATURES
  // ============================================
  // These features are disabled by default
  // Set environment variable to 'true' to enable

  /**
   * Product reviews and ratings
   * Allows customers to review and rate products
   * Default: disabled (set ENABLE_REVIEWS=true to enable)
   */
  REVIEWS: process.env.ENABLE_REVIEWS === "true",

  /**
   * Dispute resolution system
   * Allows buyers and sellers to open and resolve disputes
   * Default: disabled (set ENABLE_DISPUTES=true to enable)
   */
  DISPUTES: process.env.ENABLE_DISPUTES === "true",

  /**
   * Wishlist / Favorites
   * Allows customers to save products for later
   * Default: disabled (set ENABLE_WISHLIST=true to enable)
   */
  WISHLIST: process.env.ENABLE_WISHLIST === "true",

  /**
   * Loyalty points program
   * Reward customers with points for purchases
   * Default: disabled (set ENABLE_LOYALTY=true to enable)
   */
  LOYALTY: process.env.ENABLE_LOYALTY === "true",

  /**
   * Advanced analytics and reporting
   * Track detailed metrics and generate reports
   * Default: disabled (set ENABLE_ANALYTICS=true to enable)
   */
  ANALYTICS: process.env.ENABLE_ANALYTICS === "true",

  /**
   * Product comparison feature
   * Allow users to compare multiple products side-by-side
   * Default: disabled (set ENABLE_PRODUCT_COMPARISON=true to enable)
   */
  PRODUCT_COMPARISON: process.env.ENABLE_PRODUCT_COMPARISON === "true",

  /**
   * Live chat support
   * Real-time chat between customers and sellers/support
   * Default: disabled (set ENABLE_LIVE_CHAT=true to enable)
   */
  LIVE_CHAT: process.env.ENABLE_LIVE_CHAT === "true",

  // ============================================
  // PAYMENT PROVIDERS
  // ============================================
  // Enable one or more payment providers

  /**
   * Stripe payment processing
   * Default: disabled (set ENABLE_STRIPE=true to enable)
   */
  STRIPE: process.env.ENABLE_STRIPE === "true",

  /**
   * PayPal payment processing
   * Default: disabled (set ENABLE_PAYPAL=true to enable)
   */
  PAYPAL: process.env.ENABLE_PAYPAL === "true",

  // ============================================
  // NOTIFICATION CHANNELS
  // ============================================
  // Enable one or more notification channels

  /**
   * Email notifications (SendGrid, etc.)
   * Default: disabled (set ENABLE_EMAIL=true to enable)
   */
  EMAIL: process.env.ENABLE_EMAIL === "true",

  /**
   * SMS notifications (Twilio, etc.)
   * Default: disabled (set ENABLE_SMS=true to enable)
   */
  SMS: process.env.ENABLE_SMS === "true",

  /**
   * Push notifications (web/mobile)
   * Default: disabled (set ENABLE_PUSH=true to enable)
   */
  PUSH: process.env.ENABLE_PUSH === "true",

  // ============================================
  // STORAGE PROVIDERS
  // ============================================
  // Enable one or more file storage providers

  /**
   * AWS S3 file storage
   * Default: disabled (set ENABLE_S3=true to enable)
   */
  S3: process.env.ENABLE_S3 === "true",

  /**
   * Cloudinary image storage and optimization
   * Default: disabled (set ENABLE_CLOUDINARY=true to enable)
   */
  CLOUDINARY: process.env.ENABLE_CLOUDINARY === "true",
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Helper function to check if a feature is enabled
 * @param feature - The feature key to check
 * @returns true if the feature is enabled
 */
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature];
}

/**
 * Get list of all enabled features
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key as FeatureKey);
}

/**
 * Log enabled features on startup
 */
export function logEnabledFeatures(): void {
  const enabled = getEnabledFeatures();
  console.log("✓ Enabled features:");
  enabled.forEach((feature) => {
    console.log(`  - ${feature}`);
  });

  if (enabled.length === 0) {
    console.log("  - (No optional features enabled)");
  }
}
