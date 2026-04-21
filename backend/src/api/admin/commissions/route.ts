/**
 * Admin Commission Management API Routes
 * 
 * Protected endpoints for admin commission management:
 * - GET /admin/commissions - list all commissions
 * - POST /admin/commissions - update commission status
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { COMMISSION_MODULE } from "@modules/commission"
import type CommissionModuleService from "@modules/commission/service"
import {
  updateCommissionStatusWorkflow,
  type CommissionStatus,
} from "../../../workflows/update-commission-status"

const updateCommissionStatusSchema = z.object({
  id: z.string().min(1, "Commission ID is required"),
  status: z.enum(["pending", "approved", "paid", "disputed", "cancelled"]),
})

/**
 * GET /admin/commissions
 * List all commissions with filters (admin only)
 * 
 * Query params:
 * - status: "pending" | "approved" | "paid" | "disputed" | "cancelled"
 * - seller_id: string
 * - order_id: string
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const commissionService = req.scope.resolve<CommissionModuleService>(COMMISSION_MODULE)
  const { status, seller_id, order_id, page = 1, limit = 20 } = req.query as { status?: string; seller_id?: string; order_id?: string; page?: number; limit?: number }

  try {
    const filters: any = {}

    if (status) filters.status = status
    if (seller_id) filters.seller_id = seller_id
    if (order_id) filters.order_id = order_id

    const [commissions, count] = await Promise.all([
      commissionService.listCommissions({
        filters,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      commissionService.listAndCountCommissions({ filters }),
    ])

    // Calculate stats
    const totalCommission = commissions.reduce(
      (sum: number, c: any) => sum + (c.commission_amount || 0),
      0
    )

    res.status(200).json({
      commissions,
      stats: {
        totalCommission,
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

/**
 * POST /admin/commissions
 * Update commission status (admin only)
 * 
 * Body:
 * {
 *   id: string
 *   status: "pending" | "approved" | "paid" | "disputed" | "cancelled"
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = updateCommissionStatusSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    })
  }

  try {
    const { result: commission } = await updateCommissionStatusWorkflow(
      req.scope
    ).run({
      input: {
        id: parsed.data.id,
        status: parsed.data.status as CommissionStatus,
      },
    })

    res.status(200).json({
      message: "Commission updated",
      commission,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to update commission",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
