/**
 * Audit Log Model (Medusa v2 DML)
 * 
 * Tracks all important actions in the system for compliance and debugging:
 * - Seller verification/rejection/suspension
 * - Commission status changes
 * - Payout approvals/cancellations
 * - Admin actions
 * 
 * Used for:
 * - Compliance and audit trails
 * - Debugging issues
 * - Reporting who did what and when
 * - Dispute resolution
 */

import { model } from "@medusajs/utils"

/**
 * AuditLog Model
 * 
 * Immutable record of all important system events
 * Never updated, only created (append-only log)
 */
const AuditLog = model.define("audit_log", {
  // Primary key
  id: model.id().primaryKey(),

  // Who performed the action
  user_id: model.text().nullable(), // Admin/staff who took action
  seller_id: model.text().nullable(), // Seller who triggered action
  customer_id: model.text().nullable(), // Customer who triggered action

  // What entity was affected
  entity_type: model.enum([
    "seller",
    "commission",
    "payout",
    "order",
    "product",
  ]),
  entity_id: model.text(), // ID of affected entity

  // What action was taken
  action: model.enum([
    "created",
    "updated",
    "verified",
    "rejected",
    "suspended",
    "approved",
    "cancelled",
    "paid",
    "failed",
  ]),

  // Details of the change
  old_values: model.json().nullable(), // Previous values (for updates)
  new_values: model.json().nullable(), // New values
  description: model.text().nullable(), // Human-readable summary

  // Context
  ip_address: model.text().nullable(), // For security tracking
  user_agent: model.text().nullable(), // Browser/client info
  status: model.enum(["success", "failure"]).default("success"),
  error_message: model.text().nullable(), // If action failed

  // Timestamps (auto-added)
  created_at: model.dateTime(),
  updated_at: model.dateTime(),
  deleted_at: model.dateTime().nullable(),
})

export default AuditLog
