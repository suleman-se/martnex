/**
 * POST /auth/register
 * Register new user account
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { hashPassword, validatePassword, generateSecureToken } from '../../../auth/password'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  role: z.enum(['buyer', 'seller']).default('buyer')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const validatedData = registerSchema.parse(req.body)

    // Validate password strength
    const passwordValidation = validatePassword(validatedData.password)
    if (!passwordValidation.isValid) {
      res.status(400).json({
        message: 'Password validation failed',
        error: passwordValidation.error
      })
      return
    }

    // TODO: Check if user already exists
    // TODO: Save user to database with hashed password
    const hashedPassword = await hashPassword(validatedData.password)
    const verificationToken = generateSecureToken(32)

    // Mock response - will be replaced with actual DB operations
    const mockUserId = `user_${Date.now()}`

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user_id: mockUserId,
        email: validatedData.email,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        role: validatedData.role,
        email_verified: false
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
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
