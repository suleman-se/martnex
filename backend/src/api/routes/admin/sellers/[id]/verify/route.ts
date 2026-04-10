/**
 * Admin Seller Verification Routes
 * 
 * Protected endpoints for seller verification workflow:
 * - POST /admin/sellers/:id/verify - approve seller
 * - POST /admin/sellers/:id/reject - reject seller
 * - POST /admin/sellers/:id/suspend - suspend seller
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SELLER_MODULE } from "../../../../../../modules/seller"
import type SellerModuleService from "../../../../../../modules/seller/service"

/**
 * POST /admin/sellers/:id/verify
 * Approve/verify a seller
 * 
 * Body:
 * {
 *   notes?: string
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { notes } = req.body as { notes?: string }
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)

  try {
    const seller = await sellerService.approveSeller(id, notes)

    res.status(200).json({
      message: "Seller verified successfully",
      seller,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to verify seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
