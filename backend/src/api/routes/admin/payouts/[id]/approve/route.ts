/**
 * Admin Payout Approval Routes
 * 
 * POST /admin/payouts/:id/approve - approve a payout
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../../modules/payout"

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
  const { notes } = req.body
  const payoutService = req.scope.resolve(PAYOUT_MODULE)
  const adminId = req.auth_context?.user_id // From middleware

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
