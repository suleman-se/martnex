/**
 * Module Links Configuration (Medusa v2.12.1)
 *
 * Establishes relationships between different modules using Medusa's Module Links.
 * Module Links enable querying across module boundaries without tight coupling.
 *
 * In v2.12.1, Module Links are defined separately and registered in medusa-config.ts
 * This file serves as the centralized location for all cross-module relationships.
 *
 * Documentation: https://docs.medusajs.com/learn/fundamentals/architecture/modules#module-links
 */

/**
 * Relationship 1: Seller ↔ Customer
 * 
 * A customer can optionally become a seller.
 * This creates a one-to-one relationship between seller and customer.
 * 
 * Used for:
 * - Checking if a customer is also a seller
 * - Getting seller profile for a customer
 * - Linking seller to customer's other data
 * 
 * Note: Implementation in medusa-config.ts via links array
 */
export const SELLER_CUSTOMER_LINK_CONFIG = {
  alias: "seller_customers",
  leftModule: "sellerModuleService",
  rightModule: "medusa",
  leftProperty: "customer_id",
  rightProperty: "id",
  isList: false, // One-to-one
} as const

/**
 * Relationship 2: Commission ↔ Seller
 * 
 * A commission belongs to one seller.
 * A seller can have many commissions.
 * This creates a one-to-many relationship.
 * 
 * Used for:
 * - Getting all commissions for a seller
 * - Seller earnings reports
 * - Commission tracking per seller
 */
export const COMMISSION_SELLER_LINK_CONFIG = {
  alias: "commission_sellers",
  leftModule: "commissionModuleService",
  rightModule: "sellerModuleService",
  leftProperty: "seller_id",
  rightProperty: "id",
  isList: false, // Commission → 1 Seller
} as const

/**
 * Relationship 3: Commission ↔ Order
 * 
 * A commission is tied to an order.
 * An order can have multiple commissions (one per line item per seller).
 * This creates a one-to-many relationship with Medusa's order entity.
 * 
 * Used for:
 * - Getting commission breakdown for an order
 * - Identifying sellers in an order
 * - Order-level revenue calculations
 */
export const COMMISSION_ORDER_LINK_CONFIG = {
  alias: "commission_orders",
  leftModule: "commissionModuleService",
  rightModule: "medusa",
  leftProperty: "order_id",
  rightProperty: "id",
  isList: false, // Commission → 1 Order
} as const

/**
 * Relationship 4: Payout ↔ Seller
 * 
 * A payout belongs to one seller.
 * A seller can have many payouts.
 * This creates a one-to-many relationship.
 * 
 * Used for:
 * - Getting payout history for a seller
 * - Seller payment tracking
 * - Payout status monitoring per seller
 */
export const PAYOUT_SELLER_LINK_CONFIG = {
  alias: "payout_sellers",
  leftModule: "payoutModuleService",
  rightModule: "sellerModuleService",
  leftProperty: "seller_id",
  rightProperty: "id",
  isList: false, // Payout → 1 Seller
} as const

/**
 * Export all link configurations for medusa-config.ts
 * 
 * These are registered in medusa-config.ts like:
 * ```typescript
 * import {
 *   SELLER_CUSTOMER_LINK_CONFIG,
 *   COMMISSION_SELLER_LINK_CONFIG,
 *   COMMISSION_ORDER_LINK_CONFIG,
 *   PAYOUT_SELLER_LINK_CONFIG,
 * } from "./src/config/module-links"
 * 
 * // In medusa-config:
 * links: [
 *   SELLER_CUSTOMER_LINK_CONFIG,
 *   COMMISSION_SELLER_LINK_CONFIG,
 *   COMMISSION_ORDER_LINK_CONFIG,
 *   PAYOUT_SELLER_LINK_CONFIG,
 * ]
 * ```
 */
export const MODULE_LINKS = [
  SELLER_CUSTOMER_LINK_CONFIG,
  COMMISSION_SELLER_LINK_CONFIG,
  COMMISSION_ORDER_LINK_CONFIG,
  PAYOUT_SELLER_LINK_CONFIG,
]
