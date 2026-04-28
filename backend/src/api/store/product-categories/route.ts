import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/product-categories
 * List all product categories (admin-managed global taxonomy).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: categories } = await query.graph({
      entity: "product_category",
      fields: ["id", "name", "description", "handle", "parent_category_id"],
      filters: {
        // You can add filters here, e.g., is_active: true if applicable
      }
    })

    res.status(200).json({ categories })
  } catch (error) {
    console.error("Product Categories List Error:", error)
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
