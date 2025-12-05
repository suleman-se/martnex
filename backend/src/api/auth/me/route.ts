/**
 * GET /auth/me
 * Get current authenticated user information
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { authenticate, AuthenticatedRequest } from '../../../middleware/authenticate'

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Apply authentication middleware
  authenticate(req as AuthenticatedRequest, res, async () => {
    const authReq = req as AuthenticatedRequest

    if (!authReq.user) {
      res.status(401).json({
        message: 'Not authenticated'
      })
      return
    }

    // TODO: Fetch full user details from database including profile info
    // For now, return JWT payload data
    res.status(200).json({
      message: 'User retrieved successfully',
      data: {
        user_id: authReq.user.user_id,
        email: authReq.user.email,
        role: authReq.user.role,
        seller_id: authReq.user.seller_id
      }
    })
  })
}
