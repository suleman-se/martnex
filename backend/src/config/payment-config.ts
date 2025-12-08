/**
 * Payment Configuration
 *
 * Handles payment method availability logic, including
 * COD country restrictions and digital product checks.
 */

import { FEATURES } from './store-mode'

/**
 * Get allowed COD countries from environment
 * Returns array of ISO 3166-1 alpha-2 country codes
 */
export function getCodAllowedCountries(): string[] | '*' {
  const codCountries = process.env.COD_ALLOWED_COUNTRIES?.trim()

  // Not set or empty = all countries allowed
  if (!codCountries) {
    return '*'
  }

  // Wildcard = all countries
  if (codCountries === '*') {
    return '*'
  }

  // Parse comma-separated country codes
  return codCountries
    .split(',')
    .map(code => code.trim().toUpperCase())
    .filter(code => code.length === 2) // Valid ISO codes are 2 characters
}

/**
 * Check if COD is domestic only
 */
export function isCodDomesticOnly(): boolean {
  return process.env.COD_DOMESTIC_ONLY === 'true'
}

/**
 * Get domestic country code
 */
export function getDomesticCountry(): string | null {
  return process.env.DOMESTIC_COUNTRY?.trim().toUpperCase() || null
}

/**
 * Check if COD is available for a specific country
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'IN', 'US')
 * @returns boolean - true if COD is available
 */
export function isCodAvailableForCountry(countryCode: string): boolean {
  // COD not enabled at all
  if (!FEATURES.COD) {
    return false
  }

  const upperCountryCode = countryCode.toUpperCase()

  // Check domestic-only mode
  if (isCodDomesticOnly()) {
    const domesticCountry = getDomesticCountry()
    return domesticCountry ? upperCountryCode === domesticCountry : false
  }

  // Check allowed countries list
  const allowedCountries = getCodAllowedCountries()

  // All countries allowed
  if (allowedCountries === '*') {
    return true
  }

  // Check if country is in allowed list
  return allowedCountries.includes(upperCountryCode)
}

/**
 * Check if product is digital
 * Digital products cannot use COD
 *
 * @param product - Product object
 * @returns boolean - true if digital
 */
export function isDigitalProduct(product: any): boolean {
  return product?.is_digital === true || product?.type === 'digital'
}

/**
 * Check if cart contains any digital products
 *
 * @param cart - Cart object with items
 * @returns boolean - true if any item is digital
 */
export function hasDigitalProducts(cart: any): boolean {
  if (!cart?.items || !Array.isArray(cart.items)) {
    return false
  }

  return cart.items.some((item: any) =>
    isDigitalProduct(item.product || item.variant?.product)
  )
}

/**
 * Get available payment methods for checkout
 * Considers country, product type, and enabled features
 *
 * @param cart - Cart object
 * @param shippingAddress - Shipping address with country code
 * @returns Array of available payment method codes
 */
export function getAvailablePaymentMethods(
  cart: any,
  shippingAddress?: { country_code?: string }
): string[] {
  const methods: string[] = []

  // Online payment methods (always available if enabled)
  if (FEATURES.STRIPE) {
    methods.push('stripe')
  }

  if (FEATURES.PAYPAL) {
    methods.push('paypal')
  }

  if (FEATURES.BANK_TRANSFER) {
    methods.push('bank_transfer')
  }

  // COD requires additional checks
  if (FEATURES.COD) {
    const hasDigital = hasDigitalProducts(cart)
    const countryCode = shippingAddress?.country_code

    // COD not available for digital products
    if (hasDigital) {
      // Digital products detected, skip COD
    }
    // Check country restrictions
    else if (countryCode && !isCodAvailableForCountry(countryCode)) {
      // Country not allowed for COD
    }
    // COD available
    else {
      methods.push('cod')
    }
  }

  return methods
}

/**
 * Get COD availability message for customer
 * Helpful for showing why COD is not available
 */
export function getCodAvailabilityMessage(
  cart: any,
  shippingAddress?: { country_code?: string }
): { available: boolean; reason?: string } {
  if (!FEATURES.COD) {
    return {
      available: false,
      reason: 'Cash on Delivery is not enabled'
    }
  }

  // Check digital products
  if (hasDigitalProducts(cart)) {
    return {
      available: false,
      reason: 'Cash on Delivery is not available for digital products'
    }
  }

  // Check country restrictions
  const countryCode = shippingAddress?.country_code
  if (countryCode && !isCodAvailableForCountry(countryCode)) {
    const allowedCountries = getCodAllowedCountries()

    if (isCodDomesticOnly()) {
      const domesticCountry = getDomesticCountry()
      return {
        available: false,
        reason: `Cash on Delivery is only available for domestic orders (${domesticCountry})`
      }
    }

    if (allowedCountries !== '*') {
      return {
        available: false,
        reason: `Cash on Delivery is not available for ${countryCode}. Available in: ${allowedCountries.join(', ')}`
      }
    }
  }

  return { available: true }
}

/**
 * Configuration summary for logging
 */
export function getPaymentConfigSummary(): string {
  const methods: string[] = []

  if (FEATURES.STRIPE) methods.push('Stripe')
  if (FEATURES.PAYPAL) methods.push('PayPal')
  if (FEATURES.BANK_TRANSFER) methods.push('Bank Transfer')
  if (FEATURES.COD) methods.push('COD')

  let codInfo = ''
  if (FEATURES.COD) {
    if (isCodDomesticOnly()) {
      const country = getDomesticCountry()
      codInfo = `\n  COD: Domestic only (${country})`
    } else {
      const countries = getCodAllowedCountries()
      codInfo = countries === '*'
        ? '\n  COD: All countries'
        : `\n  COD: ${countries.join(', ')}`
    }
  }

  return `
Payment Methods:
  Enabled: ${methods.join(', ')}${codInfo}
`.trim()
}

// Export types for TypeScript
export interface PaymentAvailability {
  available: boolean
  reason?: string
}

export interface CheckoutContext {
  cart: any
  shippingAddress?: {
    country_code?: string
    [key: string]: any
  }
}
