/**
 * Payout Data Model (Medusa v2 DML)
 *
 * Tracks seller payout requests and transfers.
 * Sellers request payouts when they have approved commissions.
 *
 * Workflow:
 * 1. Seller requests payout
 * 2. Admin reviews and approves
 * 3. System processes payment (Stripe/PayPal/Bank)
 * 4. Status updated to completed
 */

import { model } from "@medusajs/utils"

/**
 * Payout Model
 *
 * One payout can include multiple commission records.
 * Tracks the full payment lifecycle.
 */
const Payout = model.define("payout", {
  // Primary key
  id: model.id().primaryKey(),

  // Seller reference
  seller_id: model.text(),

  // Financial details
  amount: model.bigNumber(), // Total payout amount
  currency_code: model.text().default("usd"),

  // Commission IDs included in this payout
  // Stored as JSON array for flexibility
  commission_ids: model.json(),

  // Status workflow
  status: model.enum([
    "requested",
    "pending_review",
    "approved",
    "processing",
    "completed",
    "failed",
    "cancelled",
  ]).default("requested"),

  // Payment method used
  payment_method: model.enum(["bank_transfer", "paypal", "stripe"]).nullable(),

  // Payment provider response
  payment_reference: model.text().nullable(), // Transaction ID from provider
  payment_metadata: model.json().nullable(), // Full response data

  // Timestamps for each status
  requested_at: model.dateTime().nullable(),
  reviewed_at: model.dateTime().nullable(),
  approved_at: model.dateTime().nullable(),
  processing_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  failed_at: model.dateTime().nullable(),
  cancelled_at: model.dateTime().nullable(),

  // Admin actions
  reviewed_by: model.text().nullable(), // Admin user ID
  admin_notes: model.text().nullable(),

  // Failure tracking
  failure_reason: model.text().nullable(),
  retry_count: model.number().default(0),

  // Metadata
  metadata: model.json().nullable(),

  // Timestamps (created_at, updated_at, deleted_at) are auto-added by Medusa v2.12+
})

export default Payout

/**
 * FIELD EXPLANATIONS:
 * ===================
 *
 * amount: Total being paid out to seller
 *   Example: $500 from 10 different commissions
 *
 * commission_ids: Array of commission IDs
 *   Example: ["comm_1", "comm_2", "comm_3"]
 *   Allows tracking which commissions were paid
 *
 * Status Flow:
 * ============
 * requested → Seller clicks "Request Payout"
 * pending_review → Waiting for admin review
 * approved → Admin approves payout
 * processing → Payment being sent via provider
 * completed → Money sent successfully
 * failed → Payment failed (provider error)
 * cancelled → Admin cancelled (fraud, etc.)
 *
 * payment_reference: Provider's transaction ID
 *   - Stripe: "txn_1234567890"
 *   - PayPal: "PAY-ABC123"
 *   - Bank: Internal reference number
 *
 * retry_count: Track payment retry attempts
 *   - If payment fails, can retry
 *   - After 3 failures, admin review required
 *
 * Example Payout:
 * ===============
 * Seller has 10 approved commissions totaling $500:
 * 1. Seller requests payout → status: requested
 * 2. Admin reviews → status: pending_review
 * 3. Admin approves → status: approved
 * 4. System processes via Stripe → status: processing
 * 5. Stripe confirms → status: completed
 * 6. All 10 commissions marked as "paid"
 */
