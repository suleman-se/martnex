/**
 * Commission Service (Medusa v2)
 *
 * Handles commission calculations and tracking.
 * Called by order workflows to create commission records.
 */

import { MedusaService } from "@medusajs/utils"
import Commission from "./models/commission"

class CommissionModuleService extends MedusaService({
  Commission,
}) {
  /**
   * Calculate commission for an order line item
   *
   * This is the core business logic for commission calculation.
   * Called by order workflows when an order is placed.
   *
   * @param lineItem - Order line item data
   * @param sellerId - Seller who owns the product
   * @param commissionRate - Rate to apply (from seller/category/global)
   * @returns Commission record
   */
  async calculateCommission(data: {
    orderId: string
    lineItemId: string
    sellerId: string
    productId?: string
    productTitle?: string
    variantId?: string
    lineItemTotal: number
    quantity: number
    commissionRate: number
    currencyCode?: string
  }) {
    // Calculate amounts
    const commissionAmount = (data.lineItemTotal * data.commissionRate) / 100
    const sellerPayout = data.lineItemTotal - commissionAmount

    // Create commission record
    return await this.createCommissions({
      order_id: data.orderId,
      line_item_id: data.lineItemId,
      seller_id: data.sellerId,
      product_id: data.productId,
      product_title: data.productTitle,
      variant_id: data.variantId,
      line_item_total: data.lineItemTotal,
      quantity: data.quantity,
      commission_rate: data.commissionRate,
      commission_amount: commissionAmount,
      seller_payout: sellerPayout,
      currency_code: data.currencyCode || "usd",
      status: "pending",
    })
  }

  /**
   * Get commissions for a specific seller
   *
   * Used in seller dashboard to show earnings.
   */
  async getSellerCommissions(
    sellerId: string,
    filters?: {
      status?: string
      fromDate?: Date
      toDate?: Date
    }
  ) {
    const queryFilters: any = {
      seller_id: sellerId,
    }

    if (filters?.status) {
      queryFilters.status = filters.status
    }

    if (filters?.fromDate) {
      queryFilters.created_at = { $gte: filters.fromDate }
    }

    if (filters?.toDate) {
      queryFilters.created_at = {
        ...queryFilters.created_at,
        $lte: filters.toDate,
      }
    }

    return await this.listCommissions({ filters: queryFilters })
  }

  /**
   * Get commissions for a specific order
   *
   * Shows commission breakdown for an order.
   */
  async getOrderCommissions(orderId: string) {
    return await this.listCommissions({
      filters: { order_id: orderId },
    })
  }

  /**
   * Approve commission (mark as ready for payout)
   *
   * Called when order is completed/delivered.
   */
  async approveCommission(commissionId: string) {
    return await this.updateCommissions({
      id: commissionId,
      status: "approved",
      approved_at: new Date(),
    })
  }

  /**
   * Mark commission as paid
   *
   * Called when seller receives payout.
   */
  async markAsPaid(commissionId: string) {
    return await this.updateCommissions({
      id: commissionId,
      status: "paid",
      paid_at: new Date(),
    })
  }

  /**
   * Dispute commission
   *
   * Called when customer files dispute.
   */
  async disputeCommission(commissionId: string, notes?: string) {
    return await this.updateCommissions({
      id: commissionId,
      status: "disputed",
      disputed_at: new Date(),
      notes: notes || "Commission disputed",
    })
  }

  /**
   * Cancel commission
   *
   * Called when order is cancelled/refunded.
   */
  async cancelCommission(commissionId: string, reason?: string) {
    return await this.updateCommissions({
      id: commissionId,
      status: "cancelled",
      cancelled_at: new Date(),
      notes: reason || "Order cancelled",
    })
  }

  /**
   * Get seller earnings summary
   *
   * Calculates total earnings for a seller.
   */
  async getSellerEarningsSummary(sellerId: string) {
    const allCommissions = await this.getSellerCommissions(sellerId)

    const summary = allCommissions.reduce(
      (acc, commission) => {
        acc.totalSales += commission.line_item_total || 0
        acc.totalCommission += commission.commission_amount || 0
        acc.totalPayout += commission.seller_payout || 0

        if (commission.status === "pending") {
          acc.pendingAmount += commission.seller_payout || 0
        }
        if (commission.status === "approved") {
          acc.approvedAmount += commission.seller_payout || 0
        }
        if (commission.status === "paid") {
          acc.paidAmount += commission.seller_payout || 0
        }

        return acc
      },
      {
        totalSales: 0,
        totalCommission: 0,
        totalPayout: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        paidAmount: 0,
      }
    )

    return {
      seller_id: sellerId,
      ...summary,
      available_for_payout: summary.approvedAmount, // Ready to be paid out
    }
  }

  /**
   * Get platform earnings summary
   *
   * Total commission platform has earned.
   */
  async getPlatformEarningsSummary() {
    const allCommissions = await this.listCommissions()

    const summary = allCommissions.reduce(
      (acc, commission) => {
        acc.totalCommission += commission.commission_amount || 0

        if (commission.status === "paid") {
          acc.paidCommission += commission.commission_amount || 0
        }
        if (commission.status === "pending" || commission.status === "approved") {
          acc.pendingCommission += commission.commission_amount || 0
        }

        return acc
      },
      {
        totalCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
      }
    )

    return summary
  }

  /**
   * Bulk approve commissions for an order
   *
   * When order is completed, approve all commissions.
   */
  async approveOrderCommissions(orderId: string) {
    const commissions = await this.getOrderCommissions(orderId)

    const updates = commissions.map((commission) =>
      this.approveCommission(commission.id)
    )

    return await Promise.all(updates)
  }

  /**
   * Bulk cancel commissions for an order
   *
   * When order is cancelled, cancel all commissions.
   */
  async cancelOrderCommissions(orderId: string, reason?: string) {
    const commissions = await this.getOrderCommissions(orderId)

    const updates = commissions.map((commission) =>
      this.cancelCommission(commission.id, reason)
    )

    return await Promise.all(updates)
  }
}

export default CommissionModuleService

/**
 * USAGE EXAMPLES:
 * ===============
 *
 * In Order Workflow:
 * ------------------
 * const commissionService = container.resolve("commissionModuleService")
 *
 * // Calculate commission when order placed
 * await commissionService.calculateCommission({
 *   orderId: "order_123",
 *   lineItemId: "item_456",
 *   sellerId: "seller_789",
 *   lineItemTotal: 100.00,
 *   quantity: 1,
 *   commissionRate: 10.00
 * })
 *
 * In Seller Dashboard:
 * --------------------
 * const earnings = await commissionService.getSellerEarningsSummary("seller_789")
 * // Returns:
 * // {
 * //   totalSales: 1000,
 * //   totalCommission: 100,
 * //   totalPayout: 900,
 * //   pendingAmount: 200,
 * //   approvedAmount: 300,
 * //   paidAmount: 400,
 * //   available_for_payout: 300
 * // }
 */
