import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { dismissRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { MedusaError, Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"

const SELLER_MODULE = "seller"

// ─── Step 1: Resolve seller_id from customer_id ────────────────────────────

type GetSellerIdInput = { customer_id: string }

export const getSellerIdStep = createStep(
  "get-seller-id-for-delete",
  async ({ customer_id }: GetSellerIdInput, { container }) => {
    const sellerService = container.resolve<SellerModuleService>(SELLER_MODULE)
    const seller = await sellerService.getSellerByCustomerId(customer_id)

    if (!seller) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Seller profile not found"
      )
    }

    return new StepResponse({ seller_id: seller.id })
  }
)

// ─── Step 2: Verify ownership then delete product ──────────────────────────

type DeleteProductInput = {
  seller_id: string
  product_id: string
}

export const deleteSellerProductStep = createStep(
  "delete-seller-product",
  async ({ seller_id, product_id }: DeleteProductInput, { container }) => {
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
    await productService.deleteProducts([product_id])

    return new StepResponse({ id: product_id, deleted: true })
  }
)

// ─── Workflow ───────────────────────────────────────────────────────────────

type WorkflowInput = {
  customer_id: string
  product_id: string
}

export const deleteSellerProductWorkflow = createWorkflow(
  "delete-seller-product",
  function (input: WorkflowInput) {
    const { seller_id } = getSellerIdStep({ customer_id: input.customer_id })

    // Dismiss the link before deleting the product
    // Order MUST match defineLink: product FIRST, seller SECOND
    const linkData = transform({ seller_id, input }, ({ seller_id, input }) => [
      {
        [Modules.PRODUCT]: { product_id: input.product_id },
        [SELLER_MODULE]: { seller_id },
      },
    ])
    dismissRemoteLinkStep(linkData)

    const result = deleteSellerProductStep({
      seller_id,
      product_id: input.product_id,
    })

    return new WorkflowResponse(result)
  }
)
