/**
 * Admin Payout Management API Routes
 * 
 * Protected endpoints for admin payout management:
 * - GET /admin/payouts - list all payouts
 * - POST /admin/payouts/:id/approve - approve payout
 * - POST /admin/payouts/:id/cancel - cancel payout
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../modules/payout"

/**
 * GET /admin/payouts
 * List all payouts with filters (admin only)
 * 
 * Query params:
 * - status: "requested" | "pending_review" | "approved" | "processing" | "completed" | "failed" | "cancelled"
 * - seller_id: string
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const payoutService = req.scope.resolve(PAYOUT_MODULE)
  const { status, seller_id, page = 1, limit = 20 } = req.query

  try {
    const filters: any = {}
    if (status) filters.status = status
    if (seller_id) filters.seller_id = seller_id

    const [payouts, count] = await Promise.all([
      payoutService.listPayouts({
        filters,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      payoutService.listAndCountPayouts({ filters }),
    ])

    // Calculate stats
    const totalAmount = payouts.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    )
    const pendingAmount = payouts
      .filter((p: any) => p.status === "pending_review")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

    res.status(200).json({
      payouts,
      stats: {
        totalAmount,
        pendingAmount,
        totalCount: count[1],
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count[1],
        pages: Math.ceil(count[1] / Number(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to list payouts",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
