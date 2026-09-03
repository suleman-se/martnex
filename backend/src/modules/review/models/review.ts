/**
 * Review Data Model (Medusa v2 DML)
 *
 * One review per customer per product. Ratings feed both the product page and
 * the merchant storefront, so `seller_id` is denormalised here to keep seller
 * aggregates a single-table read.
 */

import { model } from "@medusajs/utils"

const Review = model.define("review", {
  id: model.id().primaryKey(),

  // What is being reviewed
  product_id: model.text(),
  seller_id: model.text().nullable(),

  // Who wrote it
  customer_id: model.text(),
  customer_name: model.text().nullable(), // denormalised for display

  // Proof of purchase, when we can establish it
  order_id: model.text().nullable(),
  is_verified_purchase: model.boolean().default(false),

  // The review itself. Rating is 1-5 and enforced at the service layer.
  rating: model.number(),
  title: model.text().nullable(),
  content: model.text().nullable(),

  // Moderation. Reviews publish immediately; an admin can reject after the fact.
  status: model.enum(["published", "rejected"]).default("published"),
  rejection_reason: model.text().nullable(),

  metadata: model.json().nullable(),
})

export default Review
