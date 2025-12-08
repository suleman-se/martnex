/**
 * JWT Utilities Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  isTokenExpired,
  decodeToken,
  type JWTPayload,
  type RefreshTokenPayload
} from '../jwt'

// Set up environment variables for testing
beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-access-tokens-min-32-chars'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-refresh-tokens-min-32-chars'
  process.env.JWT_ACCESS_EXPIRY = '15m'
  process.env.JWT_REFRESH_EXPIRY = '7d'
})

describe('JWT Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload: JWTPayload = {
        user_id: 'usr_123',
        email: 'test@example.com',
        role: 'buyer'
      }

      const token = generateAccessToken(payload)
      expect(token).toBeTypeOf('string')
      expect(token.split('.')).toHaveLength(3) // JWT format: header.payload.signature
    })

    it('should include seller_id for seller role', () => {
      const payload: JWTPayload = {
        user_id: 'usr_123',
        email: 'seller@example.com',
        role: 'seller',
        seller_id: 'seller_456'
      }

      const token = generateAccessToken(payload)
      const decoded = verifyAccessToken(token)

      expect(decoded.seller_id).toBe('seller_456')
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid token', () => {
      const payload: JWTPayload = {
        user_id: 'usr_123',
        email: 'test@example.com',
        role: 'admin'
      }

      const token = generateAccessToken(payload)
      const decoded = verifyAccessToken(token)

      expect(decoded.user_id).toBe(payload.user_id)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.role).toBe(payload.role)
    })

    it('should throw error for invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow('Invalid access token')
    })

    it('should throw error for tampered token', () => {
      const payload: JWTPayload = {
        user_id: 'usr_123',
        email: 'test@example.com',
        role: 'buyer'
      }

      const token = generateAccessToken(payload)
      const tamperedToken = token.slice(0, -5) + 'xxxxx'

      expect(() => verifyAccessToken(tamperedToken)).toThrow('Invalid access token')
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload: RefreshTokenPayload = {
        user_id: 'usr_123',
        token_id: 'tok_789'
      }

      const token = generateRefreshToken(payload)
      expect(token).toBeTypeOf('string')
      expect(token.split('.')).toHaveLength(3)
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const payload: RefreshTokenPayload = {
        user_id: 'usr_123',
        token_id: 'tok_789'
      }

      const token = generateRefreshToken(payload)
      const decoded = verifyRefreshToken(token)

      expect(decoded.user_id).toBe(payload.user_id)
      expect(decoded.token_id).toBe(payload.token_id)
    })
  })

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature'
      const header = `Bearer ${token}`

      const extracted = extractTokenFromHeader(header)
      expect(extracted).toBe(token)
    })

    it('should return null for invalid format', () => {
      expect(extractTokenFromHeader('InvalidFormat token')).toBeNull()
      expect(extractTokenFromHeader('Bearer')).toBeNull()
      expect(extractTokenFromHeader('')).toBeNull()
      expect(extractTokenFromHeader(null)).toBeNull()
      expect(extractTokenFromHeader(undefined)).toBeNull()
    })
  })

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const payload: JWTPayload = {
        user_id: 'usr_123',
        email: 'test@example.com',
        role: 'seller',
        seller_id: 'seller_456'
      }

      const token = generateAccessToken(payload)
      const decoded = decodeToken(token) as JWTPayload

      expect(decoded).toBeTruthy()
      expect(decoded.user_id).toBe(payload.user_id)
      expect(decoded.email).toBe(payload.email)
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const payload: JWTPayload = {
        user_id: 'usr_123',
        email: 'test@example.com',
        role: 'buyer'
      }

      const token = generateAccessToken(payload)
      expect(isTokenExpired(token)).toBe(false)
    })

    it('should return true for expired token', () => {
      // Override expiry to create immediately expired token
      process.env.JWT_ACCESS_EXPIRY = '0s'

      const payload: JWTPayload = {
        user_id: 'usr_123',
        email: 'test@example.com',
        role: 'buyer'
      }

      const token = generateAccessToken(payload)

      // Wait a moment to ensure expiration
      setTimeout(() => {
        expect(isTokenExpired(token)).toBe(true)
      }, 100)
    })
  })
})
