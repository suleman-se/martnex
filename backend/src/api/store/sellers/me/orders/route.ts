import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"

const SELLER_MODULE = "seller"

/**
 * GET /store/sellers/me/orders
 *
 * Returns orders that contain at least one of the authenticated seller's products.
 * Line items are scoped to the seller's products only, and a `seller_subtotal` is
 * calculated from those items.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)

  const customerId = req.auth_context.actor_id

  const seller = await sellerService.getSellerByCustomerId(customerId)
  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Seller profile not found")
  }

  // Step 1: Resolve seller's product IDs via the seller-product module link
  const { data: sellerData } = await query.graph({
    entity: "seller",
    fields: ["id", "product.id"],
    filters: { id: seller.id },
  })

  const rawProducts = sellerData[0]?.product
  const linkedProducts = Array.isArray(rawProducts)
    ? rawProducts
    : rawProducts
      ? [rawProducts]
      : []
  const productIds: string[] = linkedProducts
    .filter(Boolean)
    .map((p: { id: string }) => p.id)

  if (productIds.length === 0) {
    return res.status(200).json({ orders: [], count: 0 })
  }

  // Step 2: Query orders whose line items include at least one of the seller's products.
  // `items` live in the same order module, so query.graph() can filter on them.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "status",
      "fulfillment_status",
      "payment_status",
      "currency_code",
      "created_at",
      "customer.id",
      "customer.first_name",
      "customer.last_name",
      "customer.email",
      "items.id",
      "items.title",
      "items.product_id",
      "items.variant_id",
      "items.quantity",
      "items.unit_price",
      "items.total",
      "items.thumbnail",
    ],
    filters: {
      items: { product_id: productIds },
    },
  })

  // Step 3: Scope items to seller's products and compute seller subtotal
  const sellerOrders = orders.map((order: Record<string, unknown>) => {
    const allItems = (order.items as { product_id: string; total?: number; unit_price?: number; quantity?: number }[] | undefined) ?? []
    const sellerItems = allItems.filter((item) => productIds.includes(item.product_id))
    const sellerSubtotal = sellerItems.reduce(
      (sum, item) => sum + (item.total ?? (item.unit_price ?? 0) * (item.quantity ?? 1)),
      0
    )
    return { ...order, items: sellerItems, seller_subtotal: sellerSubtotal }
  })

  res.status(200).json({ orders: sellerOrders, count: sellerOrders.length })
}
