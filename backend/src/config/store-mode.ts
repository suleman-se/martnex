/**
 * Store Mode Configuration for Martnex
 *
 * Automatically configures the platform based on store mode.
 * Aligned with Medusa v2 module-first architecture.
 *
 * Modes:
 * - SINGLE_STORE: One owner manages all products (simple e-commerce store)
 * - MULTI_VENDOR_MARKETPLACE: Multiple sellers can register and sell (marketplace)
 *
 * Philosophy: Set one env variable, everything else happens automatically
 */

export type StoreMode = 'SINGLE_STORE' | 'MULTI_VENDOR_MARKETPLACE';

/**
 * Detect store mode from environment
 * Default: MULTI_VENDOR_MARKETPLACE
 */
export const STORE_MODE: StoreMode =
  (process.env.STORE_MODE as StoreMode) || 'MULTI_VENDOR_MARKETPLACE';

/**
 * Determine if we're in single store mode
 */
export const isSingleStoreMode = (): boolean => STORE_MODE === 'SINGLE_STORE';

/**
 * Determine if we're in multi-vendor marketplace mode
 */
export const isMultiVendorMode = (): boolean => STORE_MODE === 'MULTI_VENDOR_MARKETPLACE';

/**
 * Feature Flags (Auto-configured based on store mode)
 *
 * These are checked throughout the application to enable/disable features.
 * In Medusa v2, these control which modules get loaded.
 */
export const FEATURES = (() => {
  // Core Medusa modules (always available in both modes)
  const core = {
    // Medusa built-in commerce modules
    PRODUCTS: true,
    CART: true,
    CHECKOUT: true,
    ORDERS: true,
    CUSTOMERS: true,
    INVENTORY: true,
    PRICING: true,
    TAX: true,
    FULFILLMENT: true,
    PAYMENT: true,
  };

  // Optional integrations (user choice via env vars)
  const integrations = {
    // Payment providers
    STRIPE: process.env.ENABLE_STRIPE === 'true',
    PAYPAL: process.env.ENABLE_PAYPAL === 'true',
    BANK_TRANSFER: process.env.ENABLE_BANK_TRANSFER === 'true',
    COD: process.env.ENABLE_COD === 'true', // Cash on Delivery

    // Storage providers
    S3: process.env.ENABLE_S3 === 'true',
    CLOUDINARY: process.env.ENABLE_CLOUDINARY === 'true',
    LOCAL_STORAGE: process.env.ENABLE_LOCAL_STORAGE !== 'false', // Default: true

    // Notification channels
    EMAIL: process.env.ENABLE_EMAIL === 'true',
    SMS: process.env.ENABLE_SMS === 'true',
    PUSH_NOTIFICATIONS: process.env.ENABLE_PUSH === 'true',
  };

  // Optional feature modules (works in both modes)
  const optional = {
    REVIEWS: process.env.ENABLE_REVIEWS === 'true',
    WISHLIST: process.env.ENABLE_WISHLIST === 'true',
    LOYALTY: process.env.ENABLE_LOYALTY === 'true',
    ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  };

  // Mode-specific features
  if (isSingleStoreMode()) {
    return {
      ...core,
      ...integrations,
      ...optional,

      // Multi-vendor features (DISABLED in single store)
      MULTI_VENDOR: false,
      SELLER_MODULE: false,
      SELLER_REGISTRATION: false,
      SELLER_DASHBOARD: false,
      SELLER_VERIFICATION: false,
      COMMISSION_MODULE: false,
      COMMISSION_CALCULATION: false,
      COMMISSION_CONFIG: false,
      PAYOUT_MODULE: false,
      PAYOUT_REQUESTS: false,
      PAYOUT_PROCESSING: false,

      // Disputes (optional, simpler workflow in single store)
      DISPUTES: process.env.ENABLE_DISPUTES === 'true',

      // Admin has full control
      ADMIN_PRODUCT_MANAGEMENT: true,
      ADMIN_ORDER_MANAGEMENT: true,
      ADMIN_CUSTOMER_MANAGEMENT: true,
    };
  }

  // Multi-vendor marketplace mode
  return {
    ...core,
    ...integrations,
    ...optional,

    // Multi-vendor features (ENABLED)
    MULTI_VENDOR: true,
    SELLER_MODULE: true,
    SELLER_REGISTRATION: true,
    SELLER_DASHBOARD: true,
    SELLER_VERIFICATION: process.env.REQUIRE_SELLER_VERIFICATION !== 'false', // Default: true
    COMMISSION_MODULE: process.env.ENABLE_COMMISSION !== 'false', // Default: true
    COMMISSION_CALCULATION: process.env.ENABLE_COMMISSION !== 'false',
    COMMISSION_CONFIG: true,
    PAYOUT_MODULE: process.env.ENABLE_PAYOUT !== 'false', // Default: true
    PAYOUT_REQUESTS: process.env.ENABLE_PAYOUT !== 'false',
    PAYOUT_PROCESSING: process.env.ENABLE_PAYOUT !== 'false',

    // Disputes (default enabled for marketplace)
    DISPUTES: process.env.ENABLE_DISPUTES !== 'false',

    // Admin has extended capabilities
    ADMIN_PRODUCT_MANAGEMENT: true,
    ADMIN_ORDER_MANAGEMENT: true,
    ADMIN_CUSTOMER_MANAGEMENT: true,
    ADMIN_SELLER_MANAGEMENT: true,
    ADMIN_COMMISSION_MANAGEMENT: true,
    ADMIN_PAYOUT_MANAGEMENT: true,
    ADMIN_DISPUTE_RESOLUTION: true,
  };
})();

/**
 * Check if a specific feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature] === true;
};

/**
 * Get list of custom modules to load based on enabled features
 *
 * This is used by Medusa v2's module loader to know which custom modules to register.
 * Only loads modules needed for enabled features.
 */
export const getModulesToLoad = (): string[] => {
  const modules: string[] = [];

  // Multi-vendor modules
  if (FEATURES.SELLER_MODULE) {
    modules.push('seller');
  }

  if (FEATURES.COMMISSION_MODULE) {
    modules.push('commission');
  }

  if (FEATURES.PAYOUT_MODULE) {
    modules.push('payout');
  }

  // Optional feature modules
  if (FEATURES.REVIEWS) {
    modules.push('review');
  }

  if (FEATURES.DISPUTES) {
    modules.push('dispute');
  }

  if (FEATURES.WISHLIST) {
    modules.push('wishlist');
  }

  if (FEATURES.LOYALTY) {
    modules.push('loyalty');
  }

  if (FEATURES.ANALYTICS) {
    modules.push('analytics');
  }

  return modules;
};

/**
 * Get list of database migrations to run based on enabled modules
 *
 * Medusa v2 auto-generates migrations from data models.
 * This tells the migration system which module migrations to include.
 */
export const getMigrationsToRun = (): string[] => {
  const migrations: string[] = [
    'core', // Always run Medusa core migrations
  ];

  // Add migrations for enabled custom modules
  const customModules = getModulesToLoad();
  migrations.push(...customModules);

  // Notification table if any notification channel is enabled
  if (FEATURES.EMAIL || FEATURES.SMS || FEATURES.PUSH_NOTIFICATIONS) {
    migrations.push('notification');
  }

  return migrations;
};

/**
 * Validate configuration
 *
 * Ensures required settings are present.
 * Throws error if configuration is invalid.
 */
export const validateConfiguration = (): void => {
  const errors: string[] = [];

  // At least one payment provider required
  if (!FEATURES.STRIPE && !FEATURES.PAYPAL && !FEATURES.BANK_TRANSFER && !FEATURES.COD) {
    errors.push(
      'At least one payment provider must be enabled:\n' +
      '    - ENABLE_STRIPE=true (online payment)\n' +
      '    - ENABLE_PAYPAL=true (online payment)\n' +
      '    - ENABLE_BANK_TRANSFER=true (manual verification)\n' +
      '    - ENABLE_COD=true (Cash on Delivery - physical products only)'
    );
  }

  // COD validation: If COD is the ONLY payment method, warn about digital products
  if (FEATURES.COD && !FEATURES.STRIPE && !FEATURES.PAYPAL && !FEATURES.BANK_TRANSFER) {
    console.warn(
      '\n⚠️  Warning: COD is enabled as the only payment method.\n' +
      '   Note: COD should be disabled for digital products at checkout.\n' +
      '   Consider enabling an online payment method for digital goods.\n'
    );
  }

  // At least one storage provider required
  if (!FEATURES.S3 && !FEATURES.CLOUDINARY && !FEATURES.LOCAL_STORAGE) {
    errors.push(
      'At least one storage provider must be enabled (ENABLE_S3=true, ENABLE_CLOUDINARY=true, or ENABLE_LOCAL_STORAGE=true)'
    );
  }

  // Multi-vendor mode requires commission
  if (FEATURES.MULTI_VENDOR && !FEATURES.COMMISSION_MODULE) {
    errors.push(
      'Multi-vendor mode requires commission module (set ENABLE_COMMISSION=true or use STORE_MODE=SINGLE_STORE)'
    );
  }

  // Multi-vendor mode requires payout
  if (FEATURES.MULTI_VENDOR && !FEATURES.PAYOUT_MODULE) {
    errors.push(
      'Multi-vendor mode requires payout module (set ENABLE_PAYOUT=true or use STORE_MODE=SINGLE_STORE)'
    );
  }

  // Throw if there are validation errors
  if (errors.length > 0) {
    throw new Error(
      `\n\n❌ Configuration validation failed:\n\n${errors.map((e) => `  • ${e}`).join('\n')}\n`
    );
  }
};

/**
 * Get configuration summary for logging during startup
 */
export const getConfigSummary = (): string => {
  const enabledFeatures = Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);

  const modulesToLoad = getModulesToLoad();

  return `
┌─────────────────────────────────────────────┐
│  🏪 Martnex Configuration                   │
├─────────────────────────────────────────────┤
│  Mode: ${STORE_MODE.padEnd(36)} │
│  Custom Modules: ${modulesToLoad.length.toString().padEnd(26)} │
│  Enabled Features: ${enabledFeatures.length.toString().padEnd(24)} │
└─────────────────────────────────────────────┘

${isSingleStoreMode() ? '🏪 Single Store Mode' : '🏢 Multi-Vendor Marketplace Mode'}

Custom Modules to Load:
${modulesToLoad.length > 0 ? modulesToLoad.map((m) => `  ✓ ${m}`).join('\n') : '  (none - using Medusa core modules only)'}

Enabled Features:
${enabledFeatures.slice(0, 15).map((f) => `  ✓ ${f}`).join('\n')}${enabledFeatures.length > 15 ? `\n  ... and ${enabledFeatures.length - 15} more` : ''}
`.trim();
};

// Validate on import (fail fast if misconfigured)
try {
  validateConfiguration();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

// Log configuration in development
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  console.log('\n' + getConfigSummary() + '\n');
}
