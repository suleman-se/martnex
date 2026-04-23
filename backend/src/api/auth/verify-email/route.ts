/**
 * POST /auth/verify-email
 * Verify user email address with token
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { ACCOUNT_MODULE } from "@modules/account"
import type { ICustomerModuleService } from '@medusajs/framework/types'
import type AccountModuleService from "@modules/account/service"
import { Modules } from '@medusajs/framework/utils'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { token } = verifyEmailSchema.parse(req.body)

    // Resolve services from container
    const accountService = req.scope.resolve<AccountModuleService>(ACCOUNT_MODULE)
    const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)

    // Verify the email token using Account module
    const verification = await accountService.verifyEmailToken(token)

    if (!verification) {
      res.status(400).json({
        message: 'Email verification failed',
        error: 'Invalid or expired verification token'
      })
      return
    }

    // 1. Fetch current customer with metadata
    const customer = await customerService.retrieveCustomer(verification.user_id, {
      select: ['id', 'email', 'metadata'] as any
    })

    // 2. Update customer verification status in metadata
    await customerService.updateCustomers(verification.user_id, {
      metadata: {
        ...(customer.metadata || {}),
        email_verified: true,
        email_verified_at: new Date().toISOString()
      }
    } as any)

    // 3. If user is a seller, also verify their seller profile
    if (customer.metadata?.role === 'seller') {
      try {
        // Resolve seller module service
        const sellerService = req.scope.resolve<any>("seller")
        
        if (sellerService) {
          const seller = await sellerService.getSellerByCustomerId(customer.id)
          if (seller) {
            await sellerService.approveSeller(seller.id, "Auto-verified via email confirmation")
          }
        }
      } catch (e) {
        console.warn('Could not auto-verify seller profile:', e)
      }
    }

    res.status(200).json({
      message: 'Email verified successfully. You can now log in.',
      data: {
        user_id: verification.user_id,
        email: verification.email
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

    res.status(400).json({
      message: 'Email verification failed',
      error: error instanceof Error ? error.message : 'Invalid or expired token'
    })
  }
}
