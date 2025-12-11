/**
 * POST /auth/logout
 * Logout user and invalidate tokens
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { verifyRefreshToken } from '../../../auth/jwt'
import { getRedisTokenStore } from '../../../lib/redis-token-store'

const logoutSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { refresh_token } = logoutSchema.parse(req.body)

    // Verify refresh token to extract user_id and token_id
    const decoded = verifyRefreshToken(refresh_token)

    // Revoke the refresh token from Redis
    const tokenStore = getRedisTokenStore()
    await tokenStore.revokeRefreshToken(decoded.user_id, decoded.token_id)

    res.status(200).json({
      message: 'Logout successful. Your session has been terminated.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.errors
      })
      return
    }

    // Even if token is invalid/expired, return success
    // This prevents information leakage
    res.status(200).json({
      message: 'Logout successful. Your session has been terminated.'
    })
  }
}
