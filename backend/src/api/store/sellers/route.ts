import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type SellerModuleService from "@modules/seller/service"
import { z } from "zod"
import { registerSellerWorkflow } from "../../../workflows/register-seller"

const SELLER_MODULE = "seller"

const registerSellerSchema = z.object({
  business_name: z.string().min(1),
  business_email: z.string().email(),
  business_phone: z.string().optional(),
  business_address: z.unknown().optional(),
  tax_id: z.string().optional(),
  payout_method: z.enum(["bank_transfer", "paypal", "stripe"]).optional(),
  bank_details: z.unknown().optional(),
  paypal_email: z.string().email().optional(),
  commission_rate: z.number().optional(),
})

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
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)
  const { page = 1, limit = 20, search } = req.query as { page?: number; limit?: number; search?: string }

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

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const [sellers, count] = await Promise.all([
      sellerService.listSellers(filters, { skip, take }),
      sellerService.listAndCountSellers(filters),
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
 * POST /store/sellers
 * Register a new seller (authenticated customer only)
 * 
 * Body:
 * {
 *   business_name: string
 *   business_email: string
 *   business_phone?: string
 *   business_address?: object
 *   tax_id?: string
 *   payout_method?: "bank_transfer" | "paypal" | "stripe"
 *   bank_details?: object
 * }
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customerId = req.auth_context.actor_id

  if (!customerId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Customer authentication required",
    })
  }

  const parsed = registerSellerSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    })
  }

  const { business_name, business_email, ...restData } = parsed.data

  try {
    // Run the register-seller workflow
    const { result: seller } = await registerSellerWorkflow(req.scope).run({
      input: {
        customer_id: customerId,
        business_name,
        business_email,
        ...restData,
      },
    })

    res.status(201).json({
      message: "Seller registered successfully. Awaiting verification.",
      seller,
    })
  } catch (error) {
    res.status(400).json({
      error: "Failed to register seller",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
