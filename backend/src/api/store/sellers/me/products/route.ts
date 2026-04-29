import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"
import { createSellerProductWorkflow } from "@/workflows/create-seller-product"
import type { CreateProductInput } from "@/api/middlewares"

const SELLER_MODULE = "seller"

function remapVariantPrices<T extends { variants?: any[] }>(product: T): T {
  if (!product?.variants?.length) {
    return product
  }

  return {
    ...product,
    variants: product.variants.map((variant: any) => {
      const normalizedPrices =
        Array.isArray(variant?.prices) && variant.prices.length
          ? variant.prices
          : Array.isArray(variant?.price_set?.prices)
            ? variant.price_set.prices
            : []

      const metadataInventoryQuantity =
        typeof variant?.metadata?.inventory_quantity === "number"
          ? variant.metadata.inventory_quantity
          : typeof variant?.metadata?.inventory_quantity === "string"
            ? Number(variant.metadata.inventory_quantity)
            : undefined

      const normalizedInventoryQuantity =
        typeof variant?.inventory_quantity === "number"
          ? variant.inventory_quantity
          : Number.isFinite(metadataInventoryQuantity)
            ? metadataInventoryQuantity
            : 0

      return {
        ...variant,
        prices: normalizedPrices,
        inventory_quantity: normalizedInventoryQuantity,
      }
    }),
  }
}

/**
 * GET /store/sellers/me/products
 * List authenticated seller's products using the module link.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)

  const customerId = req.auth_context.actor_id

  const seller = await sellerService.getSellerByCustomerId(customerId)

  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Seller profile not found")
  }

  // The link is defineLink(ProductModule.linkable.product, SellerModule.linkable.seller)
  // From the seller side, the linked field is named "product" (singular — matches the
  // linkable property name on ProductModule). Using "products" causes the 500.
  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: [
      "id",
      "product.*",
      "product.variants.*",
      "product.variants.prices.*",
      "product.variants.price_set.prices.*",
      "product.options.*",
      "product.options.values.*",
      "product.images.*",
      "product.categories.*",
    ],
    filters: { id: seller.id },
  })

  const rawProduct = sellers[0]?.product
  const products = (Array.isArray(rawProduct) ? rawProduct : rawProduct ? [rawProduct] : []).map(
    (product: any) => remapVariantPrices(product)
  )
  res.status(200).json({ products })
}

/**
 * POST /store/sellers/me/products
 * Create a new product linked to the authenticated seller (via workflow).
 */
export async function POST(req: AuthenticatedMedusaRequest<CreateProductInput>, res: MedusaResponse) {
  const customerId = req.auth_context.actor_id

  const { result } = await createSellerProductWorkflow(req.scope).run({
    input: {
      customer_id: customerId,
      product_data: req.validatedBody,
    },
  })

  res.status(201).json({ product: result.product })
}
