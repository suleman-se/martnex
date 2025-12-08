/**
 * Admin Seller Management API Routes
 * 
 * Protected endpoints for admin sellers management:
 * - GET /admin/sellers - list all sellers
 * - PATCH /admin/sellers/:id - update seller
 * - POST /admin/sellers/:id/verify - verify seller
 * - POST /admin/sellers/:id/reject - reject seller
 * - POST /admin/sellers/:id/suspend - suspend seller
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SELLER_MODULE } from "../../../modules/seller"

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
  const sellerService = req.scope.resolve(SELLER_MODULE)
  const { status, page = 1, limit = 20 } = req.query

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
 * PATCH /admin/sellers/:id
 * Update seller details (admin only)
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const sellerService = req.scope.resolve(SELLER_MODULE)
  const updateData = req.body

  try {
    const seller = await sellerService.updateSellers(id, updateData)

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
