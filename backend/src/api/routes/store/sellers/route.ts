/**
 * Seller Module API Routes
 * 
 * Endpoints for seller operations:
 * - Public (store): /store/sellers/* - public seller info, registration
 * - Admin: /admin/sellers/* - seller management, verification
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SELLER_MODULE } from "../../../modules/seller"

/**
 * GET /store/sellers
 * List all verified sellers (public endpoint)
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - search: string (search by business name)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sellerService = req.scope.resolve(SELLER_MODULE)
  const { page = 1, limit = 20, search } = req.query

  try {
    const filters: any = {
      verification_status: "verified",
      is_active: true,
    }

    if (search) {
      filters.business_name = {
        $like: `%${search}%`,
      }
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
 * POST /store/sellers/register
 * Register a new seller (public endpoint)
 * 
 * Body:
 * {
 *   customer_id: string
 *   business_name: string
 *   business_email: string
 *   business_phone?: string
 *   business_address?: object
 *   tax_id?: string
 *   payout_method?: "bank_transfer" | "paypal" | "stripe"
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const sellerService = req.scope.resolve(SELLER_MODULE)
  const { customer_id, business_name, business_email, ...restData } = req.body

  try {
    // Validation
    if (!customer_id || !business_name || !business_email) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["customer_id", "business_name", "business_email"],
      })
    }

    // Check if seller already exists
    const existing = await sellerService.listSellers({
      filters: { customer_id },
    })

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Seller already exists for this customer",
      })
    }

    // Create seller
    const seller = await sellerService.createSellers({
      customer_id,
      business_name,
      business_email,
      verification_status: "pending",
      is_active: true,
      ...restData,
    })

    res.status(201).json({
      message: "Seller registered successfully. Awaiting verification.",
      seller,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to register seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
