/**
 * Admin Seller Rejection Routes
 * 
 * POST /admin/sellers/:id/reject - reject a seller application
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { rejectSellerWorkflow } from "../../../../../workflows/reject-seller"

const rejectSellerSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
})

/**
 * POST /admin/sellers/:id/reject
 * Reject a seller application
 * 
 * Body:
 * {
 *   reason: string (required - why was seller rejected)
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const parsed = rejectSellerSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    })
  }

  try {
    const { result: seller } = await rejectSellerWorkflow(req.scope).run({
      input: {
        id,
        reason: parsed.data.reason,
      },
    })

    res.status(200).json({
      message: "Seller rejected",
      seller,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to reject seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
