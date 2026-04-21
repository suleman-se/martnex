/**
 * Admin Seller Management API Routes
 * 
 * Protected endpoints for admin sellers management:
 * - GET /admin/sellers - list all sellers
 * - POST /admin/sellers - update seller
 * - POST /admin/sellers/:id/verify - verify seller
 * - POST /admin/sellers/:id/reject - reject seller
 * - POST /admin/sellers/:id/suspend - suspend seller
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { SELLER_MODULE } from "@modules/seller"
import type SellerModuleService from "@modules/seller/service"
import { updateSellerWorkflow } from "../../../workflows/update-seller"

const updateSellerSchema = z.object({
  id: z.string().min(1, "Seller ID is required"),
  update_data: z.record(z.string(), z.unknown()),
})

/**
 * GET /admin/sellers
 * List all sellers with filters (admin only)
 * 
 * Query params:
 * - status: "pending" | "verified" | "rejected" | "suspended"
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)
  const { status, page = 1, limit = 20 } = req.query as { status?: string; page?: number; limit?: number }

  try {
    const filters: any = {}

    if (status) {
      filters.verification_status = status
    }

    const [sellers, count] = await Promise.all([
      sellerService.listSellers({
        filters,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      sellerService.listAndCountSellers({ filters }),
    ])

    res.status(200).json({
      sellers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count[1],
        pages: Math.ceil(count[1] / Number(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to list sellers",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

/**
 * POST /admin/sellers
 * Update seller details (admin only)
 * 
 * Body:
 * {
 *   id: string
 *   update_data: Record<string, unknown>
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = updateSellerSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    })
  }

  try {
    const { result: seller } = await updateSellerWorkflow(req.scope).run({
      input: {
        id: parsed.data.id,
        updateData: parsed.data.update_data,
      },
    })

    res.status(200).json({
      message: "Seller updated successfully",
      seller,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to update seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
