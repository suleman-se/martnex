/**
 * Review Module Definition (Medusa v2)
 */

import { Module } from "@medusajs/utils"
import type { ModuleExports } from "@medusajs/types"
import ReviewModuleService from "./service"

export const REVIEW_MODULE = "review"

export default Module(REVIEW_MODULE, {
  service: ReviewModuleService,
}) satisfies ModuleExports
