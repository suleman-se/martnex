/**
 * Password Utilities Tests
 */

import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  generateSecureToken,
  shouldRehashPassword
} from '../password'

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'SecurePass123!'
      const hashed = await hashPassword(password)

      expect(hashed).toBeTypeOf('string')
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(50) // bcrypt hashes are ~60 chars
    })

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePass123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      // Different due to random salt
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePass123!'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(password, hashed)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'SecurePass123!'
      const wrongPassword = 'WrongPass456!'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(wrongPassword, hashed)
      expect(isValid).toBe(false)
    })

    it('should reject empty password', async () => {
      const password = 'SecurePass123!'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword('', hashed)
      expect(isValid).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = validatePassword('SecurePass123!')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject password too short', () => {
      const result = validatePassword('Short1!')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('at least')
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('securepass123!')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('uppercase')
    })

    it('should reject password without lowercase', () => {
      const result = validatePassword('SECUREPASS123!')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('lowercase')
    })

    it('should reject password without number', () => {
      const result = validatePassword('SecurePass!')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('number')
    })

    it('should reject password without special character', () => {
      const result = validatePassword('SecurePass123')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('special character')
    })

    it('should reject password too long', () => {
      const longPassword = 'A1!' + 'a'.repeat(130)
      const result = validatePassword(longPassword)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not exceed')
    })
  })

  describe('generateSecureToken', () => {
    it('should generate token of specified length', () => {
      const token = generateSecureToken(32)
      expect(token).toHaveLength(32)
    })

    it('should generate different tokens each time', () => {
      const token1 = generateSecureToken(32)
      const token2 = generateSecureToken(32)

      expect(token1).not.toBe(token2)
    })

    it('should only contain valid characters', () => {
      const token = generateSecureToken(100)
      const validChars = /^[A-Za-z0-9]+$/

      expect(validChars.test(token)).toBe(true)
    })

    it('should use default length if not specified', () => {
      const token = generateSecureToken()
      expect(token).toHaveLength(32) // Default length
    })
  })

  describe('shouldRehashPassword', () => {
    it('should return false for freshly hashed password', async () => {
      const password = 'SecurePass123!'
      const hashed = await hashPassword(password)

      const shouldRehash = shouldRehashPassword(hashed)
      expect(shouldRehash).toBe(false)
    })

    it('should return true for invalid hash format', () => {
      const invalidHash = 'not-a-valid-bcrypt-hash'

      const shouldRehash = shouldRehashPassword(invalidHash)
      expect(shouldRehash).toBe(true)
    })
  })
})
