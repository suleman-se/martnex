import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"

const SELLER_MODULE = "seller"

/**
 * GET /store/sellers/me/orders/:id
 *
 * Returns a single order scoped to the authenticated seller's products.
 * Returns 403 if the order contains none of the seller's products (ownership check).
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)

  const customerId = req.auth_context.actor_id

  const seller = await sellerService.getSellerByCustomerId(customerId)
  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Seller profile not found")
  }

  // Get seller's product IDs
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
  const productIds: string[] = linkedProducts.map((p: { id: string }) => p.id)

  // Get the specific order with full detail
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
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.address_2",
      "shipping_address.city",
      "shipping_address.country_code",
      "shipping_address.postal_code",
      "items.id",
      "items.title",
      "items.product_id",
      "items.variant_id",
      "items.quantity",
      "items.unit_price",
      "items.total",
      "items.thumbnail",
    ],
    filters: { id },
  })

  const order = orders[0]
  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found")
  }

  // Ownership check: must contain at least one of this seller's products
  const allItems = (order.items as { product_id: string; total?: number; unit_price?: number; quantity?: number }[] | undefined) ?? []
  const sellerItems = allItems.filter((item) => productIds.includes(item.product_id))

  if (sellerItems.length === 0) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Access denied to this order")
  }

  const sellerSubtotal = sellerItems.reduce(
    (sum, item) => sum + (item.total ?? (item.unit_price ?? 0) * (item.quantity ?? 1)),
    0
  )

  res.status(200).json({
    order: { ...order, items: sellerItems, seller_subtotal: sellerSubtotal },
  })
}
