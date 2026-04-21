/**
 * Admin Payout Cancellation Routes
 * 
 * POST /admin/payouts/:id/cancel - cancel a payout
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { cancelPayoutWorkflow } from "../../../../../workflows/cancel-payout"

const cancelPayoutSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
})

/**
 * POST /admin/payouts/:id/cancel
 * Cancel/reject a payout request
 * 
 * Body:
 * {
 *   reason: string (required - why was payout cancelled)
 * }
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const parsed = cancelPayoutSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    })
  }

  const adminId = req.auth_context.actor_id

  if (!adminId) {
    return res.status(401).json({
      error: "Unauthorized. Admin authentication required.",
    })
  }

  try {
    const { result: payout } = await cancelPayoutWorkflow(req.scope).run({
      input: {
        id,
        adminId,
        reason: parsed.data.reason,
      },
    })

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
