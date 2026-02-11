/**
 * Authentication Middleware
 *
 * Validates JWT tokens and attaches user information to the request object.
 * This middleware should be used on all protected routes.
 */

import { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { extractTokenFromHeader, verifyAccessToken, JWTPayload } from '../auth/jwt'

/**
 * Extended request type with authenticated user information
 *
 * Merges our JWTPayload with Medusa's built-in user type
 */
export interface AuthenticatedRequest extends MedusaRequest {
  user?: JWTPayload & {
    customer_id?: string
    userId?: string
  }
  auth_context?: JWTPayload
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user info to request
 *
 * @throws 401 Unauthorized if token is missing, invalid, or expired
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      res.status(401).json({
        message: 'Authentication required',
        error: 'No access token provided'
      })
      return
    }

    // Verify and decode token
    const decoded = verifyAccessToken(token)

    // Attach user info to request
    req.user = decoded

    // Continue to next middleware/handler
    next()
  } catch (error) {
    // Token verification failed
    const message = error instanceof Error ? error.message : 'Invalid access token'

    res.status(401).json({
      message: 'Authentication failed',
      error: message
    })
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't reject if missing
 * Useful for routes that work for both authenticated and anonymous users
 */
export function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)

    if (token) {
      const decoded = verifyAccessToken(token)
      req.user = decoded
    }

    // Always continue, even if no token
    next()
  } catch (error) {
    // Invalid token, but don't reject - just continue without user info
    next()
  }
}
