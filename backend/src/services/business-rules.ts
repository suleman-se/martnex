/**
 * Business Rules Service
 * 
 * Implements marketplace-level business rules:
 * - Payout thresholds and limits
 * - Rate limiting
 * - Commission calculation rules
 * - Seller restrictions
 */

/**
 * Business Rules Configuration
 * 
 * These are the core business rules for the marketplace
 * Can be moved to environment variables for dynamic configuration
 */
export const BUSINESS_RULES = {
  // Payout rules
  PAYOUT: {
    MIN_AMOUNT: 10, // Minimum payout amount ($10)
    MAX_AMOUNT: 50000, // Maximum payout amount ($50,000)
    MIN_THRESHOLD_TO_REQUEST: 25, // Must have $25+ in approved commissions
    DAYS_BETWEEN_PAYOUTS: 7, // Can request payout max once every 7 days
  },

  // Commission rules
  COMMISSION: {
    MIN_RATE: 0, // Platform takes 0% minimum
    MAX_RATE: 100, // Platform takes max 100%
    DEFAULT_RATE: 10, // Default 10% platform commission
    CATEGORY_RATE_OVERRIDE: true, // Allow different rates per category
    SELLER_RATE_OVERRIDE: true, // Allow sellers to have custom rates
  },

  // Seller rules
  SELLER: {
    MAX_PENDING_APPLICATIONS: 1, // Customer can only have 1 pending seller app
    VERIFICATION_EXPIRY_DAYS: 365, // Seller verification expires yearly
    SUSPENSION_AUTO_LIFT_DAYS: 30, // Auto-lift suspension after 30 days (if no new violations)
    RATING_THRESHOLD_FOR_WARNINGS: 3.0, // If rating < 3.0, flag for review
  },

  // Order rules
  ORDER: {
    AUTO_RELEASE_COMMISSION_DAYS: 30, // Auto-approve commissions after 30 days if no disputes
  },

  // Account rules
  ACCOUNT: {
    MAX_FAILED_PAYOUTS: 3, // Account flagged after 3 failed payout attempts
    FRAUD_SUSPICION_TRANSACTIONS: 10, // Flag if >10 chargebacks
  },
}

/**
 * Rate Limiter Service
 * 
 * Prevents abuse of payout requests, seller registrations, etc.
 */
export class RateLimiter {
  private static limits = new Map<string, { count: number; resetTime: number }>()

  /**
   * Check if action is rate limited
   * 
   * @param key - Unique identifier (e.g., "seller_123_payout_request")
   * @param maxAttempts - Max attempts allowed
   * @param windowSeconds - Time window in seconds
   * @returns { allowed: boolean, remaining: number, resetAt: Date }
   */
  static checkLimit(
    key: string,
    maxAttempts: number,
    windowSeconds: number
  ): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now()
    const existing = this.limits.get(key)

    if (!existing || now > existing.resetTime) {
      // Reset or create new limit
      const resetTime = now + windowSeconds * 1000
      this.limits.set(key, { count: 1, resetTime })
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: new Date(resetTime),
      }
    }

    if (existing.count >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.resetTime),
      }
    }

    existing.count++
    return {
      allowed: true,
      remaining: maxAttempts - existing.count,
      resetAt: new Date(existing.resetTime),
    }
  }

  /**
   * Reset limit (useful for testing)
   */
  static resetLimit(key: string) {
    this.limits.delete(key)
  }
}

/**
 * Payout Eligibility Checker
 * 
 * Determines if a seller can request a payout
 */
export class PayoutEligibility {
  /**
   * Check if seller can request payout
   */
  static canRequestPayout(seller: any, lastPayoutDate?: Date): {
    eligible: boolean;
    reasons: string[];
  } {
    const reasons: string[] = []

    // Check seller status
    if (seller.verification_status !== "verified") {
      reasons.push("Seller must be verified to request payouts")
    }

    if (!seller.is_active) {
      reasons.push("Seller account is not active")
    }

    // Check payout frequency
    if (lastPayoutDate) {
      const daysSinceLastPayout = Math.floor(
        (Date.now() - lastPayoutDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceLastPayout < BUSINESS_RULES.PAYOUT.DAYS_BETWEEN_PAYOUTS) {
        reasons.push(
          `Must wait ${BUSINESS_RULES.PAYOUT.DAYS_BETWEEN_PAYOUTS - daysSinceLastPayout} more days before requesting another payout`
        )
      }
    }

    // Check failed payout count
    if (seller.failed_payout_count >= BUSINESS_RULES.ACCOUNT.MAX_FAILED_PAYOUTS) {
      reasons.push(
        `Seller account has too many failed payouts (${seller.failed_payout_count}/${BUSINESS_RULES.ACCOUNT.MAX_FAILED_PAYOUTS})`
      )
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    }
  }

  /**
   * Check if amount is within allowed range
   */
  static isAmountValid(amount: number): { valid: boolean; reason?: string } {
    if (amount < BUSINESS_RULES.PAYOUT.MIN_AMOUNT) {
      return {
        valid: false,
        reason: `Minimum payout amount is $${BUSINESS_RULES.PAYOUT.MIN_AMOUNT}`,
      }
    }

    if (amount > BUSINESS_RULES.PAYOUT.MAX_AMOUNT) {
      return {
        valid: false,
        reason: `Maximum payout amount is $${BUSINESS_RULES.PAYOUT.MAX_AMOUNT}`,
      }
    }

    return { valid: true }
  }
}

/**
 * Commission Calculation Helper
 * 
 * Determines appropriate commission rate for a transaction
 */
export class CommissionCalculator {
  /**
   * Get commission rate for a transaction
   * 
   * Priority: Seller rate > Category rate > Global rate
   */
  static getCommissionRate(
    seller: any,
    category?: any,
    lineItem?: any
  ): number {
    // Seller override
    if (seller.commission_rate !== undefined && seller.commission_rate !== null) {
      return Math.min(seller.commission_rate, BUSINESS_RULES.COMMISSION.MAX_RATE)
    }

    // Category override
    if (category?.commission_rate !== undefined) {
      return Math.min(
        category.commission_rate,
        BUSINESS_RULES.COMMISSION.MAX_RATE
      )
    }

    // Global default
    return BUSINESS_RULES.COMMISSION.DEFAULT_RATE
  }

  /**
   * Calculate commission amounts for a line item
   */
  static calculateCommission(lineItemTotal: number, commissionRate: number) {
    const commissionAmount = (lineItemTotal * commissionRate) / 100
    const sellerPayout = lineItemTotal - commissionAmount

    return {
      commissionAmount: Math.round(commissionAmount * 100) / 100, // Round to 2 decimals
      sellerPayout: Math.round(sellerPayout * 100) / 100,
      platformRevenue: Math.round(commissionAmount * 100) / 100,
    }
  }
}

/**
 * Seller Risk Scoring
 * 
 * Calculates risk score for sellers (for fraud detection, phase 3+)
 */
export class SellerRiskScorer {
  /**
   * Calculate risk score (0-100, higher = riskier)
   * 
   * TODO: Implement full risk scoring in Phase 3 with ML
   */
  static calculateRiskScore(seller: any): {
    score: number;
    level: "low" | "medium" | "high";
    flags: string[];
  } {
    const flags: string[] = []
    let score = 0

    // Check suspension history
    if (seller.suspension_count > 0) {
      score += 20
      flags.push(`${seller.suspension_count} previous suspensions`)
    }

    // Check rating
    if (seller.average_rating && seller.average_rating < 3.0) {
      score += 15
      flags.push(`Low rating: ${seller.average_rating}`)
    }

    // Check chargeback ratio
    if (seller.chargeback_count >= BUSINESS_RULES.ACCOUNT.FRAUD_SUSPICION_TRANSACTIONS) {
      score += 25
      flags.push(`High chargebacks: ${seller.chargeback_count}`)
    }

    // Check registration recency
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(seller.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceRegistration < 30) {
      score += 10
      flags.push("Very new seller")
    }

    const level: "low" | "medium" | "high" =
      score < 30 ? "low" : score < 60 ? "medium" : "high"

    return {
      score: Math.min(score, 100),
      level,
      flags,
    }
  }
}

export default {
  BUSINESS_RULES,
  RateLimiter,
  PayoutEligibility,
  CommissionCalculator,
  SellerRiskScorer,
}
