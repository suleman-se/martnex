/**
 * POST /auth/login
 * Login user and return JWT tokens
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { verifyPassword } from '../../../auth/password'
import { generateAccessToken, generateRefreshToken } from '../../../auth/jwt'

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

    // TODO: Fetch user from database by email
    // Mock user for now - will be replaced with actual DB query
    const mockUser = {
      user_id: 'user_123',
      email: email,
      // This would come from DB - using hardcoded hash for 'SecurePass123!'
      password_hash: '$2b$12$abcdefghijklmnopqrstuv.hashedpassword',
      role: 'buyer' as const,
      email_verified: true
    }

    // TODO: Handle user not found
    // if (!user) {
    //   res.status(401).json({ message: 'Invalid credentials' })
    //   return
    // }

    // Verify password
    const isValidPassword = await verifyPassword(password, mockUser.password_hash)
    if (!isValidPassword) {
      res.status(401).json({
        message: 'Invalid credentials',
        error: 'Email or password is incorrect'
      })
      return
    }

    // Check email verification
    if (!mockUser.email_verified) {
      res.status(403).json({
        message: 'Email not verified',
        error: 'Please verify your email before logging in'
      })
      return
    }

    // Generate tokens
    const tokenPayload = {
      user_id: mockUser.user_id,
      email: mockUser.email,
      role: mockUser.role
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // TODO: Store refresh token in Redis with expiration

    res.status(200).json({
      message: 'Login successful',
      data: {
        user: {
          user_id: mockUser.user_id,
          email: mockUser.email,
          role: mockUser.role
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
