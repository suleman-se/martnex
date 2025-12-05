/**
 * Authorization Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  authorize,
  requireAdmin,
  requireSeller,
  requireAuthenticated
} from '../authorize'
import { AuthenticatedRequest } from '../authenticate'
import type { MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'

describe('Authorization Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>
  let mockRes: Partial<MedusaResponse>
  let mockNext: MedusaNextFunction

  beforeEach(() => {
    mockReq = {
      user: undefined
    }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
    mockNext = vi.fn()
  })

  describe('authorize', () => {
    it('should allow user with correct role', () => {
      mockReq.user = {
        user_id: 'user_123',
        email: 'admin@example.com',
        role: 'admin'
      }

      const middleware = authorize(['admin'])
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should allow user with one of multiple allowed roles', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }

      const middleware = authorize(['seller', 'admin'])
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject user without required role', () => {
      mockReq.user = {
        user_id: 'user_123',
        email: 'buyer@example.com',
        role: 'buyer'
      }

      const middleware = authorize(['admin'])
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access forbidden',
          userRole: 'buyer'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject unauthenticated request', () => {
      mockReq.user = undefined

      const middleware = authorize(['admin'])
      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('requireAdmin', () => {
    it('should allow admin user', () => {
      mockReq.user = {
        user_id: 'user_123',
        email: 'admin@example.com',
        role: 'admin'
      }

      requireAdmin(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject seller user', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }

      requireAdmin(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject buyer user', () => {
      mockReq.user = {
        user_id: 'user_789',
        email: 'buyer@example.com',
        role: 'buyer'
      }

      requireAdmin(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('requireSeller', () => {
    it('should allow seller user', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }

      requireSeller(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should allow admin user', () => {
      mockReq.user = {
        user_id: 'user_123',
        email: 'admin@example.com',
        role: 'admin'
      }

      requireSeller(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject buyer user', () => {
      mockReq.user = {
        user_id: 'user_789',
        email: 'buyer@example.com',
        role: 'buyer'
      }

      requireSeller(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('requireAuthenticated', () => {
    it('should allow buyer user', () => {
      mockReq.user = {
        user_id: 'user_789',
        email: 'buyer@example.com',
        role: 'buyer'
      }

      requireAuthenticated(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should allow seller user', () => {
      mockReq.user = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_789'
      }

      requireAuthenticated(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should allow admin user', () => {
      mockReq.user = {
        user_id: 'user_123',
        email: 'admin@example.com',
        role: 'admin'
      }

      requireAuthenticated(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should reject unauthenticated request', () => {
      mockReq.user = undefined

      requireAuthenticated(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
