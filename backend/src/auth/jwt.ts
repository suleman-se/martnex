/**
 * JWT Utilities
 *
 * Handles JWT token generation, validation, and decoding
 * for authentication in the Martnex marketplace.
 */

import jwt from 'jsonwebtoken'

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  user_id: string
  email: string
  role: 'buyer' | 'seller' | 'admin'
  seller_id?: string  // Only present if role is 'seller'
}

/**
 * Refresh Token Payload
 */
export interface RefreshTokenPayload {
  user_id: string
  token_id: string  // Unique ID to track and revoke tokens
}

/**
 * Get JWT secret from environment
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}

/**
 * Get refresh token secret from environment
 */
function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set')
  }
  return secret
}

/**
 * Generate access token (short-lived, 15 minutes)
 *
 * @param payload - User information to encode
 * @returns JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  const expiry = process.env.JWT_ACCESS_EXPIRY || '15m'

  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: expiry,
    issuer: 'martnex-api',
    audience: 'martnex-client'
  } as jwt.SignOptions)
}

/**
 * Generate refresh token (long-lived, 7 days)
 *
 * @param payload - Token tracking information
 * @returns JWT refresh token
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const expiry = process.env.JWT_REFRESH_EXPIRY || '7d'

  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: expiry,
    issuer: 'martnex-api',
    audience: 'martnex-client'
  } as jwt.SignOptions)
}

/**
 * Verify and decode access token
 *
 * @param token - JWT token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, getJWTSecret(), {
      issuer: 'martnex-api',
      audience: 'martnex-client'
    }) as JWTPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token')
    }
    throw error
  }
}

/**
 * Verify and decode refresh token
 *
 * @param token - Refresh token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, getRefreshSecret(), {
      issuer: 'martnex-api',
      audience: 'martnex-client'
    }) as RefreshTokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token')
    }
    throw error
  }
}

/**
 * Decode token without verification (for debugging)
 *
 * @param token - JWT token
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | RefreshTokenPayload | null {
  return jwt.decode(token) as JWTPayload | RefreshTokenPayload | null
}

/**
 * Extract token from Authorization header
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Check if token is expired (without verification)
 *
 * @param token - JWT token
 * @returns True if expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token) as any
  if (!decoded || !decoded.exp) return true

  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}
