import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"
import { createSellerProductWorkflow } from "@/workflows/create-seller-product"
import type { CreateProductInput } from "@/api/middlewares"

const SELLER_MODULE = "seller"

function remapVariantPrices<T extends { variants?: any[] }>(product: T, realQuantities?: Record<string, number>): T {
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

      const liveQuantity = realQuantities?.[variant.id]

      const normalizedInventoryQuantity =
        typeof liveQuantity === "number"
          ? liveQuantity
          : typeof variant?.inventory_quantity === "number"
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

async function getRealInventoryForVariants(variants: any[], scope: any): Promise<Record<string, number>> {
  if (!variants || !variants.length) return {}

  const inventoryItemIds: string[] = []
  const variantToItemMap = new Map<string, string>()

  for (const variant of variants) {
    const linkedItems = Array.isArray(variant.inventory_items) ? variant.inventory_items : []
    const itemId = linkedItems[0]?.inventory_item_id
    if (itemId) {
      inventoryItemIds.push(itemId)
      variantToItemMap.set(variant.id, itemId)
    }
  }

  if (!inventoryItemIds.length) return {}

  try {
    const inventoryService = scope.resolve(Modules.INVENTORY)
    const levels = await inventoryService.listInventoryLevels({
      inventory_item_id: inventoryItemIds,
    })

    const itemQuantityMap = new Map<string, number>()
    for (const level of levels) {
      const available = (level.stocked_quantity || 0) - (level.reserved_quantity || 0)
      const current = itemQuantityMap.get(level.inventory_item_id) || 0
      itemQuantityMap.set(level.inventory_item_id, current + Math.max(0, available))
    }

    const variantQuantityMap: Record<string, number> = {}
    for (const variant of variants) {
      const itemId = variantToItemMap.get(variant.id)
      if (itemId && itemQuantityMap.has(itemId)) {
        variantQuantityMap[variant.id] = itemQuantityMap.get(itemId)!
      }
    }

    return variantQuantityMap
  } catch (e) {
    console.error("⚠️ Failed to query real-time inventory from Inventory service:", e)
    return {}
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
      "product.variants.inventory_items.inventory_item_id",
      "product.options.*",
      "product.options.values.*",
      "product.images.*",
      "product.categories.*",
    ],
    filters: { id: seller.id },
  })

  const rawProduct = sellers[0]?.product
  // Filter out nulls — can occur when pivot rows reference deleted products
  const products = (Array.isArray(rawProduct) ? rawProduct : rawProduct ? [rawProduct] : [])
    .filter(Boolean)

  const allVariants = products.flatMap((p: any) => p.variants || [])
  const realQuantities = await getRealInventoryForVariants(allVariants, req.scope)

  const remappedProducts = products.map((product: any) => remapVariantPrices(product, realQuantities))
  res.status(200).json({ products: remappedProducts })
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
