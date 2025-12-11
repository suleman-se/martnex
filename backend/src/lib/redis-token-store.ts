/**
 * Redis Token Store
 *
 * Manages refresh token storage and revocation using Redis.
 * Provides secure token lifecycle management for authentication.
 */

import Redis from 'ioredis'

/**
 * RedisTokenStore Class
 *
 * Handles refresh token storage in Redis with automatic expiration.
 * Each user can have multiple active refresh tokens (multiple devices).
 */
export class RedisTokenStore {
  private redis: Redis

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379')
  }

  /**
   * Store refresh token in Redis
   *
   * @param userId - User/Customer ID
   * @param tokenId - Unique token identifier
   * @param expiresIn - Expiration time in seconds (default: 7 days)
   *
   * @example
   * await redisTokenStore.storeRefreshToken('user_123', 'token_abc', 604800)
   */
  async storeRefreshToken(
    userId: string,
    tokenId: string,
    expiresIn: number = 604800 // 7 days in seconds
  ): Promise<void> {
    const key = this.getTokenKey(userId, tokenId)
    const value = JSON.stringify({
      userId,
      tokenId,
      createdAt: new Date().toISOString(),
    })

    // Store with automatic expiration
    await this.redis.setex(key, expiresIn, value)
  }

  /**
   * Get refresh token from Redis
   *
   * @param userId - User/Customer ID
   * @param tokenId - Unique token identifier
   * @returns Token data if exists and not expired, null otherwise
   *
   * @example
   * const token = await redisTokenStore.getRefreshToken('user_123', 'token_abc')
   * if (token) {
   *   // Token is valid
   * }
   */
  async getRefreshToken(userId: string, tokenId: string): Promise<{
    userId: string
    tokenId: string
    createdAt: string
  } | null> {
    const key = this.getTokenKey(userId, tokenId)
    const value = await this.redis.get(key)

    if (!value) {
      return null
    }

    return JSON.parse(value)
  }

  /**
   * Revoke (delete) a specific refresh token
   *
   * @param userId - User/Customer ID
   * @param tokenId - Unique token identifier
   *
   * @example
   * await redisTokenStore.revokeRefreshToken('user_123', 'token_abc')
   */
  async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    const key = this.getTokenKey(userId, tokenId)
    await this.redis.del(key)
  }

  /**
   * Revoke all refresh tokens for a user
   *
   * Useful when:
   * - Password is changed
   * - Account is compromised
   * - User logs out from all devices
   *
   * @param userId - User/Customer ID
   *
   * @example
   * await redisTokenStore.revokeAllUserTokens('user_123')
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    const pattern = `refresh_token:${userId}:*`
    const keys = await this.redis.keys(pattern)

    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  /**
   * Check if a refresh token exists and is valid
   *
   * @param userId - User/Customer ID
   * @param tokenId - Unique token identifier
   * @returns true if token exists, false otherwise
   *
   * @example
   * const isValid = await redisTokenStore.isTokenValid('user_123', 'token_abc')
   */
  async isTokenValid(userId: string, tokenId: string): Promise<boolean> {
    const token = await this.getRefreshToken(userId, tokenId)
    return token !== null
  }

  /**
   * Get all active token IDs for a user
   *
   * Useful for listing active sessions.
   *
   * @param userId - User/Customer ID
   * @returns Array of token IDs
   *
   * @example
   * const tokens = await redisTokenStore.getUserTokens('user_123')
   * console.log(`User has ${tokens.length} active sessions`)
   */
  async getUserTokens(userId: string): Promise<string[]> {
    const pattern = `refresh_token:${userId}:*`
    const keys = await this.redis.keys(pattern)

    return keys.map(key => {
      const parts = key.split(':')
      return parts[parts.length - 1] // Extract token ID
    })
  }

  /**
   * Get the number of active tokens for a user
   *
   * @param userId - User/Customer ID
   * @returns Number of active tokens
   */
  async getUserTokenCount(userId: string): Promise<number> {
    const pattern = `refresh_token:${userId}:*`
    const keys = await this.redis.keys(pattern)
    return keys.length
  }

  /**
   * Generate Redis key for a token
   *
   * Format: refresh_token:{userId}:{tokenId}
   */
  private getTokenKey(userId: string, tokenId: string): string {
    return `refresh_token:${userId}:${tokenId}`
  }

  /**
   * Close Redis connection
   *
   * Call this when shutting down the application.
   */
  async close(): Promise<void> {
    await this.redis.quit()
  }
}

/**
 * Singleton instance for the application
 */
let redisTokenStoreInstance: RedisTokenStore | null = null

/**
 * Get or create RedisTokenStore instance
 *
 * @example
 * import { getRedisTokenStore } from './lib/redis-token-store'
 *
 * const tokenStore = getRedisTokenStore()
 * await tokenStore.storeRefreshToken(userId, tokenId, 604800)
 */
export function getRedisTokenStore(): RedisTokenStore {
  if (!redisTokenStoreInstance) {
    redisTokenStoreInstance = new RedisTokenStore()
  }
  return redisTokenStoreInstance
}

/**
 * USAGE EXAMPLES:
 *
 * 1. Login - Store refresh token:
 * --------------------------------
 * const tokenId = generateSecureToken(16)
 * const tokenStore = getRedisTokenStore()
 * await tokenStore.storeRefreshToken(userId, tokenId, 604800)
 * const refreshToken = generateRefreshToken({ user_id: userId, token_id: tokenId })
 *
 * 2. Refresh - Validate and renew token:
 * ---------------------------------------
 * const decoded = verifyRefreshToken(refreshToken)
 * const tokenStore = getRedisTokenStore()
 * const isValid = await tokenStore.isTokenValid(decoded.user_id, decoded.token_id)
 * if (isValid) {
 *   // Generate new access token
 * }
 *
 * 3. Logout - Revoke specific token:
 * -----------------------------------
 * const decoded = verifyRefreshToken(refreshToken)
 * const tokenStore = getRedisTokenStore()
 * await tokenStore.revokeRefreshToken(decoded.user_id, decoded.token_id)
 *
 * 4. Password Reset - Revoke all tokens:
 * ---------------------------------------
 * const tokenStore = getRedisTokenStore()
 * await tokenStore.revokeAllUserTokens(userId)
 *
 * 5. List Active Sessions:
 * -------------------------
 * const tokenStore = getRedisTokenStore()
 * const tokens = await tokenStore.getUserTokens(userId)
 * console.log(`Active sessions: ${tokens.length}`)
 */
