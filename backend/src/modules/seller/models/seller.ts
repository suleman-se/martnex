/**
 * Seller Data Model (Medusa v2 DML)
 *
 * This uses Medusa's Data Model Language (DML) - a clean, declarative way
 * to define database models without TypeORM decorators.
 *
 * Key differences from v1:
 * - No @Entity(), @Column() decorators
 * - Use model.define() instead
 * - Cleaner, more readable syntax
 * - Auto-generates migrations
 */

import { model } from "@medusajs/utils"

/**
 * Seller Model
 *
 * Represents a vendor/seller in the marketplace.
 * Linked to Medusa's customer entity (a customer can become a seller).
 */
const Seller = model.define("seller", {
  // Primary key (auto-generated UUID)
  id: model.id().primaryKey(),

  // Link to Medusa's customer table
  // In Medusa v2, we'll use Module Links instead of direct foreign keys
  customer_id: model.text(),

  // Business Information
  business_name: model.text(),
  business_email: model.text(),
  business_phone: model.text().nullable(),

  // Business Address (stored as JSON for flexibility)
  business_address: model.json().nullable(),

  // Tax Information
  tax_id: model.text().nullable(), // VAT/EIN/etc

  // Verification Status
  verification_status: model.enum(["pending", "verified", "rejected", "suspended"]).default("pending"),
  verified_at: model.dateTime().nullable(),
  verification_notes: model.text().nullable(),

  // Bank/Payout Information (encrypted in production)
  payout_method: model.enum(["bank_transfer", "paypal", "stripe"]).nullable(),

  // Bank details (stored as JSON for flexibility)
  bank_details: model.json().nullable(),

  // PayPal email
  paypal_email: model.text().nullable(),

  // Stripe Connect account ID
  stripe_account_id: model.text().nullable(),

  // Commission Settings
  // If null, uses platform default rate
  commission_rate: model.bigNumber().nullable(), // Percentage (e.g., 10.00)

  // Status
  is_active: model.boolean().default(true),

  // Financial Tracking (calculated fields, updated by workflows)
  total_sales: model.bigNumber().default(0), // Lifetime sales
  total_commission: model.bigNumber().default(0), // Platform commission earned
  pending_payout: model.bigNumber().default(0), // Amount ready for payout

  // Metadata (for custom fields, extensibility)
  metadata: model.json().nullable(),

  // Timestamps (created_at, updated_at, deleted_at) are auto-added by Medusa v2.12+
})

export default Seller

/**
 * EXPLANATION OF FIELDS:
 *
 * customer_id: Links to Medusa's customer table
 *   - A customer can register as a seller
 *   - Allows single login for both buying and selling
 *
 * verification_status:
 *   - pending: Just registered, awaiting admin approval
 *   - verified: Approved, can list products
 *   - rejected: Application denied
 *   - suspended: Temporarily disabled
 *
 * commission_rate:
 *   - If set, overrides platform default
 *   - Stored as percentage (10.00 = 10%)
 *   - Allows per-seller custom rates
 *
 * payout_method:
 *   - bank_transfer: Direct bank deposit
 *   - paypal: PayPal transfer
 *   - stripe: Stripe Connect payout
 *
 * Financial fields:
 *   - total_sales: All-time sales volume
 *   - total_commission: Platform's commission (not seller earnings!)
 *   - pending_payout: Amount seller can request payout for
 *
 * Soft delete (deleted_at):
 *   - Allows "deleting" sellers without losing data
 *   - Historical orders still reference deleted sellers
 */
