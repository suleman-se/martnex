/**
 * POST /auth/forgot-password
 * Request password reset email
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { ACCOUNT_MODULE } from '../../../modules/account'
import { RateLimiter } from '../../../services/business-rules'

import type { ICustomerModuleService } from '@medusajs/framework/types'
import type AccountModuleService from '../../../modules/account/service'
import { Modules } from '@medusajs/framework/utils'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)

    // Rate limiting: Max 3 password reset requests per hour per email
    const rateLimitKey = `forgot-password:${email}`
    const rateLimit = RateLimiter.checkLimit(rateLimitKey, 3, 3600) // 3600 seconds = 1 hour

    if (!rateLimit.allowed) {
      res.status(429).json({
        message: 'Too many password reset requests',
        error: `Please try again in ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes`,
        retry_after: rateLimit.resetAt.toISOString()
      })
      return
    }

    // Resolve services from container
    const accountService = req.scope.resolve<AccountModuleService>(ACCOUNT_MODULE)
    const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)

    // Check if customer exists with this email
    const customers = await customerService.listCustomers({ email })
    const customer = customers[0]

    if (customer) {
      // Create password reset token (15-minute expiration)
      const resetToken = await accountService.createPasswordResetToken(
        customer.id,
        email
      )

      // Emit event for notification subscriber
      const eventBus = req.scope.resolve(Modules.EVENT_BUS)
      await eventBus.emit({
        name: "auth.password_reset",
        data: {
          entity_id: customer.id,
          email: customer.email,
          token: resetToken.token,
        }
      })
    }

    // Always return success to prevent email enumeration attacks
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.'
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
      message: 'Failed to process password reset request',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
