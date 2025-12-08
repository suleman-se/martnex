/**
 * Password Utilities
 *
 * Handles password hashing and verification using bcrypt
 * with secure best practices.
 */

import bcrypt from 'bcrypt'

/**
 * Number of salt rounds for bcrypt hashing
 * Higher = more secure but slower
 * 12 rounds is a good balance for 2025
 */
const SALT_ROUNDS = 12

/**
 * Password requirements for validation
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true
}

/**
 * Hash a password using bcrypt
 *
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against its hash
 *
 * @param password - Plain text password to check
 * @param hashedPassword - Stored hashed password
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Validate password meets security requirements
 *
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePassword(password: string): {
  isValid: boolean
  error?: string
} {
  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
    }
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    return {
      isValid: false,
      error: `Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`
    }
  }

  // Check for uppercase letter
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter'
    }
  }

  // Check for lowercase letter
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter'
    }
  }

  // Check for number
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number'
    }
  }

  // Check for special character
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character'
    }
  }

  return { isValid: true }
}

/**
 * Generate a secure random token (for password reset, email verification)
 *
 * @param length - Token length (default: 32)
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''

  // Use crypto.randomInt for secure random generation
  const crypto = require('crypto')
  for (let i = 0; i < length; i++) {
    token += chars[crypto.randomInt(0, chars.length)]
  }

  return token
}

/**
 * Check if password needs rehashing (if salt rounds changed)
 *
 * @param hashedPassword - Stored hashed password
 * @returns True if password should be rehashed
 */
export function shouldRehashPassword(hashedPassword: string): boolean {
  try {
    const rounds = bcrypt.getRounds(hashedPassword)
    return rounds < SALT_ROUNDS
  } catch {
    // If we can't get rounds, assume it needs rehashing
    return true
  }
}
