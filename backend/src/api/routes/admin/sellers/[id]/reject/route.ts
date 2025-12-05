/**
 * Admin Seller Rejection Routes
 * 
 * POST /admin/sellers/:id/reject - reject a seller application
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SELLER_MODULE } from "../../../../modules/seller"

/**
 * POST /admin/sellers/:id/reject
 * Reject a seller application
 * 
 * Body:
 * {
 *   reason: string (required - why was seller rejected)
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { reason } = req.body
  const sellerService = req.scope.resolve(SELLER_MODULE)

  try {
    if (!reason) {
      return res.status(400).json({
        error: "Rejection reason is required",
      })
    }

    const seller = await sellerService.rejectSeller(id, reason)

    res.status(200).json({
      message: "Seller rejected",
      seller,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to reject seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
