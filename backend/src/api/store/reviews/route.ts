import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import { REVIEW_MODULE } from "@modules/review"
import type ReviewModuleService from "@modules/review/service"

const listQuerySchema = z.object({
  product_id: z.string().optional(),
  seller_id: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

const createSchema = z.object({
  product_id: z.string().min(1, "product_id is required"),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  title: z.string().max(120).optional(),
  content: z.string().max(4000).optional(),
})

/**
 * GET /store/reviews?product_id=... | ?seller_id=...
 *
 * Public. Returns the published reviews plus the rating summary the storefront
 * renders, so a product or merchant page needs a single request.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = listQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" })
  }

  const { product_id, seller_id, limit, offset } = parsed.data

  if (!product_id && !seller_id) {
    return res.status(400).json({ error: "Provide either product_id or seller_id" })
  }

  try {
    const reviewService = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE)

    const [reviews, summary] = product_id
      ? await Promise.all([
          reviewService.getProductReviews(product_id, limit, offset),
          reviewService.getProductRatingSummary(product_id),
        ])
      : await Promise.all([
          reviewService.getSellerReviews(seller_id!, limit, offset),
          reviewService.getSellerRatingSummary(seller_id!),
        ])

    return res.status(200).json({ reviews, summary })
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve reviews",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

/**
 * POST /store/reviews
 *
 * Authenticated customers only. The seller is resolved from the product so the
 * client cannot attribute a review to the wrong merchant, and the review is
 * marked as a verified purchase when the customer has a completed order for it.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = createSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" })
  }

  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ error: "You must be signed in to leave a review" })
  }

  const { product_id, rating, title, content } = parsed.data

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const reviewService = req.scope.resolve<ReviewModuleService>(REVIEW_MODULE)

    // Confirm the product exists and find the seller behind it.
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "seller.id"],
      filters: { id: product_id },
    })

    const product = products?.[0]
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    const sellerRelation = (product as { seller?: { id?: string } | { id?: string }[] }).seller
    const sellerId = Array.isArray(sellerRelation)
      ? sellerRelation[0]?.id ?? null
      : sellerRelation?.id ?? null

    // Display name and purchase verification both come from the customer record.
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "first_name", "last_name"],
      filters: { id: customerId },
    })
    const customer = customers?.[0] as
      | { first_name?: string | null; last_name?: string | null }
      | undefined

    const customerName =
      [customer?.first_name, customer?.last_name].filter(Boolean).join(" ").trim() || null

    const { orderId, isVerified } = await findPurchase(query, customerId, product_id)

    const review = await reviewService.submitReview({
      productId: product_id,
      sellerId,
      customerId,
      customerName,
      orderId,
      isVerifiedPurchase: isVerified,
      rating,
      title: title ?? null,
      content: content ?? null,
    })

    return res.status(201).json({ review })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"

    if (message.includes("already reviewed")) {
      return res.status(409).json({ error: message })
    }
    if (message.includes("Rating must be")) {
      return res.status(400).json({ error: message })
    }

    return res.status(500).json({ error: "Failed to submit review", message })
  }
}

/**
 * Looks for an order from this customer containing this product. A missing or
 * failed lookup only costs the "verified purchase" badge - it never blocks the
 * review, so a query problem cannot silently stop customers reviewing.
 */
async function findPurchase(
  query: { graph: (args: Record<string, unknown>) => Promise<{ data: unknown[] }> },
  customerId: string,
  productId: string
): Promise<{ orderId: string | null; isVerified: boolean }> {
  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "items.product_id"],
      filters: { customer_id: customerId },
    })

    for (const order of orders as { id: string; items?: { product_id?: string }[] }[]) {
      if ((order.items ?? []).some((item) => item.product_id === productId)) {
        return { orderId: order.id, isVerified: true }
      }
    }
  } catch {
    // fall through to unverified
  }
  return { orderId: null, isVerified: false }
}
