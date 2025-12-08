/**
 * Admin Seller Suspension Routes
 * 
 * POST /admin/sellers/:id/suspend - suspend a seller
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SELLER_MODULE } from "../../../../modules/seller"

/**
 * POST /admin/sellers/:id/suspend
 * Suspend a seller (temporary ban)
 * 
 * Body:
 * {
 *   reason: string (required - why was seller suspended)
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { reason } = req.body
  const sellerService = req.scope.resolve(SELLER_MODULE)

  try {
    if (!reason) {
      return res.status(400).json({
        error: "Suspension reason is required",
      })
    }

    const seller = await sellerService.suspendSeller(id, reason)

    res.status(200).json({
      message: "Seller suspended",
      seller,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to suspend seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
