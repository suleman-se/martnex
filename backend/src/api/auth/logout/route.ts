import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { z } from 'zod'
import { verifyRefreshToken } from '../../../auth/jwt'

const logoutSchema = z.object({
  refresh_token: z.string().optional()
})

/**
 * POST /auth/logout
 * Log out user and revoke their refresh token in Redis
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { refresh_token } = logoutSchema.parse(req.body)

    if (refresh_token) {
      try {
        const decoded = verifyRefreshToken(refresh_token)
        if (decoded.token_id) {
          // Revoke the token in cache
          const cacheService = req.scope.resolve('cache') as any
          await cacheService.invalidate(`refresh_token:${decoded.token_id}`)
        }
      } catch (err) {
        // Ignore JWT verification errors during logout, we just want to attempt cleanup
        console.debug('Logout token cleanup skipped:', err instanceof Error ? err.message : 'Invalid token')
      }
    }

    res.status(200).json({
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      message: 'Logout failed'
    })
  }
}
