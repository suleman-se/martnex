/**
 * Review Service (Medusa v2)
 *
 * Owns rating validation, the one-review-per-customer-per-product rule, and the
 * aggregates the storefront reads (product rating summary, seller rating summary).
 */

import { MedusaError, MedusaService } from "@medusajs/utils"
import Review from "./models/review"

export interface RatingSummary {
  /** Mean rating rounded to one decimal place, or null when there are no reviews. */
  average: number | null
  count: number
  /** Number of reviews at each star level, keyed 1-5. */
  distribution: Record<number, number>
}

const EMPTY_SUMMARY: RatingSummary = {
  average: null,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
}

class ReviewModuleService extends MedusaService({
  review: Review,
}) {
  /**
   * Create a review.
   *
   * Rejects out-of-range ratings and second reviews of the same product by the
   * same customer - both are the caller's error, not a silent no-op.
   */
  async submitReview(data: {
    productId: string
    customerId: string
    rating: number
    sellerId?: string | null
    customerName?: string | null
    orderId?: string | null
    isVerifiedPurchase?: boolean
    title?: string | null
    content?: string | null
  }) {
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Rating must be a whole number between 1 and 5"
      )
    }

    const existing = await this.listReviews({
      product_id: data.productId,
      customer_id: data.customerId,
    })

    if (existing.length > 0) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "You have already reviewed this product"
      )
    }

    return await this.createReviews({
      product_id: data.productId,
      seller_id: data.sellerId ?? null,
      customer_id: data.customerId,
      customer_name: data.customerName ?? null,
      order_id: data.orderId ?? null,
      is_verified_purchase: data.isVerifiedPurchase ?? false,
      rating: data.rating,
      title: data.title ?? null,
      content: data.content ?? null,
    })
  }

  /** Published reviews for a product, newest first. */
  async getProductReviews(productId: string, limit = 50, offset = 0) {
    return await this.listReviews(
      { product_id: productId, status: "published" },
      { order: { created_at: "DESC" }, take: limit, skip: offset }
    )
  }

  /** Published reviews for every product belonging to a seller, newest first. */
  async getSellerReviews(sellerId: string, limit = 50, offset = 0) {
    return await this.listReviews(
      { seller_id: sellerId, status: "published" },
      { order: { created_at: "DESC" }, take: limit, skip: offset }
    )
  }

  async getProductRatingSummary(productId: string): Promise<RatingSummary> {
    const reviews = await this.listReviews({
      product_id: productId,
      status: "published",
    })
    return this.summarise(reviews)
  }

  async getSellerRatingSummary(sellerId: string): Promise<RatingSummary> {
    const reviews = await this.listReviews({
      seller_id: sellerId,
      status: "published",
    })
    return this.summarise(reviews)
  }

  /** Rating summaries for many products in one pass, keyed by product id. */
  async getRatingSummariesForProducts(
    productIds: string[]
  ): Promise<Record<string, RatingSummary>> {
    if (productIds.length === 0) {
      return {}
    }

    const reviews = await this.listReviews({
      product_id: productIds,
      status: "published",
    })

    const grouped = new Map<string, { rating: number }[]>()
    for (const review of reviews) {
      const bucket = grouped.get(review.product_id) ?? []
      bucket.push({ rating: review.rating })
      grouped.set(review.product_id, bucket)
    }

    const summaries: Record<string, RatingSummary> = {}
    for (const id of productIds) {
      summaries[id] = this.summarise(grouped.get(id) ?? [])
    }
    return summaries
  }

  async rejectReview(reviewId: string, reason?: string) {
    return await this.updateReviews({
      id: reviewId,
      status: "rejected",
      rejection_reason: reason ?? null,
    })
  }

  /** Shared aggregation so product and seller summaries cannot drift apart. */
  private summarise(reviews: { rating: number }[]): RatingSummary {
    if (reviews.length === 0) {
      return { ...EMPTY_SUMMARY, distribution: { ...EMPTY_SUMMARY.distribution } }
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let total = 0

    for (const review of reviews) {
      total += review.rating
      if (distribution[review.rating] !== undefined) {
        distribution[review.rating] += 1
      }
    }

    return {
      average: Math.round((total / reviews.length) * 10) / 10,
      count: reviews.length,
      distribution,
    }
  }
}

export default ReviewModuleService
