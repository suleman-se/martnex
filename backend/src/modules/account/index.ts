/**
 * Account Module Definition (Medusa v2)
 *
 * This file registers the Account module with Medusa's module system.
 * Medusa will automatically:
 * - Load this module on startup
 * - Register the service in the container
 * - Make it available for dependency injection
 *
 * Purpose: Manages email verification and password reset tokens
 */

import { Module } from "@medusajs/utils";
import type { ModuleExports } from "@medusajs/types";
import AccountModuleService from "./service";

// Module identifier (used throughout the app)
export const ACCOUNT_MODULE = "accountModuleService";

/**
 * Export the module definition
 *
 * Module() tells Medusa:
 * - Module name: "accountModuleService"
 * - Service class: AccountModuleService
 * - Auto-register in container
 */
export default Module(ACCOUNT_MODULE, {
  service: AccountModuleService,
}) satisfies ModuleExports;

/**
 * USAGE IN OTHER PARTS OF THE APP:
 * ==================================
 *
 * In API routes (Email Verification):
 * ------------------------------------
 * import { ACCOUNT_MODULE } from "../../modules/account"
 *
 * export async function POST(req: MedusaRequest, res: MedusaResponse) {
 *   const accountService = req.scope.resolve(ACCOUNT_MODULE)
 *   const verification = await accountService.createEmailVerificationToken(
 *     userId,
 *     email
 *   )
 *   // Send email with verification.token
 *   res.json({ message: "Verification email sent" })
 * }
 *
 * In API routes (Password Reset):
 * --------------------------------
 * import { ACCOUNT_MODULE } from "../../modules/account"
 *
 * export async function POST(req: MedusaRequest, res: MedusaResponse) {
 *   const accountService = req.scope.resolve(ACCOUNT_MODULE)
 *   const reset = await accountService.createPasswordResetToken(userId, email)
 *   // Send email with reset.token
 *   res.json({ message: "Reset email sent" })
 * }
 *
 * In workflows:
 * -------------
 * import { ACCOUNT_MODULE } from "../../modules/account"
 *
 * const verifyEmailStep = createStep(
 *   "verify-email",
 *   async ({ token }, { container }) => {
 *     const accountService = container.resolve(ACCOUNT_MODULE)
 *     const verification = await accountService.verifyEmailToken(token)
 *     if (!verification) {
 *       throw new Error("Invalid or expired token")
 *     }
 *     return new StepResponse({ userId: verification.user_id })
 *   }
 * )
 *
 * In subscribers (Cleanup Job):
 * ------------------------------
 * export default async function cleanupExpiredTokens({
 *   container,
 * }: SubscriberArgs) {
 *   const accountService = container.resolve(ACCOUNT_MODULE)
 *   await accountService.cleanupExpiredTokens()
 * }
 */
