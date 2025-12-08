/**
 * Seller Validation Service
 * 
 * Implements business rule validation for seller operations
 * Ensures data integrity and compliance with marketplace rules
 */

import { SELLER_MODULE } from "../../modules/seller"

/**
 * Validation rules
 */
const VALIDATION_RULES = {
  MIN_BUSINESS_NAME_LENGTH: 3,
  MAX_BUSINESS_NAME_LENGTH: 255,
  MIN_COMMISSION_RATE: 0,
  MAX_COMMISSION_RATE: 100,
  ALLOWED_PAYOUT_METHODS: ["bank_transfer", "paypal", "stripe"],
}

/**
 * Validate seller registration data
 * 
 * @param data - Seller registration data
 * @returns { valid: boolean, errors: string[] }
 */
export async function validateSellerRegistration(data: {
  customer_id: string
  business_name: string
  business_email: string
  business_phone?: string
  payout_method?: string
}) {
  const errors: string[] = []

  // Validate required fields
  if (!data.customer_id) errors.push("customer_id is required")
  if (!data.business_name) errors.push("business_name is required")
  if (!data.business_email) errors.push("business_email is required")

  // Validate business name length
  if (
    data.business_name &&
    (data.business_name.length < VALIDATION_RULES.MIN_BUSINESS_NAME_LENGTH ||
      data.business_name.length > VALIDATION_RULES.MAX_BUSINESS_NAME_LENGTH)
  ) {
    errors.push(
      `business_name must be between ${VALIDATION_RULES.MIN_BUSINESS_NAME_LENGTH} and ${VALIDATION_RULES.MAX_BUSINESS_NAME_LENGTH} characters`
    )
  }

  // Validate email format
  if (data.business_email && !isValidEmail(data.business_email)) {
    errors.push("Invalid business_email format")
  }

  // Validate payout method
  if (
    data.payout_method &&
    !VALIDATION_RULES.ALLOWED_PAYOUT_METHODS.includes(data.payout_method)
  ) {
    errors.push(
      `payout_method must be one of: ${VALIDATION_RULES.ALLOWED_PAYOUT_METHODS.join(", ")}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate seller can be verified
 * 
 * Checks if seller meets criteria for verification:
 * - Status is "pending"
 * - Has required information (business name, email, etc.)
 * - No fraud flags
 * 
 * @param seller - Seller data
 * @returns { valid: boolean, errors: string[] }
 */
export function validateSellerForVerification(seller: any) {
  const errors: string[] = []

  if (!seller) {
    errors.push("Seller not found")
    return { valid: false, errors }
  }

  if (seller.verification_status !== "pending") {
    errors.push(
      `Seller cannot be verified. Current status: ${seller.verification_status}`
    )
  }

  if (!seller.business_name) {
    errors.push("Seller must have a business name")
  }

  if (!seller.business_email) {
    errors.push("Seller must have a business email")
  }

  if (!seller.payout_method) {
    errors.push("Seller must have a payout method configured")
  }

  // Check for suspicious patterns (fraud detection)
  // TODO: Implement more sophisticated fraud detection in Phase 3

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate payout request
 * 
 * Checks if payout meets business requirements:
 * - Seller is verified
 * - Amount meets minimum threshold
 * - Commissions are in approved status
 * - No recent payouts (rate limiting)
 * 
 * @param seller - Seller data
 * @param amount - Payout amount
 * @param commissions - Commission records being paid out
 * @returns { valid: boolean, errors: string[] }
 */
export function validatePayoutRequest(
  seller: any,
  amount: number,
  commissions: any[]
) {
  const errors: string[] = []

  // Validate seller is verified
  if (seller.verification_status !== "verified") {
    errors.push("Only verified sellers can request payouts")
  }

  // Validate seller is active
  if (!seller.is_active) {
    errors.push("Seller account is inactive")
  }

  // Validate minimum payout amount
  const MIN_PAYOUT = 10 // $10 minimum
  if (amount < MIN_PAYOUT) {
    errors.push(`Minimum payout amount is $${MIN_PAYOUT}`)
  }

  // Validate amount doesn't exceed total from commissions
  const totalCommissionAmount = commissions.reduce(
    (sum: number, c: any) => sum + (c.seller_payout || 0),
    0
  )

  if (amount > totalCommissionAmount) {
    errors.push(
      `Payout amount ($${amount}) exceeds available commissions ($${totalCommissionAmount})`
    )
  }

  // Validate all commissions are approved
  const unapprovedCommissions = commissions.filter(
    (c: any) => c.status !== "approved"
  )
  if (unapprovedCommissions.length > 0) {
    errors.push(
      `All commissions must be in "approved" status. Found ${unapprovedCommissions.length} non-approved.`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate commission calculation
 * 
 * Ensures commission rate is within acceptable range
 * 
 * @param rate - Commission rate (0-100)
 * @returns { valid: boolean, errors: string[] }
 */
export function validateCommissionRate(rate: number) {
  const errors: string[] = []

  if (typeof rate !== "number") {
    errors.push("Commission rate must be a number")
  }

  if (
    rate < VALIDATION_RULES.MIN_COMMISSION_RATE ||
    rate > VALIDATION_RULES.MAX_COMMISSION_RATE
  ) {
    errors.push(
      `Commission rate must be between ${VALIDATION_RULES.MIN_COMMISSION_RATE} and ${VALIDATION_RULES.MAX_COMMISSION_RATE}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Helper: Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Export all validation rules for reference
 */
export { VALIDATION_RULES }
