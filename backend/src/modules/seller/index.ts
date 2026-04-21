/**
 * Seller Module Definition (Medusa v2)
 *
 * Medusa v2 automatically generates the `linkable` registry from DML models
 * that are passed to MedusaService(). DO NOT manually define `linkable` —
 * the framework derives it from `model.define("seller", ...)` in seller.ts.
 *
 * Usage in link files:
 *   import SellerModule from "../modules/seller"
 *   SellerModule.linkable.seller
 */

import { Module } from "@medusajs/utils"
import type { ModuleExports } from "@medusajs/types"
import SellerModuleService from "./service"

// Module identifier — must match the key used in medusa-config.ts
export const SELLER_MODULE = "seller"

/**
 * Register the Seller module with Medusa's IoC container.
 * Medusa auto-generates CRUD + linkable from the DML models
 * registered inside SellerModuleService via MedusaService({ Seller }).
 */
export default Module(SELLER_MODULE, {
  service: SellerModuleService,
}) satisfies ModuleExports
