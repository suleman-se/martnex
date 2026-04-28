import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
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
    const updated = await productService.updateProducts(
      { id: product_id },
      product_data as any
    )
    const product = Array.isArray(updated) ? updated[0] : updated

    return new StepResponse({ product })
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
