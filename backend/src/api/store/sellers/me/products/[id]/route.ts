import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"
import { deleteFilesWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { deleteSellerProductWorkflow } from "@/workflows/delete-seller-product"
import type { UpdateProductInput } from "@/api/middlewares"
import SellerProductLink from "@/links/seller-product"

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

  // Check ownership via the link's entryPoint — the proper Medusa way to query
  // the pivot table directly without relying on isList:true or raw SQL.
  const { data: pivotRows } = await query.graph({
    entity: SellerProductLink.entryPoint,
    fields: ["product_id"],
    filters: {
      product_id: id,
      seller_id: seller.id,
    },
  })

  if (!pivotRows.length) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found or access denied")
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "*",
      "variants.*",
      "variants.prices.*",
      "variants.price_set.prices.*",
      "variants.options.*",
      "variants.options.option.*",
      "options.*",
      "options.values.*",
      "images.*",
      "categories.*",
    ],
    filters: { id },
  })

  const product = products?.[0]

  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found or access denied")
  }

  res.status(200).json({ product: remapVariantPrices(product) })
}

/**
 * POST /store/sellers/me/products/:id
 * Update a product owned by the authenticated seller (via workflow).
 * Note: Medusa v2 uses POST for updates (PUT/PATCH are not standard).
 */
export async function POST(req: AuthenticatedMedusaRequest<UpdateProductInput>, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)
  const productService = req.scope.resolve(Modules.PRODUCT)

  const customerId = req.auth_context.actor_id
  const seller = await sellerService.getSellerByCustomerId(customerId)

  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Seller profile not found")
  }

  // Check ownership via the link's entryPoint — the proper Medusa way to query
  // the pivot table directly without relying on isList:true or raw SQL.
  const { data: pivotRows } = await query.graph({
    entity: SellerProductLink.entryPoint,
    fields: ["product_id"],
    filters: {
      product_id: id,
      seller_id: seller.id,
    },
  })

  if (!pivotRows.length) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found or access denied")
  }

  const product = await productService.retrieveProduct(id, {
    relations: ["options", "variants.options"],
  })

  const data = { ...req.validatedBody } as any
  const pendingDeleteFileIds: string[] = Array.isArray(data.pending_delete_file_ids)
    ? Array.from(
        new Set<string>(
          data.pending_delete_file_ids.filter(
            (fileId: unknown): fileId is string => typeof fileId === "string" && fileId.length > 0
          )
        )
      )
    : []

  delete data.pending_delete_file_ids

  if (Array.isArray(data.category_ids)) {
    data.categories = data.category_ids.map((categoryId: string) => ({ id: categoryId }))
    delete data.category_ids
  }

  const optionTitleById = new Map((product.options || []).map((opt: any) => [opt.id, opt.title]))

  const normalizeVariantSku = (variant: any) => {
    const next = { ...variant }

    if (typeof next.inventory_quantity === "number") {
      next.metadata = {
        ...(next.metadata || {}),
        inventory_quantity: next.inventory_quantity,
      }
      delete next.inventory_quantity
    }

    if (typeof next.sku === "string") {
      const trimmedSku = next.sku.trim()
      if (trimmedSku) {
        next.sku = trimmedSku
      } else {
        delete next.sku
      }
    }

    return next
  }

  if (data.variants && Array.isArray(data.variants)) {
    data.variants = data.variants.map((v: any) => {
      if (Array.isArray(v.options)) {
        const optionsMap = v.options.reduce((acc: Record<string, string>, o: any) => {
          const title =
            typeof o?.title === "string"
              ? o.title
              : typeof o?.option?.title === "string"
                ? o.option.title
                : typeof o?.option_id === "string"
                  ? optionTitleById.get(o.option_id)
                  : undefined

          const rawValue =
            typeof o?.value === "string"
              ? o.value
              : o?.value?.value != null
                ? String(o.value.value)
                : undefined

          if (title && rawValue != null) {
            acc[title] = String(rawValue)
          }

          return acc
        }, {})

        return {
          ...normalizeVariantSku(v),
          options: optionsMap,
        }
      }

      return normalizeVariantSku(v)
    })
  }

  const { result } = await updateProductsWorkflow(req.scope).run({
    input: {
      selector: { id },
      update: data,
    },
  })

  if (pendingDeleteFileIds.length) {
    await deleteFilesWorkflow(req.scope).run({
      input: { ids: pendingDeleteFileIds },
    })
  }

  res.status(200).json({ product: result[0] })
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
