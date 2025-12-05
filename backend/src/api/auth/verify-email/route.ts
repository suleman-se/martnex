/**
 * POST /auth/verify-email
 * Verify user email address with token
 */

import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { token } = verifyEmailSchema.parse(req.body)

    // TODO: Query database for verification token
    // TODO: Check if token exists and not expired (24 hours validity)
    // TODO: Mark user email as verified
    // TODO: Delete verification token from database

    // Mock implementation
    // const verification = await db.emailVerification.findOne({ token })
    // if (!verification || verification.expires_at < new Date()) {
    //   res.status(400).json({ message: 'Invalid or expired token' })
    //   return
    // }
    // await db.user.update({ email_verified: true }, { where: { id: verification.user_id }})
    // await db.emailVerification.delete({ token })

    res.status(200).json({
      message: 'Email verified successfully. You can now log in.'
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
      message: 'Email verification failed',
      error: error instanceof Error ? error.message : 'Invalid or expired token'
    })
  }
}
