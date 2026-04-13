/**
 * POST /auth/reset-password
 * Reset password using reset token
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { ACCOUNT_MODULE } from '../../../modules/account'
import { RateLimiter } from '../../../services/business-rules'
import type { IAuthModuleService } from '@medusajs/framework/types'
import type AccountModuleService from '../../../modules/account/service'
import { Modules } from '@medusajs/framework/utils'

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

    // Rate limiting: Max 5 password reset attempts per hour per token
    // This prevents brute force attacks on the reset token
    const rateLimitKey = `reset-password:${token.substring(0, 8)}` // Use first 8 chars to avoid storing full token
    const rateLimit = RateLimiter.checkLimit(rateLimitKey, 5, 3600) // 3600 seconds = 1 hour

    if (!rateLimit.allowed) {
      res.status(429).json({
        message: 'Too many password reset attempts',
        error: `Please try again in ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes`,
        retry_after: rateLimit.resetAt.toISOString()
      })
      return
    }



    // Resolve services from container
    const accountService = req.scope.resolve<AccountModuleService>(ACCOUNT_MODULE)
    const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)

    // Verify the password reset token
    const reset = await accountService.verifyPasswordResetToken(token)

    if (!reset) {
      res.status(400).json({
        message: 'Password reset failed',
        error: 'Invalid or expired reset token'
      })
      return
    }

    // Look up the provider identity using email — the emailpass provider
    // stores entity_id = email address, NOT the customer ID
    const providerIdentities = await authService.listProviderIdentities({
      entity_id: reset.email,
      provider: "emailpass"
    } as any)

    if (providerIdentities.length === 0) {
      res.status(400).json({
        message: 'Password reset failed',
        error: 'User authentication not found'
      })
      return
    }

    // Use authService.updateProvider() which performs hashing internally (scrypt)
    // same as the register flow — keeping password hashes consistent
    await authService.updateProvider('emailpass', {
      entity_id: providerIdentities[0].entity_id,
      password,
    })

    // Mark reset token as used
    await accountService.markPasswordResetUsed(reset.id)

    // Invalidate all password reset tokens for this user
    await accountService.invalidatePasswordResetTokens(reset.user_id)



    res.status(200).json({
      message: 'Password reset successful. You can now log in with your new password.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      })
      return
    }

    res.status(400).json({
      message: 'Password reset failed',
      error: error instanceof Error ? error.message : 'Invalid or expired token'
    })
  }
}
