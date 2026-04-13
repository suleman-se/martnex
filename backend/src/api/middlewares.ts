/**
 * API Middlewares Configuration
 *
 * Configures CORS and other middlewares for custom API routes in Medusa v2.
 * This file is automatically loaded by Medusa.
 */

import type { MiddlewaresConfig } from "@medusajs/framework/http"
import { authenticate } from "@medusajs/framework/http"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { parseCorsOrigins } from "@medusajs/utils"

/**
 * Parse CORS origins from environment
 * Handles both "http://localhost:3000" and "http://localhost:3000/"
 */
const allowedOrigins = parseCorsOrigins(
  process.env.STORE_CORS || "http://localhost:3000"
)

/**
 * CORS middleware function
 */
const corsMiddleware = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Accept,Origin")

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.status(204).send()
      return
    }
  }
  next()
}

/**
 * Export middleware configuration
 */
export default {
  routes: [
    {
      matcher: "/auth/*",
      middlewares: [corsMiddleware],
    },
    // Protect store seller routes using the native Medusa auth method
    {
      matcher: "/store/commissions*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/payouts*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    // Protect admin routes
    {
      matcher: "/admin/payouts*",
      middlewares: [authenticate("user", ["session", "bearer"])],
    }
  ],
} as MiddlewaresConfig
