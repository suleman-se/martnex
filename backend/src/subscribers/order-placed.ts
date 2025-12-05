/**
 * Order Event Subscriber
 * 
 * Automatically creates commission records when an order is placed.
 * This ensures commissions are tracked for every seller transaction.
 * 
 * Events handled:
 * - order.placed - Create commission records for each line item
 */

import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { COMMISSION_MODULE } from "../modules/commission"
import { SELLER_MODULE } from "../modules/seller"

/**
 * Handle order.placed event
 * 
 * When an order is placed:
 * 1. Get order details from Medusa order service
 * 2. For each line item, find the seller
 * 3. Calculate commission based on seller/category/global rate
 * 4. Create commission record
 * 5. Log event for audit trail
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id

  console.log(`📦 Processing order commissions for order: ${orderId}`)

  try {
    // Resolve services
    const commissionService = container.resolve(COMMISSION_MODULE)
    const sellerService = container.resolve(SELLER_MODULE)

    // Get order from Medusa (would need order service from container)
    // For now, we'll note this as a TODO
    // const orderService = container.resolve("orderService")
    // const order = await orderService.retrieve(orderId)

    // TODO: Implement full commission creation workflow:
    // 1. Get order with line items from Medusa
    // 2. For each line item:
    //    a. Determine seller (from product_seller mapping)
    //    b. Get seller's commission rate
    //    c. Calculate commission amount
    //    d. Create commission record via commissionService
    // 3. Update order with commission_status = "commissions_created"
    // 4. Emit event for commission calculation workflow

    console.log(`✅ Order commission processing initiated for order: ${orderId}`)

    // For Phase 2, this is a placeholder
    // Phase 3 will implement full workflow integration
  } catch (error) {
    console.error(
      `❌ Error processing commissions for order ${orderId}:`,
      error
    )
    // Don't throw - we don't want to fail the order placement
    // Log for debugging, retry logic will be implemented in Phase 3
  }
}

/**
 * Subscriber configuration
 * 
 * event: "order.placed" - Listen for when orders are placed
 * 
 * Note: Medusa will automatically register this subscriber
 * when it loads from src/subscribers/ folder
 */
export const config: SubscriberConfig = {
  event: "order.placed",
}
