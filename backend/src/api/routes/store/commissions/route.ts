/**
 * Commission API Routes (Store - Seller)
 * 
 * Endpoints for sellers to view their commissions:
 * - GET /store/commissions - list seller's commissions
 * - GET /store/commissions/:id - get commission details
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { COMMISSION_MODULE } from "../../../modules/commission"

/**
 * GET /store/commissions
 * List seller's commissions (seller must be authenticated)
 * 
 * Query params:
 * - status: "pending" | "approved" | "paid" | "disputed" | "cancelled"
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - fromDate: ISO date string
 * - toDate: ISO date string
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const commissionService = req.scope.resolve(COMMISSION_MODULE)
  const sellerId = req.auth_context?.seller_id // From middleware

  if (!sellerId) {
    return res.status(401).json({
      error: "Unauthorized. Seller authentication required.",
    })
  }

  const { status, page = 1, limit = 20, fromDate, toDate } = req.query

  try {
    const filters: any = {
      status,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined,
    }

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) delete filters[key]
    })

    const [commissions, count] = await Promise.all([
      commissionService.getSellerCommissions(sellerId, {
        ...filters,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      commissionService.listAndCountCommissions({
        filters: { seller_id: sellerId, ...filters },
      }),
    ])

    // Calculate stats
    const totalEarnings = commissions.reduce(
      (sum: number, c: any) => sum + (c.seller_payout || 0),
      0
    )
    const approvedAmount = commissions
      .filter((c: any) => c.status === "approved")
      .reduce((sum: number, c: any) => sum + (c.seller_payout || 0), 0)

    res.status(200).json({
      commissions,
      stats: {
        totalEarnings,
        approvedAmount,
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
      error: "Failed to list commissions",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
