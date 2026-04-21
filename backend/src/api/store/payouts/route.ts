/**
 * Payout API Routes (Store - Seller)
 * 
 * Endpoints for sellers to request and manage payouts:
 * - GET /store/payouts - list seller's payouts
 * - POST /store/payouts - create payout request
 * - GET /store/payouts/:id - get payout details
 */

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { PAYOUT_MODULE } from "@modules/payout"
import type PayoutModuleService from "@modules/payout/service"
import { createPayoutRequestWorkflow } from "../../../workflows/create-payout-request"

const createPayoutRequestSchema = z.object({
  commission_ids: z.array(z.string().min(1)).min(1),
  amount: z.number().positive(),
})

/**
 * GET /store/payouts
 * List seller's payouts (seller must be authenticated)
 * 
 * Query params:
 * - status: "requested" | "pending_review" | "approved" | "processing" | "completed" | "failed" | "cancelled"
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const payoutService = req.scope.resolve<PayoutModuleService>(PAYOUT_MODULE)
  const sellerId = req.auth_context.actor_id

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
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const payoutService = req.scope.resolve<PayoutModuleService>(PAYOUT_MODULE)
  const sellerId = req.auth_context.actor_id

  if (!sellerId) {
    return res.status(401).json({
      error: "Unauthorized. Seller authentication required.",
    })
  }

  const parsed = createPayoutRequestSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    })
  }

  const { commission_ids, amount } = parsed.data

  try {
    const { result: payout } = await createPayoutRequestWorkflow(req.scope).run({
      input: {
        sellerId,
        commissionIds: commission_ids,
        amount,
      },
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
