/**
 * Admin Payout Approval Routes
 * 
 * POST /admin/payouts/:id/approve - approve a payout
 */

import type { MedusaResponse, MedusaRequest } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../../../../modules/payout"
import type PayoutModuleService from "../../../../../../modules/payout/service"

/**
 * POST /admin/payouts/:id/approve
 * Approve a payout request
 * 
 * Body:
 * {
 *   notes?: string
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { notes } = req.body as { notes?: string }
  const payoutService = req.scope.resolve<PayoutModuleService>(PAYOUT_MODULE)
  const adminId = (req as any).auth_context?.actor_id as string // From middleware

  if (!adminId) {
    return res.status(401).json({
      error: "Unauthorized. Admin authentication required.",
    })
  }

  try {
    const payout = await payoutService.approvePayout(id, adminId, notes)

    res.status(200).json({
      message: "Payout approved successfully",
      payout,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to approve payout",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
