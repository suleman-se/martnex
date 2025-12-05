/**
 * Authorization Middleware
 *
 * Checks if authenticated user has required role(s) to access a resource.
 * Must be used AFTER authenticate middleware.
 */

import { MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { AuthenticatedRequest } from './authenticate'

export type UserRole = 'buyer' | 'seller' | 'admin'

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has one of the allowed roles
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Middleware function
 *
 * @example
 * // Only admins can access
 * router.get('/admin/sellers', authenticate, authorize(['admin']), handler)
 *
 * @example
 * // Sellers and admins can access
 * router.get('/seller/products', authenticate, authorize(['seller', 'admin']), handler)
 */
export function authorize(allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ): void => {
    // User must be authenticated first
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required',
        error: 'No user information found. Use authenticate middleware before authorize.'
      })
      return
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Access forbidden',
        error: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role
      })
      return
    }

    // User is authorized, continue
    next()
  }
}

/**
 * Convenience middleware for admin-only routes
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  return authorize(['admin'])(req, res, next)
}

/**
 * Convenience middleware for seller routes (sellers and admins)
 */
export function requireSeller(
  req: AuthenticatedRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  return authorize(['seller', 'admin'])(req, res, next)
}

/**
 * Convenience middleware for buyer routes (all authenticated users)
 */
export function requireAuthenticated(
  req: AuthenticatedRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  return authorize(['buyer', 'seller', 'admin'])(req, res, next)
}
