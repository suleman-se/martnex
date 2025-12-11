/**
 * POST /auth/register
 * Register new user account
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { validatePassword } from '../../../auth/password'
import { ACCOUNT_MODULE } from '../../../modules/account'
import type { IAuthModuleService } from '@medusajs/framework/types'
import type { ICustomerModuleService } from '@medusajs/framework/types'

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
    const authService = req.scope.resolve<IAuthModuleService>('authModuleService')
    const customerService = req.scope.resolve<ICustomerModuleService>('customerModuleService')
    const accountService = req.scope.resolve(ACCOUNT_MODULE)

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

    // Create auth identity with password using emailpass provider
    await authService.create({
      entity_id: customer.id,
      provider: 'emailpass',
      provider_metadata: {
        password: validatedData.password, // Medusa Auth will hash this
      },
      app_metadata: {
        role: validatedData.role,
      },
    })

    // Create email verification token
    const verification = await accountService.createEmailVerificationToken(
      customer.id,
      validatedData.email
    )

    // TODO: Send verification email with verification.token
    // For now, we'll return the token in response (remove in production!)

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user_id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        role: validatedData.role,
        email_verified: false,
        // TODO: Remove this in production - only for testing
        verification_token: verification.token,
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
