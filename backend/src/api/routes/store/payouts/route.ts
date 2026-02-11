/**
 * Payout API Routes (Store - Seller)
 * 
 * Endpoints for sellers to request and manage payouts:
 * - GET /store/payouts - list seller's payouts
 * - POST /store/payouts - create payout request
 * - GET /store/payouts/:id - get payout details
 */

import type { MedusaResponse } from "@medusajs/framework/http"
import { AuthenticatedRequest } from "../../../../middleware/authenticate"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import type PayoutModuleService from "../../../../modules/payout/service"
import { COMMISSION_MODULE } from "../../../../modules/commission"
import type CommissionModuleService from "../../../../modules/commission/service"

/**
 * GET /store/payouts
 * List seller's payouts (seller must be authenticated)
 * 
 * Query params:
 * - status: "requested" | "pending_review" | "approved" | "processing" | "completed" | "failed" | "cancelled"
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(req: AuthenticatedRequest, res: MedusaResponse) {
  const payoutService = req.scope.resolve<PayoutModuleService>(PAYOUT_MODULE)
  const sellerId = req.auth_context?.seller_id

  if (!sellerId) {
    return res.status(401).json({
      error: "Unauthorized. Seller authentication required.",
    })
  }

  const { status, page = 1, limit = 20 } = req.query as { status?: string; page?: number; limit?: number }

  try {
    const filters: any = { seller_id: sellerId }
    if (status) filters.status = status

    const [payouts, count] = await Promise.all([
      payoutService.getSellerPayouts(sellerId, {
        status,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      } as any),
      payoutService.listAndCountPayouts({ filters }),
    ])

    // Calculate stats
    const totalRequested = payouts.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    )

    res.status(200).json({
      payouts,
      stats: {
        totalRequested,
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

/**
 * POST /store/payouts
 * Create a new payout request (seller must be authenticated)
 * 
 * Body:
 * {
 *   commission_ids: string[] (array of commission IDs to include)
 *   amount: number (total amount to payout)
 * }
 */
export async function POST(req: AuthenticatedRequest, res: MedusaResponse) {
  const payoutService = req.scope.resolve<PayoutModuleService>(PAYOUT_MODULE)
  const commissionService = req.scope.resolve<CommissionModuleService>(COMMISSION_MODULE)
  const sellerId = req.auth_context?.seller_id

  if (!sellerId) {
    return res.status(401).json({
      error: "Unauthorized. Seller authentication required.",
    })
  }

  const { commission_ids, amount } = req.body as { commission_ids?: string[]; amount?: number }

  try {
    if (!commission_ids || !Array.isArray(commission_ids)) {
      return res.status(400).json({
        error: "commission_ids is required and must be an array",
      })
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "amount is required and must be greater than 0",
      })
    }

    // Validate commissions belong to this seller
    const commissions = await Promise.all(
      commission_ids.map((id: string) =>
        commissionService.retrieveCommission(id)
      )
    )

    const invalidCommissions = commissions.filter(
      (c: any) => !c || c.seller_id !== sellerId || c.status !== "approved"
    )

    if (invalidCommissions.length > 0) {
      return res.status(400).json({
        error:
          "Some commissions are invalid. Only approved commissions from this seller can be included.",
      })
    }

    const payout = await payoutService.createPayoutRequest({
      sellerId,
      commissionIds: commission_ids,
      amount,
    })

    res.status(201).json({
      message: "Payout request created successfully",
      payout,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to create payout request",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
