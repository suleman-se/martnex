/**
 * POST /auth/login
 * Login user and return JWT tokens
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { generateAccessToken, generateRefreshToken } from '../../../auth/jwt'
import { generateSecureToken } from '../../../auth/password'
import { getRedisTokenStore } from '../../../lib/redis-token-store'
import type { IAuthModuleService } from '@medusajs/framework/types'
import type { ICustomerModuleService } from '@medusajs/framework/types'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // Resolve services from container
    const authService = req.scope.resolve<IAuthModuleService>('authModuleService')
    const customerService = req.scope.resolve<ICustomerModuleService>('customerModuleService')

    // Find customer by email
    const customers = await customerService.listCustomers({
      email
    })

    const customer = customers[0]

    if (!customer) {
      res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      })
      return
    }

    // Authenticate using Medusa Auth Module with emailpass provider
    let authIdentity
    try {
      authIdentity = await authService.authenticate('emailpass', {
        body: {
          email,
          password,
        }
      })
    } catch (authError) {
      // Authentication failed - wrong password
      // TODO: Track failed login attempts and lock account after 5 attempts
      res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      })
      return
    }

    // Check if account is locked
    // TODO: Check customer.locked_until field when we extend the table
    // if (customer.locked_until && new Date(customer.locked_until) > new Date()) {
    //   res.status(423).json({
    //     message: 'Account locked',
    //     error: 'Too many failed login attempts. Please try again later.'
    //   })
    //   return
    // }

    // Check email verification
    // TODO: Check customer.email_verified field when we extend the table
    // if (!customer.email_verified) {
    //   res.status(403).json({
    //     message: 'Email not verified',
    //     error: 'Please verify your email before logging in'
    //   })
    //   return
    // }

    // Get role from auth identity metadata
    const role = authIdentity.app_metadata?.role || 'buyer'

    // Generate unique token ID for refresh token tracking
    const tokenId = generateSecureToken(16) // 32-character hex string

    // Generate tokens
    const accessTokenPayload = {
      user_id: customer.id,
      email: customer.email,
      role: role
    }

    const refreshTokenPayload = {
      user_id: customer.id,
      token_id: tokenId
    }

    const accessToken = generateAccessToken(accessTokenPayload)
    const refreshToken = generateRefreshToken(refreshTokenPayload)

    // Store refresh token in Redis with 7-day expiration
    const tokenStore = getRedisTokenStore()
    await tokenStore.storeRefreshToken(customer.id, tokenId, 604800) // 7 days in seconds

    // TODO: Update last_login_at timestamp on customer when customer table is extended

    res.status(200).json({
      message: 'Login successful',
      data: {
        user: {
          user_id: customer.id,
          email: customer.email,
          role: role
        },
        access_token: accessToken,
        refresh_token: refreshToken
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

    res.status(500).json({
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
