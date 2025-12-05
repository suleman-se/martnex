/**
 * Ownership Verification Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkOwnership,
  checkOwnershipInBody,
  checkUserOwnership
} from '../checkOwnership'
import { AuthenticatedRequest } from '../authenticate'
import type { MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'

describe('Ownership Verification Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>
  let mockRes: Partial<MedusaResponse>
  let mockNext: MedusaNextFunction

  beforeEach(() => {
    mockReq = {
      user: undefined,
      params: {},
      body: {}
    }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
    mockNext = vi.fn()
  })

  describe('checkOwnership', () => {
    it('should allow admin to access any seller resource', () => {
      mockReq.user = {
        user_id: 'user_123',
        email: 'admin@example.com',
        role: 'admin'
      }
      mockReq.params = { seller_id: 'seller_456' }

      const middleware = checkOwnership('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should allow seller to access their own resource', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }
      mockReq.params = { seller_id: 'seller_789' }

      const middleware = checkOwnership('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject seller accessing another seller resource', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }
      mockReq.params = { seller_id: 'seller_999' }

      const middleware = checkOwnership('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access forbidden',
          error: 'You can only access your own resources'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject buyer from accessing seller resource', () => {
      mockReq.user = {
        user_id: 'user_789',
        email: 'buyer@example.com',
        role: 'buyer'
      }
      mockReq.params = { seller_id: 'seller_456' }

      const middleware = checkOwnership('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access forbidden',
          error: 'This resource is only accessible to sellers'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject unauthenticated request', () => {
      mockReq.user = undefined
      mockReq.params = { seller_id: 'seller_456' }

      const middleware = checkOwnership('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject if seller_id parameter is missing', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }
      mockReq.params = {}

      const middleware = checkOwnership('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Bad request',
          error: 'Missing seller_id parameter in route'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject seller without seller_id in JWT', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller'
        // Missing seller_id
      }
      mockReq.params = { seller_id: 'seller_789' }

      const middleware = checkOwnership('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access forbidden',
          error: 'Seller account not properly configured'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should work with custom parameter name', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }
      mockReq.params = { id: 'seller_789' }

      const middleware = checkOwnership('id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })
  })

  describe('checkOwnershipInBody', () => {
    it('should allow seller to create their own resource', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }
      mockReq.body = { seller_id: 'seller_789', name: 'Product' }

      const middleware = checkOwnershipInBody('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject seller creating resource for another seller', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }
      mockReq.body = { seller_id: 'seller_999', name: 'Product' }

      const middleware = checkOwnershipInBody('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'You can only create/modify your own resources'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow admin to create resource for any seller', () => {
      mockReq.user = {
        user_id: 'user_123',
        email: 'admin@example.com',
        role: 'admin'
      }
      mockReq.body = { seller_id: 'seller_456', name: 'Product' }

      const middleware = checkOwnershipInBody('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject if seller_id missing in body', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }
      mockReq.body = { name: 'Product' }

      const middleware = checkOwnershipInBody('seller_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Missing seller_id in request body'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('checkUserOwnership', () => {
    it('should allow user to access their own profile', () => {
      mockReq.user = {
        user_id: 'user_789',
        email: 'buyer@example.com',
        role: 'buyer'
      }
      mockReq.params = { user_id: 'user_789' }

      const middleware = checkUserOwnership('user_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject user accessing another user profile', () => {
      mockReq.user = {
        user_id: 'user_789',
        email: 'buyer@example.com',
        role: 'buyer'
      }
      mockReq.params = { user_id: 'user_999' }

      const middleware = checkUserOwnership('user_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'You can only access your own account'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow admin to access any user profile', () => {
      mockReq.user = {
        user_id: 'user_123',
        email: 'admin@example.com',
        role: 'admin'
      }
      mockReq.params = { user_id: 'user_789' }

      const middleware = checkUserOwnership('user_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject if user_id parameter is missing', () => {
      mockReq.user = {
        user_id: 'user_789',
        email: 'buyer@example.com',
        role: 'buyer'
      }
      mockReq.params = {}

      const middleware = checkUserOwnership('user_id')
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
