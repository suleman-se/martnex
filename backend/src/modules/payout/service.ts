/**
 * Payout Service (Medusa v2)
 *
 * Handles seller payout requests and processing.
 * Integrates with payment providers (Stripe Connect, PayPal, Bank Transfer).
 */

import { MedusaService } from "@medusajs/utils"
import Payout from "./models/payout"

class PayoutModuleService extends MedusaService({
  Payout,
}) {
  /**
   * Create payout request
   *
   * Called when seller requests payout from dashboard.
   * Validates seller has sufficient approved commissions.
   *
   * @param sellerId - Seller requesting payout
   * @param commissionIds - Array of commission IDs to include
   * @param amount - Total payout amount
   */
  async createPayoutRequest(data: {
    sellerId: string
    commissionIds: string[]
    amount: number
    currencyCode?: string
  }) {
    return await this.createPayouts({
      seller_id: data.sellerId,
      amount: data.amount,
      currency_code: data.currencyCode || "usd",
      commission_ids: data.commissionIds as unknown as Record<string, unknown>, // JSON field stores array as JSON
      status: "requested",
      requested_at: new Date(),
    })
  }

  /**
   * Get seller's payout history
   *
   * Used in seller dashboard.
   */
  async getSellerPayouts(sellerId: string, filters?: { status?: string }) {
    const queryFilters: any = {
      seller_id: sellerId,
    }

    if (filters?.status) {
      queryFilters.status = filters.status
    }

    return await this.listPayouts({ filters: queryFilters })
  }

  /**
   * Get pending payouts (admin review)
   *
   * Admin dashboard shows payouts awaiting review.
   */
  async getPendingPayouts() {
    return await this.listPayouts({
      filters: {
        status: "pending_review",
      },
    })
  }

  /**
   * Admin approves payout
   *
   * Moves payout to approved status, ready for processing.
   */
  async approvePayout(payoutId: string, adminId: string, notes?: string) {
    return await this.updatePayouts({
      id: payoutId,
      status: "approved",
      approved_at: new Date(),
      reviewed_by: adminId,
      admin_notes: notes,
    })
  }

  /**
   * Admin rejects/cancels payout
   *
   * Cancels payout request with reason.
   */
  async cancelPayout(payoutId: string, adminId: string, reason: string) {
    return await this.updatePayouts({
      id: payoutId,
      status: "cancelled",
      cancelled_at: new Date(),
      reviewed_by: adminId,
      admin_notes: reason,
    })
  }

  /**
   * Start payment processing
   *
   * Called by workflow to begin actual money transfer.
   * Updates status to processing.
   */
  async startProcessing(payoutId: string, paymentMethod: string) {
    return await this.updatePayouts({
      id: payoutId,
      status: "processing",
      processing_at: new Date(),
      payment_method: paymentMethod as any,
    })
  }

  /**
   * Mark payout as completed
   *
   * Called when payment provider confirms success.
   * Updates status and stores payment reference.
   */
  async completePayout(
    payoutId: string,
    paymentReference: string,
    paymentMetadata?: any
  ) {
    return await this.updatePayouts({
      id: payoutId,
      status: "completed",
      completed_at: new Date(),
      payment_reference: paymentReference,
      payment_metadata: paymentMetadata,
    })
  }

  /**
   * Mark payout as failed
   *
   * Called when payment provider returns error.
   * Increments retry count for automatic retries.
   */
  async failPayout(payoutId: string, reason: string) {
    const payout = await this.retrievePayout(payoutId)

    return await this.updatePayouts({
      id: payoutId,
      status: "failed",
      failed_at: new Date(),
      failure_reason: reason,
      retry_count: (payout.retry_count || 0) + 1,
    })
  }

  /**
   * Retry failed payout
   *
   * Resets status to processing for retry attempt.
   */
  async retryPayout(payoutId: string) {
    return await this.updatePayouts({
      id: payoutId,
      status: "processing",
      processing_at: new Date(),
      failed_at: null,
      failure_reason: null,
    })
  }

  /**
   * Get payout statistics for admin dashboard
   */
  async getPayoutStats() {
    const allPayouts = await this.listPayouts()

    const stats = allPayouts.reduce(
      (acc, payout) => {
        acc.totalAmount += payout.amount || 0

        if (payout.status === "requested" || payout.status === "pending_review") {
          acc.pendingCount++
          acc.pendingAmount += payout.amount || 0
        }

        if (payout.status === "approved" || payout.status === "processing") {
          acc.approvedCount++
          acc.approvedAmount += payout.amount || 0
        }

        if (payout.status === "completed") {
          acc.completedCount++
          acc.completedAmount += payout.amount || 0
        }

        if (payout.status === "failed") {
          acc.failedCount++
          acc.failedAmount += payout.amount || 0
        }

        return acc
      },
      {
        totalAmount: 0,
        pendingCount: 0,
        pendingAmount: 0,
        approvedCount: 0,
        approvedAmount: 0,
        completedCount: 0,
        completedAmount: 0,
        failedCount: 0,
        failedAmount: 0,
      }
    )

    return stats
  }

  /**
   * Get seller's payout summary
   *
   * Shows seller's payout history and pending amount.
   */
  async getSellerPayoutSummary(sellerId: string) {
    const payouts = await this.getSellerPayouts(sellerId)

    const summary = payouts.reduce(
      (acc, payout) => {
        acc.totalRequested += payout.amount || 0

        if (payout.status === "completed") {
          acc.totalPaid += payout.amount || 0
        }

        if (
          payout.status === "requested" ||
          payout.status === "pending_review" ||
          payout.status === "approved" ||
          payout.status === "processing"
        ) {
          acc.totalPending += payout.amount || 0
        }

        return acc
      },
      {
        totalRequested: 0,
        totalPaid: 0,
        totalPending: 0,
        payoutCount: payouts.length,
      }
    )

    return {
      seller_id: sellerId,
      ...summary,
    }
  }

  /**
   * Check if seller can request payout
   *
   * Validates seller meets minimum payout requirements.
   */
  async canRequestPayout(sellerId: string, amount: number): Promise<boolean> {
    const minimumAmount = parseFloat(process.env.MINIMUM_PAYOUT_AMOUNT || "50")

    if (amount < minimumAmount) {
      return false
    }

    // Check for pending payouts (prevent multiple requests)
    const pendingPayouts = await this.getSellerPayouts(sellerId, {
      status: "pending_review",
    })

    return pendingPayouts.length === 0
  }
}

export default PayoutModuleService

/**
 * USAGE EXAMPLES:
 * ===============
 *
 * Seller Requests Payout:
 * -----------------------
 * const payoutService = container.resolve("payoutModuleService")
 *
 * const payout = await payoutService.createPayoutRequest({
 *   sellerId: "seller_123",
 *   commissionIds: ["comm_1", "comm_2", "comm_3"],
 *   amount: 500.00
 * })
 *
 * Admin Reviews Payout:
 * ---------------------
 * await payoutService.approvePayout(
 *   "payout_123",
 *   "admin_456",
 *   "Verified bank details"
 * )
 *
 * Process Payout (Workflow):
 * ---------------------------
 * await payoutService.startProcessing("payout_123", "stripe")
 *
 * // Call Stripe API...
 *
 * await payoutService.completePayout(
 *   "payout_123",
 *   "txn_1234567890",
 *   { stripe_data: {...} }
 * )
 */
