/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { verifyRefreshToken, generateAccessToken } from '../../../auth/jwt'

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { refresh_token } = refreshTokenSchema.parse(req.body)

    // Verify refresh token
    const decoded = verifyRefreshToken(refresh_token)

    // TODO: Verify refresh token exists in Redis/database
    // TODO: Check if token has been revoked

    // Generate new access token
    const newAccessToken = generateAccessToken({
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      seller_id: decoded.seller_id
    })

    res.status(200).json({
      message: 'Token refreshed successfully',
      data: {
        access_token: newAccessToken
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.errors
      })
      return
    }

    res.status(401).json({
      message: 'Token refresh failed',
      error: error instanceof Error ? error.message : 'Invalid refresh token'
    })
  }
}
