/**
 * Commission Module Definition (Medusa v2)
 */

import { Module } from "@medusajs/utils"
import type { ModuleExports } from "@medusajs/types"
import CommissionModuleService from "./service"

export const COMMISSION_MODULE = "commissionModuleService"

export default Module(COMMISSION_MODULE, {
  service: CommissionModuleService,
}) satisfies ModuleExports
