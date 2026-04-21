import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import SellerModule from "../modules/seller"

/**
 * Module Link: Product <-> Seller
 *
 * Medusa v2 auto-generates `SellerModule.linkable.seller` from the
 * `model.define("seller", ...)` DML registered via MedusaService.
 * This creates a pivot table linking products to sellers.
 *
 * After any change to link files, run: npx medusa db:sync-links
 */
export default defineLink(
  ProductModule.linkable.product,
  SellerModule.linkable.seller
)
