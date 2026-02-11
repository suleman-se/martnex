/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { verifyRefreshToken, generateAccessToken } from '../../../auth/jwt'
import { getRedisTokenStore } from '../../../lib/redis-token-store'
import type { ICustomerModuleService } from '@medusajs/framework/types'
import type { IAuthModuleService } from '@medusajs/framework/types'

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { refresh_token } = refreshTokenSchema.parse(req.body)

    // Verify refresh token JWT signature and expiry
    const decoded = verifyRefreshToken(refresh_token)

    // Verify token exists in Redis and hasn't been revoked
    const tokenStore = getRedisTokenStore()
    const isValid = await tokenStore.isTokenValid(decoded.user_id, decoded.token_id)

    if (!isValid) {
      res.status(401).json({
        message: 'Token refresh failed',
        error: 'Refresh token has been revoked or expired'
      })
      return
    }

    // Get user data from database
    const customerService = req.scope.resolve<ICustomerModuleService>('customerModuleService')
    const authService = req.scope.resolve<IAuthModuleService>('authModuleService')

    const customers = await customerService.listCustomers({
      id: decoded.user_id
    })

    const customer = customers[0]

    if (!customer) {
      res.status(401).json({
        message: 'Token refresh failed',
        error: 'User not found'
      })
      return
    }

    // Get role from auth_identity metadata
    const authIdentities = await authService.listAuthIdentities({
      entity_id: customer.id
    } as any)
    const authIdentity = authIdentities[0]
    const role = authIdentity?.app_metadata?.role || 'buyer'

    // Generate new access token
    const newAccessToken = generateAccessToken({
      user_id: customer.id,
      email: customer.email || '',
      role: role as 'buyer' | 'seller' | 'admin'
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
        errors: error.issues
      })
      return
    }

    res.status(401).json({
      message: 'Token refresh failed',
      error: error instanceof Error ? error.message : 'Invalid refresh token'
    })
  }
}
