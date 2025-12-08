/**
 * Authentication Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authenticate, optionalAuthenticate, AuthenticatedRequest } from '../authenticate'
import { generateAccessToken } from '../../auth/jwt'
import type { MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'

describe('Authentication Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>
  let mockRes: Partial<MedusaResponse>
  let mockNext: MedusaNextFunction

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined
    }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
    mockNext = vi.fn()
  })

  describe('authenticate', () => {
    it('should authenticate valid token and attach user to request', () => {
      const payload = {
        user_id: 'user_123',
        email: 'test@example.com',
        role: 'buyer' as const
      }
      const token = generateAccessToken(payload)

      mockReq.headers = {
        authorization: `Bearer ${token}`
      }

      authenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockReq.user).toBeDefined()
      expect(mockReq.user?.user_id).toBe('user_123')
      expect(mockReq.user?.email).toBe('test@example.com')
      expect(mockReq.user?.role).toBe('buyer')
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should authenticate seller with seller_id', () => {
      const payload = {
        user_id: 'user_456',
        email: 'seller@example.com',
        role: 'seller' as const,
        seller_id: 'seller_789'
      }
      const token = generateAccessToken(payload)

      mockReq.headers = {
        authorization: `Bearer ${token}`
      }

      authenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockReq.user).toBeDefined()
      expect(mockReq.user?.seller_id).toBe('seller_789')
      expect(mockNext).toHaveBeenCalled()
    })

    it('should reject request without authorization header', () => {
      mockReq.headers = {}

      authenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Authentication required',
        error: 'No access token provided'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request with invalid token format', () => {
      mockReq.headers = {
        authorization: 'InvalidToken'
      }

      authenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request with malformed Bearer token', () => {
      mockReq.headers = {
        authorization: 'Bearer invalid.token.here'
      }

      authenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication failed'
        })
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request with empty Bearer token', () => {
      mockReq.headers = {
        authorization: 'Bearer '
      }

      authenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('optionalAuthenticate', () => {
    it('should attach user if valid token provided', () => {
      const payload = {
        user_id: 'user_123',
        email: 'test@example.com',
        role: 'buyer' as const
      }
      const token = generateAccessToken(payload)

      mockReq.headers = {
        authorization: `Bearer ${token}`
      }

      optionalAuthenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockReq.user).toBeDefined()
      expect(mockReq.user?.user_id).toBe('user_123')
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should continue without user if no token provided', () => {
      mockReq.headers = {}

      optionalAuthenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockReq.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    it('should continue without user if invalid token provided', () => {
      mockReq.headers = {
        authorization: 'Bearer invalid.token'
      }

      optionalAuthenticate(
        mockReq as AuthenticatedRequest,
        mockRes as MedusaResponse,
        mockNext
      )

      expect(mockReq.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })
  })
})
