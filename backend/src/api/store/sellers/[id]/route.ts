import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/sellers/:id
 * Get seller profile and products list (public endpoint)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields: [
        "id",
        "business_name",
        "business_email",
        "verification_status",
        "verified_at",
        "created_at",
        "product.*",
        "product.variants.*",
        "product.variants.prices.*",
        "product.variants.price_set.prices.*",
        "product.options.*",
        "product.options.values.*",
        "product.images.*",
        "product.categories.*",
      ],
      filters: { id },
    })

    const seller = sellers?.[0]

    if (!seller) {
      return res.status(404).json({
        error: "Seller not found",
      })
    }

    // Remap products to include variants prices robustly
    const rawProduct = seller.product
    const productsList = (Array.isArray(rawProduct) ? rawProduct : rawProduct ? [rawProduct] : [])
      .filter(Boolean)

    const products = productsList.map((prod: any) => {
      const variants = (prod.variants || []).map((variant: any) => {
        const prices = Array.isArray(variant?.prices) && variant.prices.length
          ? variant.prices
          : Array.isArray(variant?.price_set?.prices)
            ? variant.price_set.prices
            : []
        return {
          ...variant,
          prices,
        }
      })
      return {
        ...prod,
        variants,
      }
    })

    // Return only public information alongside the products list
    res.status(200).json({
      seller: {
        id: seller.id,
        business_name: seller.business_name,
        business_email: seller.business_email,
        verification_status: seller.verification_status,
        verified_at: seller.verified_at,
        created_at: seller.created_at,
      },
      products,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
