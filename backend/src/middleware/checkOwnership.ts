/**
 * Ownership Verification Middleware
 *
 * Ensures that sellers can only access their own resources.
 * Admins bypass ownership checks (superuser access).
 * Must be used AFTER authenticate middleware.
 */

import { MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { AuthenticatedRequest } from './authenticate'

/**
 * Checks if authenticated user owns the resource (seller_id match)
 * Admins are allowed to access any resource
 *
 * @param paramName - Name of the route parameter containing seller_id (default: 'seller_id')
 * @returns Middleware function
 *
 * @example
 * // Seller can only access their own products
 * router.get('/seller/products/:seller_id',
 *   authenticate,
 *   requireSeller,
 *   checkOwnership('seller_id'),
 *   handler
 * )
 *
 * @example
 * // Using default parameter name
 * router.put('/seller/:seller_id/profile',
 *   authenticate,
 *   checkOwnership(),
 *   handler
 * )
 */
export function checkOwnership(paramName: string = 'seller_id') {
  return (
    req: AuthenticatedRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ): void => {
    // User must be authenticated first
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required',
        error: 'No user information found. Use authenticate middleware before checkOwnership.'
      })
      return
    }

    // Admins can access any resource
    if (req.user.role === 'admin') {
      next()
      return
    }

    // For sellers, verify they own the resource
    if (req.user.role === 'seller') {
      const resourceSellerId = req.params[paramName]

      if (!resourceSellerId) {
        res.status(400).json({
          message: 'Bad request',
          error: `Missing ${paramName} parameter in route`
        })
        return
      }

      if (!req.user.seller_id) {
        res.status(403).json({
          message: 'Access forbidden',
          error: 'Seller account not properly configured'
        })
        return
      }

      if (req.user.seller_id !== resourceSellerId) {
        res.status(403).json({
          message: 'Access forbidden',
          error: 'You can only access your own resources'
        })
        return
      }

      // Ownership verified
      next()
      return
    }

    // Buyers cannot access seller resources
    res.status(403).json({
      message: 'Access forbidden',
      error: 'This resource is only accessible to sellers'
    })
  }
}

/**
 * Checks if authenticated user owns the resource via body parameter
 * Useful for POST/PUT requests where seller_id is in request body
 *
 * @param bodyField - Name of the body field containing seller_id (default: 'seller_id')
 * @returns Middleware function
 *
 * @example
 * router.post('/products',
 *   authenticate,
 *   requireSeller,
 *   checkOwnershipInBody('seller_id'),
 *   handler
 * )
 */
export function checkOwnershipInBody(bodyField: string = 'seller_id') {
  return (
    req: AuthenticatedRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required',
        error: 'No user information found'
      })
      return
    }

    // Admins can access any resource
    if (req.user.role === 'admin') {
      next()
      return
    }

    // For sellers, verify they own the resource
    if (req.user.role === 'seller') {
      const resourceSellerId = req.body?.[bodyField]

      if (!resourceSellerId) {
        res.status(400).json({
          message: 'Bad request',
          error: `Missing ${bodyField} in request body`
        })
        return
      }

      if (!req.user.seller_id) {
        res.status(403).json({
          message: 'Access forbidden',
          error: 'Seller account not properly configured'
        })
        return
      }

      if (req.user.seller_id !== resourceSellerId) {
        res.status(403).json({
          message: 'Access forbidden',
          error: 'You can only create/modify your own resources'
        })
        return
      }

      next()
      return
    }

    res.status(403).json({
      message: 'Access forbidden',
      error: 'This action is only accessible to sellers'
    })
  }
}

/**
 * Checks if authenticated user is the resource owner (by user_id)
 * Used for user profile and account operations
 *
 * @param paramName - Name of the route parameter containing user_id (default: 'user_id')
 * @returns Middleware function
 *
 * @example
 * router.put('/users/:user_id/profile',
 *   authenticate,
 *   checkUserOwnership('user_id'),
 *   handler
 * )
 */
export function checkUserOwnership(paramName: string = 'user_id') {
  return (
    req: AuthenticatedRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required',
        error: 'No user information found'
      })
      return
    }

    // Admins can access any user
    if (req.user.role === 'admin') {
      next()
      return
    }

    const resourceUserId = req.params[paramName]

    if (!resourceUserId) {
      res.status(400).json({
        message: 'Bad request',
        error: `Missing ${paramName} parameter in route`
      })
      return
    }

    if (req.user.user_id !== resourceUserId) {
      res.status(403).json({
        message: 'Access forbidden',
        error: 'You can only access your own account'
      })
      return
    }

    next()
  }
}
