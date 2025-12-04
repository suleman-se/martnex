/**
 * Seller Module Definition (Medusa v2)
 *
 * This file registers the Seller module with Medusa's module system.
 * Medusa will automatically:
 * - Load this module on startup
 * - Register the service in the container
 * - Make it available for dependency injection
 */

import { Module } from "@medusajs/utils"
import type { ModuleExports } from "@medusajs/types"
import SellerModuleService from "./service"

// Module identifier (used throughout the app)
export const SELLER_MODULE = "sellerModuleService"

/**
 * Export the module definition
 *
 * Module() tells Medusa:
 * - Module name: "sellerModuleService"
 * - Service class: SellerModuleService
 * - Auto-register in container
 */
export default Module(SELLER_MODULE, {
  service: SellerModuleService,
}) satisfies ModuleExports

/**
 * USAGE IN OTHER PARTS OF THE APP:
 * ==================================
 *
 * In API routes:
 * --------------
 * import { SELLER_MODULE } from "../modules/seller"
 *
 * export async function GET(req: MedusaRequest, res: MedusaResponse) {
 *   const sellerService = req.scope.resolve(SELLER_MODULE)
 *   const sellers = await sellerService.listSellers()
 *   res.json({ sellers })
 * }
 *
 * In workflows:
 * -------------
 * import { SELLER_MODULE } from "../../modules/seller"
 *
 * const createSellerStep = createStep(
 *   "create-seller",
 *   async ({ data }, { container }) => {
 *     const sellerService = container.resolve(SELLER_MODULE)
 *     const seller = await sellerService.createSellers(data)
 *     return new StepResponse(seller)
 *   }
 * )
 *
 * In subscribers:
 * ---------------
 * export default async function handleSellerApproved({
 *   event: { data },
 *   container,
 * }: SubscriberArgs) {
 *   const sellerService = container.resolve(SELLER_MODULE)
 *   const seller = await sellerService.retrieveSeller(data.seller_id)
 *   // Send notification...
 * }
 */
