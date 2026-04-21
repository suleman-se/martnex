/**
 * Admin Payout Approval Routes
 * 
 * POST /admin/payouts/:id/approve - approve a payout
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { approvePayoutWorkflow } from "../../../../../workflows/approve-payout"

const approvePayoutSchema = z.object({
  notes: z.string().optional(),
})

/**
 * POST /admin/payouts/:id/approve
 * Approve a payout request
 * 
 * Body:
 * {
 *   notes?: string
 * }
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const parsed = approvePayoutSchema.safeParse(req.body ?? {})

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
    const { result: payout } = await approvePayoutWorkflow(req.scope).run({
      input: {
        id,
        adminId,
        notes: parsed.data.notes,
      },
    })

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
