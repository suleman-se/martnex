import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules, MedusaError } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"

const SELLER_MODULE = "seller"

// ─── Step 1: Resolve seller from customer_id ───────────────────────────────

type GetSellerInput = { customer_id: string }

export const getSellerByCustomerIdStep = createStep(
  "get-seller-by-customer-id",
  async ({ customer_id }: GetSellerInput, { container }) => {
    const sellerService = container.resolve<SellerModuleService>(SELLER_MODULE)
    const seller = await sellerService.getSellerByCustomerId(customer_id)

    if (!seller) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Seller profile not found for this customer"
      )
    }

    return new StepResponse(seller)
  }
)

// ─── Step 2: Create the product ────────────────────────────────────────────

export const createProductStep = createStep(
  "create-seller-product",
  async (input: Record<string, unknown>, { container }) => {
    const productService = container.resolve(Modules.PRODUCT)
    const [product] = await productService.createProducts([input as any])
    return new StepResponse(product, product.id)
  },
  async (productId: string, { container }) => {
    // Compensation: delete the product if linking fails
    const productService = container.resolve(Modules.PRODUCT)
    await productService.deleteProducts([productId])
  }
)

// ─── Workflow ───────────────────────────────────────────────────────────────

type WorkflowInput = {
  customer_id: string
  product_data: Record<string, unknown>
}

export const createSellerProductWorkflow = createWorkflow(
  "create-seller-product",
  function (input: WorkflowInput) {
    const seller = getSellerByCustomerIdStep({ customer_id: input.customer_id })
    const product = createProductStep(input.product_data)

    // Link order MUST match defineLink in src/links/seller-product.ts
    // defineLink(ProductModule.linkable.product, SellerModule.linkable.seller)
    // → product FIRST, seller SECOND
    const linkData = transform({ product, seller }, ({ product, seller }) => [
      {
        [Modules.PRODUCT]: { product_id: product.id },
        [SELLER_MODULE]: { seller_id: seller.id },
      },
    ])

    createRemoteLinkStep(linkData)

    return new WorkflowResponse({ product })
  }
)
