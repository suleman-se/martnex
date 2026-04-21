/**
 * Admin Seller Suspension Routes
 * 
 * POST /admin/sellers/:id/suspend - suspend a seller
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { suspendSellerWorkflow } from "../../../../../workflows/suspend-seller"

const suspendSellerSchema = z.object({
  reason: z.string().min(1, "Suspension reason is required"),
})

/**
 * POST /admin/sellers/:id/suspend
 * Suspend a seller (temporary ban)
 * 
 * Body:
 * {
 *   reason: string (required - why was seller suspended)
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const parsed = suspendSellerSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    })
  }

  try {
    const { result: seller } = await suspendSellerWorkflow(req.scope).run({
      input: {
        id,
        reason: parsed.data.reason,
      },
    })

    res.status(200).json({
      message: "Seller suspended",
      seller,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to suspend seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
