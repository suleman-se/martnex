/**
 * Business Rules Service Tests
 *
 * Tests for rate limiting, payout eligibility, commission calculation, and risk scoring
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  RateLimiter,
  PayoutEligibility,
  CommissionCalculator,
  SellerRiskScorer,
  BUSINESS_RULES
} from '../business-rules'

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    RateLimiter.resetLimit('test-key')
  })

  it('should allow requests within limit', () => {
    const result1 = RateLimiter.checkLimit('test-key', 3, 60)
    expect(result1.allowed).toBe(true)
    expect(result1.remaining).toBe(2)

    const result2 = RateLimiter.checkLimit('test-key', 3, 60)
    expect(result2.allowed).toBe(true)
    expect(result2.remaining).toBe(1)

    const result3 = RateLimiter.checkLimit('test-key', 3, 60)
    expect(result3.allowed).toBe(true)
    expect(result3.remaining).toBe(0)
  })

  it('should block requests exceeding limit', () => {
    // Use up all 3 attempts
    RateLimiter.checkLimit('test-key', 3, 60)
    RateLimiter.checkLimit('test-key', 3, 60)
    RateLimiter.checkLimit('test-key', 3, 60)

    // 4th attempt should be blocked
    const result = RateLimiter.checkLimit('test-key', 3, 60)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should provide reset time for blocked requests', () => {
    RateLimiter.checkLimit('test-key', 1, 60)

    const result = RateLimiter.checkLimit('test-key', 1, 60)
    expect(result.allowed).toBe(false)
    expect(result.resetAt).toBeInstanceOf(Date)
    expect(result.resetAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('should reset limit manually', () => {
    RateLimiter.checkLimit('test-key', 1, 60)
    RateLimiter.checkLimit('test-key', 1, 60) // Blocked

    RateLimiter.resetLimit('test-key')

    const result = RateLimiter.checkLimit('test-key', 1, 60)
    expect(result.allowed).toBe(true)
  })

  it('should handle different keys independently', () => {
    const result1 = RateLimiter.checkLimit('key1', 1, 60)
    const result2 = RateLimiter.checkLimit('key2', 1, 60)

    expect(result1.allowed).toBe(true)
    expect(result2.allowed).toBe(true)
  })
})

describe('PayoutEligibility', () => {
  it('should allow payout for verified and active seller', () => {
    const seller = {
      verification_status: 'verified',
      is_active: true,
      failed_payout_count: 0
    }

    const result = PayoutEligibility.canRequestPayout(seller)
    expect(result.eligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it('should reject payout for unverified seller', () => {
    const seller = {
      verification_status: 'pending',
      is_active: true,
      failed_payout_count: 0
    }

    const result = PayoutEligibility.canRequestPayout(seller)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('Seller must be verified to request payouts')
  })

  it('should reject payout for inactive seller', () => {
    const seller = {
      verification_status: 'verified',
      is_active: false,
      failed_payout_count: 0
    }

    const result = PayoutEligibility.canRequestPayout(seller)
    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('Seller account is not active')
  })

  it('should enforce minimum days between payouts', () => {
    const seller = {
      verification_status: 'verified',
      is_active: true,
      failed_payout_count: 0
    }

    const lastPayoutDate = new Date()
    lastPayoutDate.setDate(lastPayoutDate.getDate() - 3) // 3 days ago

    const result = PayoutEligibility.canRequestPayout(seller, lastPayoutDate)
    expect(result.eligible).toBe(false)
    expect(result.reasons.some(r => r.includes('Must wait'))).toBe(true)
  })

  it('should allow payout after waiting period', () => {
    const seller = {
      verification_status: 'verified',
      is_active: true,
      failed_payout_count: 0
    }

    const lastPayoutDate = new Date()
    lastPayoutDate.setDate(lastPayoutDate.getDate() - 8) // 8 days ago (more than 7)

    const result = PayoutEligibility.canRequestPayout(seller, lastPayoutDate)
    expect(result.eligible).toBe(true)
  })

  it('should reject payout if too many failed attempts', () => {
    const seller = {
      verification_status: 'verified',
      is_active: true,
      failed_payout_count: 3
    }

    const result = PayoutEligibility.canRequestPayout(seller)
    expect(result.eligible).toBe(false)
    expect(result.reasons.some(r => r.includes('too many failed payouts'))).toBe(true)
  })

  it('should validate minimum payout amount', () => {
    const result = PayoutEligibility.isAmountValid(5)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Minimum payout amount')
  })

  it('should validate maximum payout amount', () => {
    const result = PayoutEligibility.isAmountValid(60000)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Maximum payout amount')
  })

  it('should accept valid payout amount', () => {
    const result = PayoutEligibility.isAmountValid(100)
    expect(result.valid).toBe(true)
  })
})

describe('CommissionCalculator', () => {
  it('should use global default rate when no overrides', () => {
    const seller = {}
    const rate = CommissionCalculator.getCommissionRate(seller)
    expect(rate).toBe(BUSINESS_RULES.COMMISSION.DEFAULT_RATE)
  })

  it('should use category rate over global rate', () => {
    const seller = {}
    const category = { commission_rate: 15 }

    const rate = CommissionCalculator.getCommissionRate(seller, category)
    expect(rate).toBe(15)
  })

  it('should use seller rate over category rate', () => {
    const seller = { commission_rate: 8 }
    const category = { commission_rate: 15 }

    const rate = CommissionCalculator.getCommissionRate(seller, category)
    expect(rate).toBe(8)
  })

  it('should cap commission rate at maximum', () => {
    const seller = { commission_rate: 150 }

    const rate = CommissionCalculator.getCommissionRate(seller)
    expect(rate).toBe(BUSINESS_RULES.COMMISSION.MAX_RATE)
  })

  it('should calculate commission correctly', () => {
    const result = CommissionCalculator.calculateCommission(100, 10)

    expect(result.commissionAmount).toBe(10)
    expect(result.sellerPayout).toBe(90)
    expect(result.platformRevenue).toBe(10)
  })

  it('should round commission to 2 decimals', () => {
    const result = CommissionCalculator.calculateCommission(99.99, 10)

    expect(result.commissionAmount).toBe(10)
    expect(result.sellerPayout).toBe(89.99)
  })
})

describe('SellerRiskScorer', () => {
  it('should score low risk for good seller', () => {
    const seller = {
      suspension_count: 0,
      average_rating: 4.5,
      chargeback_count: 0,
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
    }

    const result = SellerRiskScorer.calculateRiskScore(seller)
    expect(result.level).toBe('low')
    expect(result.score).toBeLessThan(30)
  })

  it('should increase score for previous suspensions', () => {
    const seller = {
      suspension_count: 2,
      average_rating: 4.5,
      chargeback_count: 0,
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    }

    const result = SellerRiskScorer.calculateRiskScore(seller)
    expect(result.score).toBeGreaterThanOrEqual(20)
    expect(result.flags).toContain('2 previous suspensions')
  })

  it('should increase score for low rating', () => {
    const seller = {
      suspension_count: 0,
      average_rating: 2.5,
      chargeback_count: 0,
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    }

    const result = SellerRiskScorer.calculateRiskScore(seller)
    expect(result.score).toBeGreaterThanOrEqual(15)
    expect(result.flags.some(f => f.includes('Low rating'))).toBe(true)
  })

  it('should increase score for high chargebacks', () => {
    const seller = {
      suspension_count: 0,
      average_rating: 4.5,
      chargeback_count: 15,
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    }

    const result = SellerRiskScorer.calculateRiskScore(seller)
    expect(result.score).toBeGreaterThanOrEqual(25)
    expect(result.flags.some(f => f.includes('High chargebacks'))).toBe(true)
  })

  it('should increase score for new sellers', () => {
    const seller = {
      suspension_count: 0,
      average_rating: 4.5,
      chargeback_count: 0,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    }

    const result = SellerRiskScorer.calculateRiskScore(seller)
    expect(result.score).toBeGreaterThanOrEqual(10)
    expect(result.flags).toContain('Very new seller')
  })

  it('should classify risk levels correctly', () => {
    const lowRiskSeller = {
      suspension_count: 0,
      average_rating: 4.5,
      chargeback_count: 0,
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    }

    const mediumRiskSeller = {
      suspension_count: 2,
      average_rating: 2.8,
      chargeback_count: 8,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago (new seller)
    }

    const highRiskSeller = {
      suspension_count: 3,
      average_rating: 2.0,
      chargeback_count: 15,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }

    expect(SellerRiskScorer.calculateRiskScore(lowRiskSeller).level).toBe('low')
    expect(SellerRiskScorer.calculateRiskScore(mediumRiskSeller).level).toBe('medium')
    expect(SellerRiskScorer.calculateRiskScore(highRiskSeller).level).toBe('high')
  })

  it('should cap score at 100', () => {
    const veryHighRiskSeller = {
      suspension_count: 10,
      average_rating: 1.0,
      chargeback_count: 100,
      created_at: new Date()
    }

    const result = SellerRiskScorer.calculateRiskScore(veryHighRiskSeller)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

describe('BUSINESS_RULES configuration', () => {
  it('should have valid payout rules', () => {
    expect(BUSINESS_RULES.PAYOUT.MIN_AMOUNT).toBeGreaterThan(0)
    expect(BUSINESS_RULES.PAYOUT.MAX_AMOUNT).toBeGreaterThan(BUSINESS_RULES.PAYOUT.MIN_AMOUNT)
    expect(BUSINESS_RULES.PAYOUT.MIN_THRESHOLD_TO_REQUEST).toBeGreaterThanOrEqual(BUSINESS_RULES.PAYOUT.MIN_AMOUNT)
    expect(BUSINESS_RULES.PAYOUT.DAYS_BETWEEN_PAYOUTS).toBeGreaterThan(0)
  })

  it('should have valid commission rules', () => {
    expect(BUSINESS_RULES.COMMISSION.MIN_RATE).toBe(0)
    expect(BUSINESS_RULES.COMMISSION.MAX_RATE).toBe(100)
    expect(BUSINESS_RULES.COMMISSION.DEFAULT_RATE).toBeGreaterThanOrEqual(BUSINESS_RULES.COMMISSION.MIN_RATE)
    expect(BUSINESS_RULES.COMMISSION.DEFAULT_RATE).toBeLessThanOrEqual(BUSINESS_RULES.COMMISSION.MAX_RATE)
  })

  it('should have valid seller rules', () => {
    expect(BUSINESS_RULES.SELLER.MAX_PENDING_APPLICATIONS).toBe(1)
    expect(BUSINESS_RULES.SELLER.VERIFICATION_EXPIRY_DAYS).toBeGreaterThan(0)
    expect(BUSINESS_RULES.SELLER.SUSPENSION_AUTO_LIFT_DAYS).toBeGreaterThan(0)
    expect(BUSINESS_RULES.SELLER.RATING_THRESHOLD_FOR_WARNINGS).toBeGreaterThan(0)
    expect(BUSINESS_RULES.SELLER.RATING_THRESHOLD_FOR_WARNINGS).toBeLessThanOrEqual(5)
  })
})
