import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { Modules } from '@medusajs/framework/utils'
import type { ICustomerModuleService, IAuthModuleService } from '@medusajs/framework/types'
import { generateAccessToken, generateRefreshToken } from '../../../auth/jwt'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

/**
 * POST /auth/token
 * Custom login route to support legacy frontend and specific token format
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
    const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)

    // Authenticate using Medusa's emailpass provider
    const { success, error, authIdentity } = await authService.authenticate('emailpass', {
      url: req.url,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>,
      body: {
        email,
        password,
      },
      protocol: req.protocol,
    } as any)

    if (!success || !authIdentity) {
      res.status(401).json({
        message: 'Invalid credentials',
        error: error || 'Email or password is incorrect'
      })
      return
    }

    // Resolve customer associated with this identity
    // In our register route, we store customer_id in app_metadata
    const customerId = authIdentity.app_metadata?.customer_id as string
    const role = authIdentity.app_metadata?.role as string || 'buyer'

    if (!customerId) {
      res.status(403).json({
        message: 'Authentication failed',
        error: 'No customer associated with this account'
      })
      return
    }

    const customer = await customerService.retrieveCustomer(customerId)

    const { ContainerRegistrationKeys } = require('@medusajs/framework/utils')
    const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
    const { http } = config.projectConfig;
    const { generateJwtToken } = require('@medusajs/framework/utils')

    const accessToken = generateJwtToken({
        actor_id: customerId,
        actor_type: 'customer',
        auth_identity_id: authIdentity.id,
        app_metadata: {
            customer_id: customerId,
        },
        user_metadata: {},
    }, {
        secret: http.jwtSecret,
        expiresIn: http.jwtExpiresIn || '1d',
        jwtOptions: http.jwtOptions,
    })
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    const refreshToken = generateRefreshToken({
      user_id: customer.id,
      token_id: tokenId
    })

    // Store refresh token in cache (expire in 7 days)
    const cacheService = req.scope.resolve(Modules.CACHE) as any
    await cacheService.set(`refresh_token:${tokenId}`, customer.id, 7 * 24 * 60 * 60)

    res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        role: role
      },
      access_token: accessToken,
      refresh_token: refreshToken
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      })
      return
    }

    console.error('Login error:', error)
    res.status(500).json({
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
