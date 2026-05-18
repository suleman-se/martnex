/**
 * Payout Module Service Tests
 *
 * Uses vi.fn() mocks for all DB-facing methods so no real database
 * connections are made and no test data leaks into the database.
 */

import { describe, it, expect, vi } from 'vitest'
import PayoutModuleService from '../service'

// ---------------------------------------------------------------------------
// Shared mock fixtures
// ---------------------------------------------------------------------------

const mockPayout = {
  id: 'pay_01',
  seller_id: 'sel_01',
  amount: 450,
  currency_code: 'usd',
  commission_ids: ['com_01', 'com_02'] as unknown as Record<string, unknown>,
  status: 'requested' as const,
  payment_method: null,
  payment_reference: null,
  payment_metadata: null,
  requested_at: new Date('2026-05-01'),
  reviewed_at: null,
  approved_at: null,
  processing_at: null,
  completed_at: null,
  failed_at: null,
  cancelled_at: null,
  reviewed_by: null,
  admin_notes: null,
  failure_reason: null,
  retry_count: 0,
}

const buildService = () => {
  const service = Object.create(PayoutModuleService.prototype) as PayoutModuleService
  service.createPayouts = vi.fn()
  service.retrievePayout = vi.fn()
  service.updatePayouts = vi.fn()
  service.listPayouts = vi.fn()
  return service
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PayoutModuleService', () => {
  describe('createPayoutRequest', () => {
    it('creates a payout record in requested status', async () => {
      const service = buildService()
      vi.mocked(service.createPayouts).mockResolvedValue(mockPayout)

      const result = await service.createPayoutRequest({
        sellerId: 'sel_01',
        commissionIds: ['com_01', 'com_02'],
        amount: 450,
        currencyCode: 'usd',
      })

      expect(service.createPayouts).toHaveBeenCalledWith(
        expect.objectContaining({
          seller_id: 'sel_01',
          amount: 450,
          currency_code: 'usd',
          status: 'requested',
        })
      )
      expect(result.status).toBe('requested')
    })

    it('defaults currency_code to usd when not provided', async () => {
      const service = buildService()
      vi.mocked(service.createPayouts).mockResolvedValue(mockPayout)

      await service.createPayoutRequest({
        sellerId: 'sel_01',
        commissionIds: ['com_01'],
        amount: 100,
      })

      expect(service.createPayouts).toHaveBeenCalledWith(
        expect.objectContaining({ currency_code: 'usd' })
      )
    })
  })

  describe('getSellerPayouts', () => {
    it('filters payouts by seller_id', async () => {
      const service = buildService()
      vi.mocked(service.listPayouts).mockResolvedValue([mockPayout])

      await service.getSellerPayouts('sel_01')

      expect(service.listPayouts).toHaveBeenCalledWith(
        expect.objectContaining({ seller_id: 'sel_01' })
      )
    })

    it('applies status filter when provided', async () => {
      const service = buildService()
      vi.mocked(service.listPayouts).mockResolvedValue([])

      await service.getSellerPayouts('sel_01', { status: 'completed' })

      expect(service.listPayouts).toHaveBeenCalledWith(
        expect.objectContaining({ seller_id: 'sel_01', status: 'completed' })
      )
    })
  })

  describe('getPendingPayouts', () => {
    it('lists payouts with pending_review status', async () => {
      const service = buildService()
      vi.mocked(service.listPayouts).mockResolvedValue([mockPayout])

      await service.getPendingPayouts()

      expect(service.listPayouts).toHaveBeenCalledWith({ status: 'pending_review' })
    })
  })

  describe('approvePayout', () => {
    it('sets status to approved with reviewer metadata', async () => {
      const service = buildService()
      vi.mocked(service.updatePayouts).mockResolvedValue({
        ...mockPayout,
        status: 'approved',
        reviewed_by: 'admin_01',
        approved_at: new Date(),
      })

      const result = await service.approvePayout('pay_01', 'admin_01', 'Verified manually')

      expect(service.updatePayouts).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_01',
          status: 'approved',
          reviewed_by: 'admin_01',
          admin_notes: 'Verified manually',
        })
      )
      expect(result.status).toBe('approved')
    })
  })

  describe('cancelPayout', () => {
    it('sets status to cancelled with reason and reviewer', async () => {
      const service = buildService()
      vi.mocked(service.updatePayouts).mockResolvedValue({ ...mockPayout, status: 'cancelled' })

      await service.cancelPayout('pay_01', 'admin_01', 'Suspicious activity')

      expect(service.updatePayouts).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_01',
          status: 'cancelled',
          reviewed_by: 'admin_01',
          admin_notes: 'Suspicious activity',
        })
      )
    })
  })

  describe('startProcessing', () => {
    it('transitions status to processing with the payment method', async () => {
      const service = buildService()
      vi.mocked(service.updatePayouts).mockResolvedValue({ ...mockPayout, status: 'processing' })

      await service.startProcessing('pay_01', 'stripe')

      expect(service.updatePayouts).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_01',
          status: 'processing',
          payment_method: 'stripe',
        })
      )
    })
  })

  describe('completePayout', () => {
    it('marks payout completed and persists the payment reference', async () => {
      const service = buildService()
      vi.mocked(service.updatePayouts).mockResolvedValue({
        ...mockPayout,
        status: 'completed',
        payment_reference: 'txn_abc123',
      })

      const result = await service.completePayout('pay_01', 'txn_abc123', { provider: 'stripe' })

      expect(service.updatePayouts).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_01',
          status: 'completed',
          payment_reference: 'txn_abc123',
          payment_metadata: { provider: 'stripe' },
        })
      )
      expect(result.status).toBe('completed')
    })
  })

  describe('failPayout', () => {
    it('marks payout failed and increments retry_count', async () => {
      const service = buildService()
      vi.mocked(service.retrievePayout).mockResolvedValue(mockPayout) // retry_count: 0
      vi.mocked(service.updatePayouts).mockResolvedValue({ ...mockPayout, status: 'failed', retry_count: 1 })

      const result = await service.failPayout('pay_01', 'Insufficient funds')

      expect(service.updatePayouts).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_01',
          status: 'failed',
          failure_reason: 'Insufficient funds',
          retry_count: 1,
        })
      )
      expect(result.retry_count).toBe(1)
    })

    it('accumulates retry_count across multiple failures', async () => {
      const service = buildService()
      vi.mocked(service.retrievePayout).mockResolvedValue({ ...mockPayout, retry_count: 2 })
      vi.mocked(service.updatePayouts).mockResolvedValue({ ...mockPayout, retry_count: 3 })

      await service.failPayout('pay_01', 'Provider timeout')

      expect(service.updatePayouts).toHaveBeenCalledWith(
        expect.objectContaining({ retry_count: 3 })
      )
    })
  })
})
