import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { COMMISSION_MODULE } from "../modules/commission"
import type CommissionModuleService from "../modules/commission/service"

const DEFAULT_COMMISSION_RATE = 10 // 10% platform default

/**
 * order-placed subscriber
 *
 * Fires on every `order.placed` event. For each line item in the order,
 * looks up the linked seller via the seller-product module link and creates
 * a Commission record (status: "pending") using the seller's rate or the
 * platform default.
 *
 * Failures are logged but do NOT throw — we must never fail order placement.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const logger = container.resolve("logger")

  logger.info(`[order-placed] Processing commissions for order: ${orderId}`)

  try {
    const orderService = container.resolve<IOrderModuleService>(Modules.ORDER)
    const commissionService = container.resolve<CommissionModuleService>(COMMISSION_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Retrieve the full order with its line items
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["items"],
    })

    const items = (order as unknown as { items?: unknown[] }).items ?? []

    if (!items.length) {
      logger.info(`[order-placed] Order ${orderId} has no items — skipping`)
      return
    }

    // Process each item; collect results to report outcomes
    const results = await Promise.allSettled(
      (
        items as {
          id: string
          product_id?: string
          variant_id?: string
          title?: string
          total?: number
          unit_price?: number
          quantity?: number
        }[]
      )
        .filter((item) => Boolean(item.product_id))
        .map(async (item) => {
          // Find the seller linked to this product via the seller-product module link
          const { data: products } = await query.graph({
            entity: "product",
            fields: ["id", "seller.id", "seller.commission_rate"],
            filters: { id: item.product_id! },
          })

          const rawSeller = products[0]?.seller as
            | { id: string; commission_rate?: number | null }
            | { id: string; commission_rate?: number | null }[]
            | undefined
          const seller = Array.isArray(rawSeller) ? rawSeller[0] : rawSeller

          if (!seller?.id) {
            logger.info(`[order-placed] No seller for product ${item.product_id} — skipping`)
            return null
          }

          const commissionRate: number =
            seller.commission_rate != null
              ? Number(seller.commission_rate)
              : DEFAULT_COMMISSION_RATE

          const lineItemTotal: number =
            item.total ?? (item.unit_price ?? 0) * (item.quantity ?? 1)

          return commissionService.calculateCommission({
            orderId,
            lineItemId: item.id,
            sellerId: seller.id,
            productId: item.product_id!,
            productTitle: item.title,
            variantId: item.variant_id,
            lineItemTotal,
            quantity: item.quantity ?? 1,
            commissionRate,
            currencyCode:
              (order as unknown as { currency_code?: string }).currency_code ?? "usd",
          })
        })
    )

    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && r.value != null
    ).length
    const failed = results.filter((r) => r.status === "rejected").length

    logger.info(
      `[order-placed] Order ${orderId}: ${succeeded} commission(s) created, ${failed} skipped/failed`
    )
  } catch (error) {
    logger.error(
      `[order-placed] Unhandled error for order ${orderId}: ${String(error)}`
    )
    // Do NOT re-throw — never fail order placement due to commission logic
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
