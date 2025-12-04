/**
 * Seller Service (Medusa v2)
 *
 * This service extends MedusaService which auto-generates CRUD methods.
 * We only need to add custom business logic methods.
 *
 * Auto-generated methods (free!):
 * - createSellers(data)
 * - retrieveSeller(id, config?)
 * - updateSellers(id, data, config?)
 * - deleteSellers(id)
 * - listSellers(filters?, config?)
 * - listAndCountSellers(filters?, config?)
 */

import { MedusaService } from "@medusajs/utils"
import Seller from "./models/seller"

/**
 * SellerModuleService
 *
 * Handles all seller-related business logic.
 * Extends MedusaService to get free CRUD methods.
 */
class SellerModuleService extends MedusaService({
  Seller, // Pass the model to get auto-generated methods
}) {
  /**
   * Custom Method: Get sellers by verification status
   *
   * @example
   * // Get all pending sellers
   * const pending = await sellerService.getSellersByStatus('pending')
   */
  async getSellersByStatus(
    status: "pending" | "verified" | "rejected" | "suspended"
  ) {
    return await this.listSellers({
      filters: { verification_status: status },
    })
  }

  /**
   * Custom Method: Get seller by customer ID
   *
   * Useful for checking if a customer is also a seller.
   *
   * @example
   * const seller = await sellerService.getSellerByCustomerId('cus_123')
   * if (seller) {
   *   // Customer is also a seller
   * }
   */
  async getSellerByCustomerId(customerId: string) {
    const sellers = await this.listSellers({
      filters: { customer_id: customerId },
    })

    return sellers[0] || null
  }

  /**
   * Custom Method: Approve seller
   *
   * Changes status from 'pending' to 'verified'.
   * Should emit event for notification workflow.
   */
  async approveSeller(sellerId: string, notes?: string) {
    return await this.updateSellers({
      id: sellerId,
      verification_status: "verified",
      verified_at: new Date(),
      verification_notes: notes || "Approved by admin",
    })
  }

  /**
   * Custom Method: Reject seller
   *
   * Changes status to 'rejected' with reason.
   */
  async rejectSeller(sellerId: string, reason: string) {
    return await this.updateSellers({
      id: sellerId,
      verification_status: "rejected",
      verification_notes: reason,
    })
  }

  /**
   * Custom Method: Suspend seller
   *
   * Temporarily disable seller (can be reactivated).
   */
  async suspendSeller(sellerId: string, reason: string) {
    return await this.updateSellers({
      id: sellerId,
      verification_status: "suspended",
      is_active: false,
      verification_notes: reason,
    })
  }

  /**
   * Custom Method: Reactivate suspended seller
   */
  async reactivateSeller(sellerId: string) {
    return await this.updateSellers({
      id: sellerId,
      verification_status: "verified",
      is_active: true,
    })
  }

  /**
   * Custom Method: Update seller financials
   *
   * Called by order workflows to track sales and commissions.
   * This is an internal method, not exposed via API directly.
   */
  async updateFinancials(
    sellerId: string,
    updates: {
      salesAmount?: number
      commissionAmount?: number
      pendingPayoutAmount?: number
    }
  ) {
    const seller = await this.retrieveSeller(sellerId)

    return await this.updateSellers({
      id: sellerId,
      total_sales: (seller.total_sales || 0) + (updates.salesAmount || 0),
      total_commission:
        (seller.total_commission || 0) + (updates.commissionAmount || 0),
      pending_payout:
        (seller.pending_payout || 0) + (updates.pendingPayoutAmount || 0),
    })
  }

  /**
   * Custom Method: Get seller earnings summary
   *
   * Returns calculated earnings data for seller dashboard.
   */
  async getSellerEarnings(sellerId: string) {
    const seller = await this.retrieveSeller(sellerId)

    const sellerEarnings = (seller.total_sales || 0) - (seller.total_commission || 0)

    return {
      seller_id: sellerId,
      total_sales: seller.total_sales || 0,
      platform_commission: seller.total_commission || 0,
      seller_earnings: sellerEarnings,
      pending_payout: seller.pending_payout || 0,
      available_for_payout: sellerEarnings - (seller.pending_payout || 0),
    }
  }

  /**
   * Custom Method: Check if seller can list products
   *
   * Returns true if seller is verified and active.
   */
  async canListProducts(sellerId: string): Promise<boolean> {
    const seller = await this.retrieveSeller(sellerId)

    return (
      seller.verification_status === "verified" &&
      seller.is_active === true
    )
  }

  /**
   * Custom Method: Get active sellers count
   *
   * For admin dashboard statistics.
   */
  async getActiveSellerCount(): Promise<number> {
    const result = await this.listAndCountSellers({
      filters: {
        verification_status: "verified",
        is_active: true,
      },
    })

    return result[1] // Second element is count
  }
}

export default SellerModuleService

/**
 * EXPLANATION:
 *
 * MedusaService Auto-Generates:
 * =============================
 * - createSellers(data) → Creates new seller(s)
 * - retrieveSeller(id) → Gets seller by ID
 * - updateSellers(id, data) → Updates seller
 * - deleteSellers(id) → Soft deletes seller
 * - listSellers(filters) → Gets filtered list
 * - listAndCountSellers() → Gets list + total count
 *
 * We Only Add Custom Logic:
 * ==========================
 * - approveSeller() → Business rule: verify seller
 * - getSellerEarnings() → Calculate financial summary
 * - canListProducts() → Check seller permissions
 * - etc.
 *
 * Benefits:
 * =========
 * - 80% less boilerplate code
 * - Consistent API across all services
 * - Type-safe queries
 * - Built-in filtering, pagination, relations
 */
