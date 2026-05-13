import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow, deleteFilesWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError, ContainerRegistrationKeys, generateEntityId, Modules } from "@medusajs/framework/utils"
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
    const data = { ...input } as any
    delete data.pending_delete_file_ids

    if (Array.isArray(data.category_ids)) {
      data.categories = data.category_ids.map((categoryId: string) => ({ id: categoryId }))
      delete data.category_ids
    }

    if (Array.isArray(data.variants)) {
      data.variants = data.variants.map((variant: any) => {
        const next = { ...variant }

        if (Array.isArray(next.options)) {
          next.options = next.options.reduce((acc: Record<string, string>, option: any) => {
            const title = typeof option?.title === "string" ? option.title : undefined
            const rawValue =
              typeof option?.value === "string"
                ? option.value
                : option?.value?.value != null
                  ? String(option.value.value)
                  : undefined

            if (title && rawValue != null) {
              acc[title] = String(rawValue)
            }

            return acc
          }, {})
        }

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
      })
    }

    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [data as any],
      },
    })

    const product = result[0]
    return new StepResponse(product, product.id)
  },
  async (productId: string, { container }) => {
    // Compensation: delete the product if linking fails
    const productService = container.resolve(Modules.PRODUCT)
    await productService.deleteProducts([productId])
  }
)

// ─── Step 3: Link product to seller (raw insert, bypasses Medusa 1:1 check) ──
//
// Medusa's createRemoteLinkStep enforces a 1:1 constraint at the app level even
// though the DB pivot table (product_product_seller_seller) only has a composite
// PK on (product_id, seller_id) — which already allows many products per seller.
// We bypass the app-level check with a direct Knex insert.

type LinkInput = { product_id: string; seller_id: string }

const createSellerProductLinkStep = createStep(
  "create-seller-product-link",
  async ({ product_id, seller_id }: LinkInput, { container }) => {
    const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const id = generateEntityId("link")

    await knex.raw(
      `INSERT INTO product_product_seller_seller (id, product_id, seller_id, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())
       ON CONFLICT (product_id, seller_id) DO NOTHING`,
      [id, product_id, seller_id]
    )

    return new StepResponse({ product_id, seller_id }, { product_id, seller_id })
  },
  async ({ product_id, seller_id }: LinkInput, { container }) => {
    // Compensation: remove the link if later steps fail
    const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    await knex.raw(
      `DELETE FROM product_product_seller_seller WHERE product_id = ? AND seller_id = ?`,
      [product_id, seller_id]
    )
  }
)

// ─── Step 4: Delete uploaded files ──────────────────────────────────────────

type DeleteUploadedFilesInput = {
  file_ids?: string[]
}

const deleteUploadedFilesStep = createStep(
  "delete-uploaded-files-after-save",
  async ({ file_ids }: DeleteUploadedFilesInput, { container }) => {
    if (!file_ids?.length) {
      return new StepResponse([])
    }

    await deleteFilesWorkflow(container).run({
      input: { ids: file_ids },
    })

    return new StepResponse(file_ids)
  }
)

// ─── Workflow ───────────────────────────────────────────────────────────────

type WorkflowInput = {
  customer_id: string
  product_data: Record<string, unknown>
}

type CreateSellerProductWorkflowResult = {
  product: unknown
}

type CreateSellerProductWorkflow = (
  container?: unknown
) => {
  run: (args: { input: WorkflowInput }) => Promise<{ result: CreateSellerProductWorkflowResult }>
}

const createSellerProductWorkflowDefinition = createWorkflow<
  WorkflowInput,
  CreateSellerProductWorkflowResult,
  []
>(
  "create-seller-product",
  function (input: WorkflowInput) {
    const seller = getSellerByCustomerIdStep({ customer_id: input.customer_id })
    const product = createProductStep(input.product_data)

    // Build link input for the custom step
    const linkInput = transform({ product, seller }, ({ product, seller }) => ({
      product_id: product.id,
      seller_id: seller.id,
    }))

    createSellerProductLinkStep(linkInput)

    const deletedFileIds = transform(input, (workflowInput) => ({
      file_ids:
        Array.isArray((workflowInput.product_data as any)?.pending_delete_file_ids)
          ? (workflowInput.product_data as any).pending_delete_file_ids
          : [],
    }))

    deleteUploadedFilesStep(deletedFileIds)

    return new WorkflowResponse({ product })
  }
)

export const createSellerProductWorkflow =
  createSellerProductWorkflowDefinition as unknown as CreateSellerProductWorkflow
