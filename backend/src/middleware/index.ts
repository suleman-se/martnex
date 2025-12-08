/**
 * Middleware Exports
 *
 * Central export point for all authentication and authorization middleware.
 */

export {
  authenticate,
  optionalAuthenticate,
  type AuthenticatedRequest
} from './authenticate'

export {
  authorize,
  requireAdmin,
  requireSeller,
  requireAuthenticated,
  type UserRole
} from './authorize'

export {
  checkOwnership,
  checkOwnershipInBody,
  checkUserOwnership
} from './checkOwnership'
