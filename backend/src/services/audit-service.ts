/**
 * Audit Logging Service
 * 
 * Centralized service for logging all important system events
 * Provides compliance and debugging trails
 */

import type AuditLog from "../models/audit-log"

/**
 * Audit event data structure
 */
interface AuditEventData {
  userId?: string // Admin/staff ID
  sellerId?: string
  customerId?: string
  entityType: "seller" | "commission" | "payout" | "order" | "product"
  entityId: string
  action:
    | "created"
    | "updated"
    | "verified"
    | "rejected"
    | "suspended"
    | "approved"
    | "cancelled"
    | "paid"
    | "failed"
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  description?: string
  ipAddress?: string
  userAgent?: string
  status?: "success" | "failure"
  errorMessage?: string
}

/**
 * AuditService
 * 
 * Logs all important events for audit trails
 * Static methods for easy access throughout the app
 */
export class AuditService {
  private static auditLogService: any // Will be injected

  static setService(service: any) {
    this.auditLogService = service
  }

  /**
   * Log an event
   */
  static async log(data: AuditEventData) {
    if (!this.auditLogService) {
      console.warn(
        "AuditService not initialized. Event not logged:",
        data.action
      )
      return null
    }

    try {
      const auditLog = await this.auditLogService.createAuditLogs({
        user_id: data.userId,
        seller_id: data.sellerId,
        customer_id: data.customerId,
        entity_type: data.entityType,
        entity_id: data.entityId,
        action: data.action,
        old_values: data.oldValues,
        new_values: data.newValues,
        description: data.description,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        status: data.status || "success",
        error_message: data.errorMessage,
      })

      console.log(
        `📝 Audit logged: ${data.entityType}/${data.entityId} - ${data.action}`
      )
      return auditLog
    } catch (error) {
      console.error("Failed to log audit event:", error)
      // Don't throw - audit logging failure shouldn't break the app
      return null
    }
  }

  /**
   * Log seller verification
   */
  static async logSellerVerified(
    sellerId: string,
    adminId: string,
    notes?: string
  ) {
    return this.log({
      userId: adminId,
      entityType: "seller",
      entityId: sellerId,
      action: "verified",
      newValues: { status: "verified", notes },
      description: `Seller verified. Notes: ${notes || "None"}`,
    })
  }

  /**
   * Log seller rejection
   */
  static async logSellerRejected(
    sellerId: string,
    adminId: string,
    reason: string
  ) {
    return this.log({
      userId: adminId,
      entityType: "seller",
      entityId: sellerId,
      action: "rejected",
      newValues: { status: "rejected", reason },
      description: `Seller rejected. Reason: ${reason}`,
    })
  }

  /**
   * Log seller suspension
   */
  static async logSellerSuspended(
    sellerId: string,
    adminId: string,
    reason: string
  ) {
    return this.log({
      userId: adminId,
      entityType: "seller",
      entityId: sellerId,
      action: "suspended",
      newValues: { status: "suspended", reason },
      description: `Seller suspended. Reason: ${reason}`,
    })
  }

  /**
   * Log commission creation
   */
  static async logCommissionCreated(
    commissionId: string,
    orderId: string,
    sellerId: string,
    amount: number
  ) {
    return this.log({
      sellerId,
      entityType: "commission",
      entityId: commissionId,
      action: "created",
      newValues: { order_id: orderId, seller_id: sellerId, amount },
      description: `Commission created for order ${orderId}. Amount: $${amount}`,
    })
  }

  /**
   * Log commission status change
   */
  static async logCommissionStatusChanged(
    commissionId: string,
    oldStatus: string,
    newStatus: string,
    adminId?: string
  ) {
    return this.log({
      userId: adminId,
      entityType: "commission",
      entityId: commissionId,
      action: newStatus === "paid" ? "paid" : "updated",
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      description: `Commission status changed from ${oldStatus} to ${newStatus}`,
    })
  }

  /**
   * Log payout approval
   */
  static async logPayoutApproved(
    payoutId: string,
    sellerId: string,
    adminId: string,
    amount: number,
    notes?: string
  ) {
    return this.log({
      userId: adminId,
      sellerId,
      entityType: "payout",
      entityId: payoutId,
      action: "approved",
      newValues: { status: "approved", amount, notes },
      description: `Payout approved. Amount: $${amount}. Notes: ${notes || "None"}`,
    })
  }

  /**
   * Log payout cancellation
   */
  static async logPayoutCancelled(
    payoutId: string,
    sellerId: string,
    adminId: string,
    reason: string
  ) {
    return this.log({
      userId: adminId,
      sellerId,
      entityType: "payout",
      entityId: payoutId,
      action: "cancelled",
      newValues: { status: "cancelled", reason },
      description: `Payout cancelled. Reason: ${reason}`,
    })
  }

  /**
   * Log payout completion
   */
  static async logPayoutCompleted(
    payoutId: string,
    sellerId: string,
    amount: number,
    paymentMethod: string,
    paymentReference: string
  ) {
    return this.log({
      sellerId,
      entityType: "payout",
      entityId: payoutId,
      action: "paid",
      newValues: {
        status: "completed",
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        amount,
      },
      description: `Payout completed. Amount: $${amount}. Method: ${paymentMethod}. Ref: ${paymentReference}`,
    })
  }

  /**
   * Log failed action (for error tracking)
   */
  static async logFailure(
    entityType: "seller" | "commission" | "payout",
    entityId: string,
    action: string,
    error: Error
  ) {
    return this.log({
      entityType,
      entityId,
      action: action as any,
      status: "failure",
      errorMessage: error.message,
      description: `Failed to ${action} ${entityType}. Error: ${error.message}`,
    })
  }
}

export default AuditService
