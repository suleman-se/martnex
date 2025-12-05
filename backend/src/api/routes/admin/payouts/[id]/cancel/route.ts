/**
 * Admin Payout Cancellation Routes
 * 
 * POST /admin/payouts/:id/cancel - cancel a payout
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../../modules/payout"

/**
 * POST /admin/payouts/:id/cancel
 * Cancel/reject a payout request
 * 
 * Body:
 * {
 *   reason: string (required - why was payout cancelled)
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { reason } = req.body
  const payoutService = req.scope.resolve(PAYOUT_MODULE)
  const adminId = req.auth_context?.user_id

  if (!adminId) {
    return res.status(401).json({
      error: "Unauthorized. Admin authentication required.",
    })
  }

  try {
    if (!reason) {
      return res.status(400).json({
        error: "Reason is required",
      })
    }

    const payout = await payoutService.cancelPayout(id, adminId, reason)

    res.status(200).json({
      message: "Payout cancelled",
      payout,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to cancel payout",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
