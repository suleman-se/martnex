/**
 * POST /auth/register
 * Register new user account - Medusa Native Auth Flow
 *
 * Flow:
 * 1. Validate input
 * 2. Check if customer already exists
 * 3. Use authService.register() - this handles password hashing via scrypt internally
 * 4. Create the Customer record in the customer module
 * 5. Link the AuthIdentity to the Customer via app_metadata.customer_id
 * 6. Create email verification token
 * 7. Emit event for notification subscriber
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { Modules } from '@medusajs/framework/utils'
import { ACCOUNT_MODULE } from "@modules/account"
import type { ICustomerModuleService, IAuthModuleService } from '@medusajs/framework/types'
import type AccountModuleService from "@modules/account/service"

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

    const authService = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
    const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const accountService = req.scope.resolve<AccountModuleService>(ACCOUNT_MODULE)

    // Check if customer already exists
    const existingCustomers = await customerService.listCustomers({
      email: validatedData.email
    })

    if (existingCustomers.length > 0) {
      res.status(409).json({
        message: 'An account with this email already exists'
      })
      return
    }

    // Step 1: Use Medusa's native authService.register() which handles
    // password hashing with scrypt internally (same algorithm used by /auth/customer/emailpass)
    const { success, error, authIdentity } = await authService.register('emailpass', {
      url: req.url,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>,
      body: {
        email: validatedData.email,
        password: validatedData.password,
      },
      protocol: req.protocol,
    } as any)

    if (!success || !authIdentity) {
      res.status(400).json({
        message: error || 'Registration failed'
      })
      return
    }

    // Step 2: Create the customer record
    const customer = await customerService.createCustomers({
      email: validatedData.email,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name || '',
      has_account: true,
      metadata: {
        role: validatedData.role,
      },
    })

    // Step 3: Link the AuthIdentity to the Customer + set role
    // This is what makes /auth/customer/emailpass return actor_id = customer.id
    await authService.updateAuthIdentities({
      id: authIdentity.id,
      app_metadata: {
        customer_id: customer.id,
        role: validatedData.role,
      },
    })

    // Step 4: Create email verification token
    const verification = await accountService.createEmailVerificationToken(
      customer.id,
      validatedData.email
    )

    // Step 5: Emit event for notification subscriber
    const eventBus = req.scope.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: 'customer.created',
      data: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        token: verification.token,
      }
    })

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user_id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        role: validatedData.role,
        email_verified: false
      }
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.issues
      })
      return
    }

    res.status(500).json({
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
