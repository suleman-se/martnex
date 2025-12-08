/**
 * Payout Module Definition (Medusa v2)
 */

import { Module } from "@medusajs/utils"
import type { ModuleExports } from "@medusajs/types"
import PayoutModuleService from "./service"

export const PAYOUT_MODULE = "payoutModuleService"

export default Module(PAYOUT_MODULE, {
  service: PayoutModuleService,
}) satisfies ModuleExports
