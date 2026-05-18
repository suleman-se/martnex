/**
 * Seller Module Service Tests
 *
 * Uses vi.fn() mocks for all DB-facing methods so no real database
 * connections are made and no test data leaks into the database.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import SellerModuleService from '../service'

// ---------------------------------------------------------------------------
// Shared mock fixtures
// ---------------------------------------------------------------------------

const mockSeller = {
  id: 'sel_01',
  customer_id: 'cus_01',
  business_name: 'Test Shop',
  business_email: 'shop@example.com',
  verification_status: 'pending' as const,
  is_active: true,
  total_sales: 500,
  total_commission: 50,
  pending_payout: 100,
  commission_rate: null,
  created_at: new Date('2026-01-01'),
}

const mockVerifiedSeller = {
  ...mockSeller,
  id: 'sel_02',
  customer_id: 'cus_02',
  verification_status: 'verified' as const,
}

// Build a service instance whose DB-facing base methods are replaced by mocks.
const buildService = () => {
  const service = Object.create(SellerModuleService.prototype) as SellerModuleService
  service.createSellers = vi.fn()
  service.retrieveSeller = vi.fn()
  service.updateSellers = vi.fn()
  service.deleteSellers = vi.fn()
  service.listSellers = vi.fn()
  service.listAndCountSellers = vi.fn()
  return service
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SellerModuleService', () => {
  describe('getSellersByStatus', () => {
    it('lists sellers filtered by the given status', async () => {
      const service = buildService()
      vi.mocked(service.listSellers).mockResolvedValue([mockSeller])

      const result = await service.getSellersByStatus('pending')

      expect(service.listSellers).toHaveBeenCalledWith({ verification_status: 'pending' })
      expect(result).toHaveLength(1)
      expect(result[0].verification_status).toBe('pending')
    })

    it('returns an empty array when no sellers match', async () => {
      const service = buildService()
      vi.mocked(service.listSellers).mockResolvedValue([])

      const result = await service.getSellersByStatus('rejected')
      expect(result).toHaveLength(0)
    })
  })

  describe('getSellerByCustomerId', () => {
    it('returns the matching seller', async () => {
      const service = buildService()
      vi.mocked(service.listSellers).mockResolvedValue([mockSeller])

      const result = await service.getSellerByCustomerId('cus_01')

      expect(service.listSellers).toHaveBeenCalledWith({ customer_id: 'cus_01' })
      expect(result).toEqual(mockSeller)
    })

    it('returns null when customer has no seller profile', async () => {
      const service = buildService()
      vi.mocked(service.listSellers).mockResolvedValue([])

      const result = await service.getSellerByCustomerId('cus_unknown')
      expect(result).toBeNull()
    })
  })

  describe('approveSeller', () => {
    it('sets verification_status to verified with a timestamp', async () => {
      const service = buildService()
      const approved = { ...mockSeller, verification_status: 'verified', verified_at: new Date() }
      vi.mocked(service.updateSellers).mockResolvedValue(approved)

      const result = await service.approveSeller('sel_01', 'Documents verified')

      expect(service.updateSellers).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sel_01',
          verification_status: 'verified',
          verification_notes: 'Documents verified',
        })
      )
      expect(result.verification_status).toBe('verified')
    })

    it('uses default notes when none provided', async () => {
      const service = buildService()
      vi.mocked(service.updateSellers).mockResolvedValue(mockSeller)

      await service.approveSeller('sel_01')

      expect(service.updateSellers).toHaveBeenCalledWith(
        expect.objectContaining({ verification_notes: 'Approved by admin' })
      )
    })
  })

  describe('rejectSeller', () => {
    it('sets verification_status to rejected with the given reason', async () => {
      const service = buildService()
      vi.mocked(service.updateSellers).mockResolvedValue({ ...mockSeller, verification_status: 'rejected' })

      await service.rejectSeller('sel_01', 'Incomplete documentation')

      expect(service.updateSellers).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sel_01',
          verification_status: 'rejected',
          verification_notes: 'Incomplete documentation',
        })
      )
    })
  })

  describe('suspendSeller', () => {
    it('sets verification_status to suspended and deactivates the account', async () => {
      const service = buildService()
      vi.mocked(service.updateSellers).mockResolvedValue({
        ...mockSeller,
        verification_status: 'suspended',
        is_active: false,
      })

      await service.suspendSeller('sel_01', 'Policy violation')

      expect(service.updateSellers).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sel_01',
          verification_status: 'suspended',
          is_active: false,
        })
      )
    })
  })

  describe('reactivateSeller', () => {
    it('restores verified status and re-enables the account', async () => {
      const service = buildService()
      vi.mocked(service.updateSellers).mockResolvedValue({
        ...mockSeller,
        verification_status: 'verified',
        is_active: true,
      })

      await service.reactivateSeller('sel_01')

      expect(service.updateSellers).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sel_01',
          verification_status: 'verified',
          is_active: true,
        })
      )
    })
  })

  describe('updateFinancials', () => {
    it('accumulates financial amounts on top of existing values', async () => {
      const service = buildService()
      vi.mocked(service.retrieveSeller).mockResolvedValue(mockSeller)
      vi.mocked(service.updateSellers).mockResolvedValue(mockSeller)

      await service.updateFinancials('sel_01', { salesAmount: 100, commissionAmount: 10 })

      expect(service.updateSellers).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sel_01',
          total_sales: 600,      // 500 + 100
          total_commission: 60,  // 50 + 10
          pending_payout: 100,   // unchanged (no pendingPayoutAmount provided)
        })
      )
    })

    it('defaults missing amounts to 0 without modifying existing values', async () => {
      const service = buildService()
      vi.mocked(service.retrieveSeller).mockResolvedValue(mockSeller)
      vi.mocked(service.updateSellers).mockResolvedValue(mockSeller)

      await service.updateFinancials('sel_01', {})

      expect(service.updateSellers).toHaveBeenCalledWith(
        expect.objectContaining({ total_sales: 500, total_commission: 50 })
      )
    })
  })

  describe('getSellerEarnings', () => {
    it('returns a correct earnings breakdown', async () => {
      const service = buildService()
      vi.mocked(service.retrieveSeller).mockResolvedValue(mockSeller)

      const result = await service.getSellerEarnings('sel_01')

      expect(result.seller_id).toBe('sel_01')
      expect(result.total_sales).toBe(500)
      expect(result.platform_commission).toBe(50)
      expect(result.seller_earnings).toBe(450)        // 500 - 50
      expect(result.pending_payout).toBe(100)
      expect(result.available_for_payout).toBe(350)  // 450 - 100
    })

    it('handles a seller with no sales history', async () => {
      const service = buildService()
      vi.mocked(service.retrieveSeller).mockResolvedValue({
        ...mockSeller,
        total_sales: 0,
        total_commission: 0,
        pending_payout: 0,
      })

      const result = await service.getSellerEarnings('sel_01')

      expect(result.seller_earnings).toBe(0)
      expect(result.available_for_payout).toBe(0)
    })
  })

  describe('canListProducts', () => {
    it('returns true for a verified and active seller', async () => {
      const service = buildService()
      vi.mocked(service.retrieveSeller).mockResolvedValue(mockVerifiedSeller)

      expect(await service.canListProducts('sel_02')).toBe(true)
    })

    it('returns false for a pending seller', async () => {
      const service = buildService()
      vi.mocked(service.retrieveSeller).mockResolvedValue(mockSeller)

      expect(await service.canListProducts('sel_01')).toBe(false)
    })

    it('returns false for a suspended seller', async () => {
      const service = buildService()
      vi.mocked(service.retrieveSeller).mockResolvedValue({
        ...mockVerifiedSeller,
        verification_status: 'suspended',
        is_active: false,
      })

      expect(await service.canListProducts('sel_02')).toBe(false)
    })
  })

  describe('getActiveSellerCount', () => {
    it('returns the count of verified active sellers', async () => {
      const service = buildService()
      vi.mocked(service.listAndCountSellers).mockResolvedValue([[mockVerifiedSeller], 1])

      const count = await service.getActiveSellerCount()

      expect(service.listAndCountSellers).toHaveBeenCalledWith({
        verification_status: 'verified',
        is_active: true,
      })
      expect(count).toBe(1)
    })

    it('returns 0 when no active sellers exist', async () => {
      const service = buildService()
      vi.mocked(service.listAndCountSellers).mockResolvedValue([[], 0])

      expect(await service.getActiveSellerCount()).toBe(0)
    })
  })
})
