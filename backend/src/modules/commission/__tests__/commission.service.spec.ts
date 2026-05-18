/**
 * Commission Module Service Tests
 *
 * Uses vi.fn() mocks for all DB-facing methods so no real database
 * connections are made and no test data leaks into the database.
 */

import { describe, it, expect, vi } from 'vitest'
import CommissionModuleService from '../service'

// ---------------------------------------------------------------------------
// Shared mock fixtures
// ---------------------------------------------------------------------------

const mockCommission = {
  id: 'com_01',
  order_id: 'order_01',
  line_item_id: 'item_01',
  seller_id: 'sel_01',
  product_id: 'prod_01',
  product_title: 'Test Widget',
  variant_id: null,
  line_item_total: 100,
  quantity: 1,
  commission_rate: 10,
  commission_amount: 10,
  seller_payout: 90,
  currency_code: 'usd',
  status: 'pending' as const,
  approved_at: null,
  paid_at: null,
  disputed_at: null,
  cancelled_at: null,
  notes: null,
}

const buildService = () => {
  const service = Object.create(CommissionModuleService.prototype) as CommissionModuleService
  service.createCommissions = vi.fn()
  service.retrieveCommission = vi.fn()
  service.updateCommissions = vi.fn()
  service.listCommissions = vi.fn()
  return service
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CommissionModuleService', () => {
  describe('calculateCommission', () => {
    it('computes amounts correctly and persists a commission record', async () => {
      const service = buildService()
      vi.mocked(service.createCommissions).mockResolvedValue(mockCommission)

      const result = await service.calculateCommission({
        orderId: 'order_01',
        lineItemId: 'item_01',
        sellerId: 'sel_01',
        productId: 'prod_01',
        productTitle: 'Test Widget',
        lineItemTotal: 100,
        quantity: 1,
        commissionRate: 10,
        currencyCode: 'usd',
      })

      expect(service.createCommissions).toHaveBeenCalledWith(
        expect.objectContaining({
          commission_amount: 10,  // 100 * 10 / 100
          seller_payout: 90,      // 100 - 10
          status: 'pending',
        })
      )
      expect(result.commission_amount).toBe(10)
      expect(result.seller_payout).toBe(90)
    })

    it('defaults currency_code to usd when not provided', async () => {
      const service = buildService()
      vi.mocked(service.createCommissions).mockResolvedValue(mockCommission)

      await service.calculateCommission({
        orderId: 'order_02',
        lineItemId: 'item_02',
        sellerId: 'sel_01',
        lineItemTotal: 50,
        quantity: 2,
        commissionRate: 15,
      })

      expect(service.createCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ currency_code: 'usd' })
      )
    })

    it('passes raw (unrounded) amounts to createCommissions', async () => {
      const service = buildService()
      vi.mocked(service.createCommissions).mockResolvedValue(mockCommission)

      await service.calculateCommission({
        orderId: 'order_03',
        lineItemId: 'item_03',
        sellerId: 'sel_01',
        lineItemTotal: 99.99,
        quantity: 1,
        commissionRate: 10,
      })

      // The service layer does not round — rounding lives in CommissionCalculator
      // (business-rules.ts). Expectation matches raw floating-point arithmetic.
      expect(service.createCommissions).toHaveBeenCalledWith(
        expect.objectContaining({
          commission_amount: 9.999,   // 99.99 * 10 / 100
          seller_payout: 89.991,      // 99.99 - 9.999
        })
      )
    })
  })

  describe('getSellerCommissions', () => {
    it('filters by seller_id', async () => {
      const service = buildService()
      vi.mocked(service.listCommissions).mockResolvedValue([mockCommission])

      await service.getSellerCommissions('sel_01')

      expect(service.listCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ seller_id: 'sel_01' })
      )
    })

    it('adds a status filter when provided', async () => {
      const service = buildService()
      vi.mocked(service.listCommissions).mockResolvedValue([])

      await service.getSellerCommissions('sel_01', { status: 'approved' })

      expect(service.listCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ seller_id: 'sel_01', status: 'approved' })
      )
    })
  })

  describe('approveCommission', () => {
    it('updates status to approved and sets approved_at', async () => {
      const service = buildService()
      vi.mocked(service.updateCommissions).mockResolvedValue({
        ...mockCommission,
        status: 'approved',
        approved_at: new Date(),
      })

      await service.approveCommission('com_01')

      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'com_01', status: 'approved' })
      )
    })
  })

  describe('markAsPaid', () => {
    it('updates status to paid and sets paid_at', async () => {
      const service = buildService()
      vi.mocked(service.updateCommissions).mockResolvedValue({
        ...mockCommission,
        status: 'paid',
        paid_at: new Date(),
      })

      await service.markAsPaid('com_01')

      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'com_01', status: 'paid' })
      )
    })
  })

  describe('disputeCommission', () => {
    it('updates status to disputed with custom notes', async () => {
      const service = buildService()
      vi.mocked(service.updateCommissions).mockResolvedValue({ ...mockCommission, status: 'disputed' })

      await service.disputeCommission('com_01', 'Product not as described')

      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'com_01',
          status: 'disputed',
          notes: 'Product not as described',
        })
      )
    })

    it('uses default notes when none provided', async () => {
      const service = buildService()
      vi.mocked(service.updateCommissions).mockResolvedValue(mockCommission)

      await service.disputeCommission('com_01')

      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Commission disputed' })
      )
    })
  })

  describe('cancelCommission', () => {
    it('updates status to cancelled with the provided reason', async () => {
      const service = buildService()
      vi.mocked(service.updateCommissions).mockResolvedValue({ ...mockCommission, status: 'cancelled' })

      await service.cancelCommission('com_01', 'Order refunded')

      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'com_01',
          status: 'cancelled',
          notes: 'Order refunded',
        })
      )
    })

    it('uses default notes when no reason provided', async () => {
      const service = buildService()
      vi.mocked(service.updateCommissions).mockResolvedValue(mockCommission)

      await service.cancelCommission('com_01')

      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Order cancelled' })
      )
    })
  })

  describe('getSellerEarningsSummary', () => {
    it('aggregates totals and buckets by status correctly', async () => {
      const service = buildService()
      vi.mocked(service.listCommissions).mockResolvedValue([
        { ...mockCommission, id: 'com_01', status: 'pending',  line_item_total: 100, commission_amount: 10, seller_payout: 90 },
        { ...mockCommission, id: 'com_02', status: 'approved', line_item_total: 200, commission_amount: 20, seller_payout: 180 },
        { ...mockCommission, id: 'com_03', status: 'paid',     line_item_total: 50,  commission_amount: 5,  seller_payout: 45 },
      ])

      const result = await service.getSellerEarningsSummary('sel_01')

      expect(result.totalSales).toBe(350)
      expect(result.totalCommission).toBe(35)
      expect(result.pendingAmount).toBe(90)
      expect(result.approvedAmount).toBe(180)
      expect(result.paidAmount).toBe(45)
      expect(result.available_for_payout).toBe(180) // = approvedAmount
    })

    it('returns zeros for a seller with no commissions', async () => {
      const service = buildService()
      vi.mocked(service.listCommissions).mockResolvedValue([])

      const result = await service.getSellerEarningsSummary('sel_new')

      expect(result.totalSales).toBe(0)
      expect(result.available_for_payout).toBe(0)
    })
  })

  describe('approveOrderCommissions', () => {
    it('approves every commission belonging to the order', async () => {
      const service = buildService()
      vi.mocked(service.listCommissions).mockResolvedValue([
        { ...mockCommission, id: 'com_01' },
        { ...mockCommission, id: 'com_02' },
      ])
      vi.mocked(service.updateCommissions).mockResolvedValue(mockCommission)

      await service.approveOrderCommissions('order_01')

      expect(service.updateCommissions).toHaveBeenCalledTimes(2)
      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'com_01', status: 'approved' })
      )
      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'com_02', status: 'approved' })
      )
    })
  })

  describe('cancelOrderCommissions', () => {
    it('cancels all commissions for an order with the given reason', async () => {
      const service = buildService()
      vi.mocked(service.listCommissions).mockResolvedValue([mockCommission])
      vi.mocked(service.updateCommissions).mockResolvedValue(mockCommission)

      await service.cancelOrderCommissions('order_01', 'Buyer cancelled order')

      expect(service.updateCommissions).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'cancelled', notes: 'Buyer cancelled order' })
      )
    })
  })
})
