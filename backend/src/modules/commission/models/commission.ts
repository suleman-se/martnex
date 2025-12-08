/**
 * Commission Data Model (Medusa v2 DML)
 *
 * Tracks platform commission for each order line item.
 * Created automatically when an order is placed via workflow.
 *
 * Business Logic:
 * - Commission calculated per line item (not per order)
 * - Rate determined by: seller > category > global default
 * - Status: pending → approved → paid
 */

import { model } from "@medusajs/utils"

/**
 * Commission Model
 *
 * One commission record per line item in an order.
 * Allows granular tracking of seller earnings.
 */
const Commission = model.define("commission", {
  // Primary key
  id: model.id().primaryKey(),

  // Links to Medusa entities (will use Module Links in v2)
  order_id: model.text(), // Links to Medusa order
  line_item_id: model.text(), // Links to Medusa line item
  seller_id: model.text(), // Links to our seller module

  // Product information (for reporting)
  product_id: model.text().nullable(),
  product_title: model.text().nullable(), // Denormalized for speed
  variant_id: model.text().nullable(),

  // Financial Details
  // All amounts in major units (dollars, not cents) as per Medusa v2
  line_item_total: model.bigNumber(), // Total price of line item
  quantity: model.number(), // Number of items

  // Commission Calculation
  commission_rate: model.bigNumber(), // Percentage applied (e.g., 10.00)
  commission_amount: model.bigNumber(), // Platform's commission
  seller_payout: model.bigNumber(), // Amount seller receives

  // Currency
  currency_code: model.text().default("usd"),

  // Status Workflow
  status: model.enum(["pending", "approved", "paid", "disputed", "cancelled"]).default("pending"),

  // Status timestamps
  approved_at: model.dateTime().nullable(),
  paid_at: model.dateTime().nullable(),
  disputed_at: model.dateTime().nullable(),
  cancelled_at: model.dateTime().nullable(),

  // Notes (for disputes, cancellations, etc.)
  notes: model.text().nullable(),

  // Metadata (extensibility)
  metadata: model.json().nullable(),

  // Timestamps (created_at, updated_at, deleted_at) are auto-added by Medusa v2.12+
})

export default Commission

/**
 * FIELD EXPLANATIONS:
 * ===================
 *
 * line_item_total: Full price customer paid
 *   Example: $100 item
 *
 * commission_rate: Platform's percentage
 *   Example: 10.00 (means 10%)
 *
 * commission_amount: Platform's cut
 *   Example: $100 * 10% = $10
 *
 * seller_payout: What seller receives
 *   Example: $100 - $10 = $90
 *
 * Status Flow:
 * ============
 * pending → Order placed, commission calculated
 * approved → Order completed, ready for payout
 * paid → Seller received money
 * disputed → Customer filed dispute
 * cancelled → Order cancelled/refunded
 *
 * Why Per Line Item?
 * ==================
 * - Orders can have items from multiple sellers
 * - Each item may have different commission rates
 * - Allows granular tracking and reporting
 * - Easy to handle partial refunds
 *
 * Example Order:
 * ==============
 * Order #123
 * - Item A (Seller 1): $50, 10% commission → $5 platform, $45 seller
 * - Item B (Seller 1): $30, 10% commission → $3 platform, $27 seller
 * - Item C (Seller 2): $20, 15% commission → $3 platform, $17 seller
 *
 * Results in 3 commission records!
 */
