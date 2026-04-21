/**
 * Admin Seller Verification Routes
 * 
 * Protected endpoints for seller verification workflow:
 * - POST /admin/sellers/:id/verify - approve seller
 * - POST /admin/sellers/:id/reject - reject seller
 * - POST /admin/sellers/:id/suspend - suspend seller
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { approveSellerWorkflow } from "../../../../../workflows/approve-seller"

const verifySellerSchema = z.object({
  notes: z.string().optional(),
})

/**
 * POST /admin/sellers/:id/verify
 * Approve/verify a seller
 * 
 * Body:
 * {
 *   notes?: string
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const parsed = verifySellerSchema.safeParse(req.body ?? {})

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    })
  }

  try {
    const { result: seller } = await approveSellerWorkflow(req.scope).run({
      input: {
        id,
        notes: parsed.data.notes,
      },
    })

    res.status(200).json({
      message: "Seller verified successfully",
      seller,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to verify seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
