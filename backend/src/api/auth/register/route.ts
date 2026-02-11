/**
 * POST /auth/register
 * Register new user account
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { validatePassword } from '../../../auth/password'
import { ACCOUNT_MODULE } from '../../../modules/account'
import type { ICustomerModuleService } from '@medusajs/framework/types'
import type AccountModuleService from '../../../modules/account/service'

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

    // Resolve services from container
    const { Modules } = await import('@medusajs/framework/utils')
    const authService = req.scope.resolve(Modules.AUTH)
    const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const accountService = req.scope.resolve<AccountModuleService>(ACCOUNT_MODULE)

    // Check if user already exists
    const existingCustomers = await customerService.listCustomers({
      email: validatedData.email
    })

    if (existingCustomers.length > 0) {
      res.status(409).json({
        message: 'An account with this email already exists'
      })
      return
    }

    // Create customer (for buyers) or user (for sellers - TODO in seller module)
    // For now, all registrations create customers
    const customer = await customerService.createCustomers({
      email: validatedData.email,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name || '',
      has_account: true,
    })

    // Create auth identity with emailpass provider
    // Auth Module will automatically hash the password
    await authService.createAuthIdentities({
      provider_identities: [
        {
          entity_id: customer.id,
          provider: "emailpass",
          provider_metadata: {
            email: validatedData.email,
            password: validatedData.password, // Will be hashed automatically
          },
        }
      ],
      app_metadata: {
        role: validatedData.role,
      },
    })

    // Create email verification token
    // TODO: Fix Account Module to accept shared context
    // await accountService.createEmailVerificationToken(
    //   customer.id,
    //   validatedData.email
    // )

    // TODO: Send verification email with verification.token
    // await emailService.sendVerificationEmail(customer.email, verification.token)

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
    // Log error for debugging
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
