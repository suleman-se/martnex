/**
 * Vitest Setup File
 * Sets up test environment and loads required environment variables
 */

import { beforeAll } from 'vitest'

beforeAll(() => {
  // Set required environment variables for tests
  process.env.JWT_SECRET = 'test-jwt-secret-key'
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key'
  process.env.JWT_ACCESS_EXPIRY = '15m'
  process.env.JWT_REFRESH_EXPIRY = '7d'
})
