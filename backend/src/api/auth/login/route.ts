/**
 * POST /auth/login
 * Login user and return JWT tokens
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { generateAccessToken, generateRefreshToken } from '../../../auth/jwt'
import { generateSecureToken } from '../../../auth/password'
import { getRedisTokenStore } from '../../../lib/redis-token-store'
import { RateLimiter } from '../../../services/business-rules'

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

    // Rate limiting: Max 5 login attempts per 15 minutes per email
    const rateLimitKey = `login:${email}`
    const rateLimit = RateLimiter.checkLimit(rateLimitKey, 5, 900) // 900 seconds = 15 minutes

    if (!rateLimit.allowed) {
      res.status(429).json({
        message: 'Too many login attempts',
        error: `Please try again in ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes`,
        retry_after: rateLimit.resetAt.toISOString()
      })
      return
    }

    // Resolve services from container using Module constants
    const { Modules } = await import('@medusajs/framework/utils')
    const authService = req.scope.resolve(Modules.AUTH)
    const customerService = req.scope.resolve(Modules.CUSTOMER)

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

    // Check if account is locked
    const customerAny = customer as any
    if (customerAny.locked_until && new Date(customerAny.locked_until) > new Date()) {
      const minutesRemaining = Math.ceil((new Date(customerAny.locked_until).getTime() - Date.now()) / 60000)
      res.status(423).json({
        message: 'Account locked',
        error: `Too many failed login attempts. Please try again in ${minutesRemaining} minutes.`,
        locked_until: customerAny.locked_until
      })
      return
    }

    // Check email verification (optional - can be disabled for development)
    if (customerAny.email_verified === false) {
      res.status(403).json({
        message: 'Email not verified',
        error: 'Please verify your email before logging in'
      })
      return
    }

    // Authenticate using Medusa Auth Module with emailpass provider
    let authResponse
    try {
      authResponse = await authService.authenticate('emailpass', {
        body: {
          email,
          password,
        }
      } as any)
    } catch (authError) {
      // Authentication failed - wrong password
      // Track failed login attempts and lock account after 5 attempts
      const failedAttempts = (customerAny.failed_login_attempts || 0) + 1
      const updateData: any = {
        failed_login_attempts: failedAttempts
      }

      // Lock account for 15 minutes after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockUntil = new Date()
        lockUntil.setMinutes(lockUntil.getMinutes() + 15)
        updateData.locked_until = lockUntil
      }

      await customerService.updateCustomers(customer.id, updateData as any)

      res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect',
        ...(failedAttempts >= 5 && {
          account_locked: true,
          locked_until: updateData.locked_until
        })
      })
      return
    }

    // Get role from auth identity metadata  
    const role = (authResponse as any)?.app_metadata?.role || 'buyer'

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

    // Reset failed login attempts and update last_login_at on successful login
    await customerService.updateCustomers(customer.id, {
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date()
    } as any)

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
        errors: error.issues
      })
      return
    }

    res.status(500).json({
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
