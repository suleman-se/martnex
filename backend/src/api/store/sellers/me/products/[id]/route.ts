import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"
import { updateSellerProductWorkflow } from "@/workflows/update-seller-product"
import { deleteSellerProductWorkflow } from "@/workflows/delete-seller-product"
import type { UpdateProductInput } from "@/api/middlewares"

const SELLER_MODULE = "seller"

/**
 * GET /store/sellers/me/products/:id
 * Retrieve a single product owned by the authenticated seller.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)

  const customerId = req.auth_context.actor_id
  const seller = await sellerService.getSellerByCustomerId(customerId)

  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Seller profile not found")
  }

  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: [
      "product.*",
      "product.variants.*",
      "product.variants.prices.*",
      "product.options.*",
      "product.options.values.*",
      "product.images.*",
      "product.categories.*",
    ],
    filters: { id: seller.id },
  })

  const rawProduct = sellers[0]?.product
  const allProducts = Array.isArray(rawProduct) ? rawProduct : rawProduct ? [rawProduct] : []
  const product = allProducts.find((p: any) => p.id === id)

  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found or access denied")
  }

  res.status(200).json({ product })
}

/**
 * POST /store/sellers/me/products/:id
 * Update a product owned by the authenticated seller (via workflow).
 * Note: Medusa v2 uses POST for updates (PUT/PATCH are not standard).
 */
export async function POST(req: AuthenticatedMedusaRequest<UpdateProductInput>, res: MedusaResponse) {
  const { id } = req.params
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)

  const customerId = req.auth_context.actor_id
  const seller = await sellerService.getSellerByCustomerId(customerId)

  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Seller profile not found")
  }

  const { result } = await updateSellerProductWorkflow(req.scope).run({
    input: {
      seller_id: seller.id,
      product_id: id,
      product_data: req.validatedBody,
    },
  })

  res.status(200).json(result)
}

/**
 * DELETE /store/sellers/me/products/:id
 * Delete a product owned by the authenticated seller (via workflow).
 */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const customerId = req.auth_context.actor_id

  const { result } = await deleteSellerProductWorkflow(req.scope).run({
    input: {
      customer_id: customerId,
      product_id: id,
    },
  })

  res.status(200).json(result)
}
