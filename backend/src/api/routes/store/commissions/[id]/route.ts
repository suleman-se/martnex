/**
 * Commission Details API Routes
 * 
 * GET /store/commissions/:id - get commission details
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMMISSION_MODULE } from "../../../../modules/commission"

/**
 * GET /store/commissions/:id
 * Get commission details (seller can only view their own commissions)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const commissionService = req.scope.resolve(COMMISSION_MODULE)
  const sellerId = req.auth_context?.seller_id

  if (!sellerId) {
    return res.status(401).json({
      error: "Unauthorized. Seller authentication required.",
    })
  }

  try {
    const commission = await commissionService.retrieveCommission(id)

    if (!commission) {
      return res.status(404).json({
        error: "Commission not found",
      })
    }

    // Check authorization - seller can only view their own commissions
    if (commission.seller_id !== sellerId) {
      return res.status(403).json({
        error: "Forbidden. You can only view your own commissions.",
      })
    }

    res.status(200).json({
      commission,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve commission",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
