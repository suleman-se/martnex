/**
 * POST /auth/reset-password
 * Reset password using reset token
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { validatePassword, hashPassword } from '../../../auth/password'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body)

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      res.status(400).json({
        message: 'Password validation failed',
        error: passwordValidation.error
      })
      return
    }

    // TODO: Query database for reset token
    // TODO: Check if token exists and not expired
    // TODO: Hash new password
    // TODO: Update user password
    // TODO: Delete reset token
    // TODO: Invalidate all refresh tokens for this user (force re-login)

    const hashedPassword = await hashPassword(password)

    // Mock implementation
    // const reset = await db.passwordReset.findOne({ token })
    // if (!reset || reset.expires_at < new Date()) {
    //   res.status(400).json({ message: 'Invalid or expired token' })
    //   return
    // }
    // await db.user.update({ password_hash: hashedPassword }, { where: { id: reset.user_id }})
    // await db.passwordReset.delete({ token })
    // await redis.del(`refresh_token:${reset.user_id}:*`) // Invalidate all refresh tokens

    res.status(200).json({
      message: 'Password reset successful. You can now log in with your new password.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.errors
      })
      return
    }

    res.status(400).json({
      message: 'Password reset failed',
      error: error instanceof Error ? error.message : 'Invalid or expired token'
    })
  }
}
