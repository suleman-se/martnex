import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { Modules } from '@medusajs/framework/utils'
import type { ICustomerModuleService } from '@medusajs/framework/types'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../../auth/jwt'

const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
})

/**
 * POST /auth/token/refresh
 * Refresh access token using a valid refresh token stored in Redis
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { refresh_token } = refreshSchema.parse(req.body)

    // 1. Verify JWT signature and expiration
    let decoded: any
    try {
      decoded = verifyRefreshToken(refresh_token)
    } catch (err) {
      res.status(401).json({
        message: 'Invalid or expired refresh token'
      })
      return
    }

    const { user_id, token_id } = decoded

    if (!user_id || !token_id) {
      res.status(401).json({
        message: 'Invalid token payload'
      })
      return
    }

    // 2. Verify token exists in cache (revocation check)
    const cacheService = req.scope.resolve(Modules.CACHE) as any
    const storedUserId = await cacheService.get(`refresh_token:${token_id}`)
    
    if (!storedUserId || storedUserId !== user_id) {
      res.status(401).json({
        message: 'Token has been revoked or is invalid'
      })
      return
    }

    // 3. Token Rotation: Invalidate old token and issue a new one
    await cacheService.invalidate(`refresh_token:${token_id}`)

    const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const customer = await customerService.retrieveCustomer(user_id)

    // Fetch role from metadata or app_metadata (ideally stored in JWT, but let's be safe)
    const role = (customer.metadata?.role as string) || 'buyer'

    // Find AuthIdentity for this customer
    const authModule = req.scope.resolve<any>(Modules.AUTH)
    const [providerIdentity] = await authModule.listProviderIdentities({
      entity_id: customer.email,
      provider: 'emailpass'
    })

    if (!providerIdentity) {
      res.status(401).json({ message: 'Authentication identity not found' })
      return
    }

    const authIdentity = await authModule.retrieveAuthIdentity(providerIdentity.auth_identity_id)

    const { ContainerRegistrationKeys } = require('@medusajs/framework/utils')
    const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
    const { http } = config.projectConfig;
    const { generateJwtToken } = require('@medusajs/framework/utils')

    const newAccessToken = generateJwtToken({
        actor_id: customer.id,
        actor_type: 'customer',
        auth_identity_id: authIdentity.id,
        app_metadata: {
            customer_id: customer.id,
        },
        user_metadata: {},
    }, {
        secret: http.jwtSecret,
        expiresIn: http.jwtExpiresIn || '1d',
        jwtOptions: http.jwtOptions,
    })
    const newTokenId = `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    const newRefreshToken = generateRefreshToken({
      user_id: customer.id,
      token_id: newTokenId
    })

    // Store new refresh token in cache
    await cacheService.set(`refresh_token:${newTokenId}`, customer.id, 7 * 24 * 60 * 60)

    res.status(200).json({
      message: 'Token refreshed successfully',
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      })
      return
    }

    console.error('Refresh token error:', error)
    res.status(500).json({
      message: 'Refresh failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
