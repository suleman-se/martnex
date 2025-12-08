/**
 * POST /auth/forgot-password
 * Request password reset email
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { generateSecureToken } from '../../../auth/password'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)

    // TODO: Check if user exists with this email
    // TODO: Generate password reset token (32 chars)
    // TODO: Save token with 15-minute expiration
    // TODO: Send password reset email with token link

    const resetToken = generateSecureToken(32)

    // Mock implementation
    // const user = await db.user.findOne({ email })
    // if (user) {
    //   const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    //   await db.passwordReset.create({ user_id: user.id, token: resetToken, expires_at: expiresAt })
    //   await emailService.sendPasswordReset(user.email, resetToken)
    // }

    // Always return success to prevent email enumeration attacks
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.'
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
      message: 'Failed to process password reset request',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
