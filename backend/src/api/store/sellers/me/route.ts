import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type SellerModuleService from "@modules/seller/service"

const SELLER_MODULE = "seller"

/**
 * GET /store/sellers/me
 * Retrieve the current authenticated user's seller profile.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)
  
  // customerId is guaranteed by the authenticate middleware
  const customerId = req.auth_context.actor_id

  try {
    const seller = await sellerService.getSellerByCustomerId(customerId)

    if (!seller) {
      return res.status(404).json({
        error: "Not Found",
        message: "Seller profile not found for this customer",
      })
    }

    res.status(200).json({ seller })
  } catch (error) {
    console.error("Seller GET Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
