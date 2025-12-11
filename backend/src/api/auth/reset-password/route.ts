/**
 * POST /auth/reset-password
 * Reset password using reset token
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { validatePassword } from '../../../auth/password'
import { ACCOUNT_MODULE } from '../../../modules/account'
import type { IAuthModuleService } from '@medusajs/framework/types'

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

    // Resolve services from container
    const accountService = req.scope.resolve(ACCOUNT_MODULE)
    const authService = req.scope.resolve<IAuthModuleService>('authModuleService')

    // Verify the password reset token
    const reset = await accountService.verifyPasswordResetToken(token)

    if (!reset) {
      res.status(400).json({
        message: 'Password reset failed',
        error: 'Invalid or expired reset token'
      })
      return
    }

    // Update password using Medusa Auth Module
    // The auth module will handle hashing
    await authService.update({
      entity_id: reset.user_id,
      provider_metadata: {
        password: password, // Medusa Auth will hash this
      }
    })

    // Mark reset token as used
    await accountService.markPasswordResetUsed(reset.id)

    // Invalidate all password reset tokens for this user
    await accountService.invalidatePasswordResetTokens(reset.user_id)

    // TODO: Invalidate all refresh tokens in Redis (force re-login)
    // await redisTokenStore.revokeAllUserTokens(reset.user_id)

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
