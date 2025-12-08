/**
 * POST /auth/logout
 * Logout user and invalidate tokens
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { authenticate, AuthenticatedRequest } from '../../../middleware/authenticate'

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Apply authentication middleware
  authenticate(req as AuthenticatedRequest, res, async () => {
    const authReq = req as AuthenticatedRequest

    try {
      if (!authReq.user) {
        res.status(401).json({
          message: 'Not authenticated'
        })
        return
      }

      // TODO: Invalidate refresh token (remove from Redis/database)
      // TODO: Add access token to blacklist (if implementing token blacklist)
      // Redis key pattern: `refresh_token:${user_id}:${token_id}`
      // Redis key pattern: `token_blacklist:${access_token}`

      res.status(200).json({
        message: 'Logout successful'
      })
    } catch (error) {
      res.status(500).json({
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}
