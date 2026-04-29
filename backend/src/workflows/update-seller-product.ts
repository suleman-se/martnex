import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const SELLER_MODULE = "seller"

// ─── Step: Verify ownership then update product ────────────────────────────

type UpdateProductInput = {
  seller_id: string
  product_id: string
  product_data: Record<string, unknown>
}

export const updateSellerProductStep = createStep(
  "update-seller-product",
  async ({ seller_id, product_id, product_data }: UpdateProductInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Verify seller owns this product
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields: ["product.id"],
      filters: { id: seller_id },
    })

    const rawProduct = sellers[0]?.product
    const ownedProducts = Array.isArray(rawProduct) ? rawProduct : rawProduct ? [rawProduct] : []
    const owns = ownedProducts.some((p: any) => p.id === product_id)

    if (!owns) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Product not found or access denied"
      )
    }

    const productService = container.resolve(Modules.PRODUCT)
    const product = await productService.retrieveProduct(product_id, {
      relations: ["options", "variants.options"],
    })

    // Medusa update validation expects variant options as an object map:
    // { Color: "red", Size: "m" }
    // The seller UI sends an array shape: [{ title: "Color", value: "red" }, ...]
    // Normalize here to keep the API contract stable for the frontend.
    const data = { ...product_data } as any
    const optionTitleById = new Map(
      (product.options || []).map((opt: any) => [opt.id, opt.title])
    )
    const normalizeVariantSku = (variant: any) => {
      const next = { ...variant }

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

    const { result: updatedProducts } = await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product_id },
        update: data,
      },
    })

    const result = updatedProducts[0]

    return new StepResponse({ product: result })
  }
)

// ─── Workflow ───────────────────────────────────────────────────────────────

type WorkflowInput = {
  seller_id: string
  product_id: string
  product_data: Record<string, unknown>
}

export const updateSellerProductWorkflow = createWorkflow(
  "update-seller-product",
  function (input: WorkflowInput) {
    const result = updateSellerProductStep(input)
    return new WorkflowResponse(result)
  }
)
