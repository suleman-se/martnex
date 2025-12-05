/**
 * Seller Details API Routes
 * 
 * Endpoints for seller profile:
 * - GET /store/sellers/:id - get seller profile
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SELLER_MODULE } from "../../../../modules/seller"

/**
 * GET /store/sellers/:id
 * Get seller profile (public endpoint, returns limited info)
 * 
 * Returns:
 * - business_name
 * - business_email
 * - verification_status
 * - verified_at
 * - created_at
 * (Does NOT return: bank_details, payout info, sensitive data)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const sellerService = req.scope.resolve(SELLER_MODULE)

  try {
    const seller = await sellerService.retrieveSeller(id)

    if (!seller) {
      return res.status(404).json({
        error: "Seller not found",
      })
    }

    // Return only public information
    res.status(200).json({
      seller: {
        id: seller.id,
        business_name: seller.business_name,
        business_email: seller.business_email,
        verification_status: seller.verification_status,
        verified_at: seller.verified_at,
        created_at: seller.created_at,
      },
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
