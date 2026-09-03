/**
 * Review Module Service Tests
 *
 * DB-facing methods are mocked with vi.fn(), so no database is touched.
 */

import { describe, it, expect, vi } from 'vitest'
import ReviewModuleService from '../service'

const buildService = () => {
  const service = Object.create(ReviewModuleService.prototype) as ReviewModuleService
  service.createReviews = vi.fn()
  service.updateReviews = vi.fn()
  service.listReviews = vi.fn()
  return service
}

const review = (rating: number, product_id = 'prod_01') => ({ rating, product_id })

describe('ReviewModuleService', () => {
  describe('submitReview', () => {
    it('persists a review when the rating is valid and none exists yet', async () => {
      const service = buildService()
      vi.mocked(service.listReviews).mockResolvedValue([] as never)
      vi.mocked(service.createReviews).mockResolvedValue({ id: 'rev_01' } as never)

      await service.submitReview({
        productId: 'prod_01',
        customerId: 'cus_01',
        sellerId: 'sel_01',
        customerName: 'Ada L',
        rating: 5,
        title: 'Great',
        content: 'Holds up well.',
        isVerifiedPurchase: true,
      })

      expect(service.createReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: 'prod_01',
          customer_id: 'cus_01',
          seller_id: 'sel_01',
          rating: 5,
          is_verified_purchase: true,
        })
      )
    })

    it.each([0, 6, -1, 2.5])('rejects an out-of-range rating: %s', async (rating) => {
      const service = buildService()
      vi.mocked(service.listReviews).mockResolvedValue([] as never)

      await expect(
        service.submitReview({ productId: 'prod_01', customerId: 'cus_01', rating })
      ).rejects.toThrow(/between 1 and 5/)
      expect(service.createReviews).not.toHaveBeenCalled()
    })

    it('rejects a second review of the same product by the same customer', async () => {
      const service = buildService()
      vi.mocked(service.listReviews).mockResolvedValue([{ id: 'rev_01' }] as never)

      await expect(
        service.submitReview({ productId: 'prod_01', customerId: 'cus_01', rating: 4 })
      ).rejects.toThrow(/already reviewed/)
      expect(service.createReviews).not.toHaveBeenCalled()
    })

    it('defaults optional fields to null rather than undefined', async () => {
      const service = buildService()
      vi.mocked(service.listReviews).mockResolvedValue([] as never)
      vi.mocked(service.createReviews).mockResolvedValue({ id: 'rev_01' } as never)

      await service.submitReview({ productId: 'prod_01', customerId: 'cus_01', rating: 3 })

      expect(service.createReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          seller_id: null,
          title: null,
          content: null,
          order_id: null,
          is_verified_purchase: false,
        })
      )
    })
  })

  describe('rating summaries', () => {
    it('averages to one decimal place and counts the distribution', async () => {
      const service = buildService()
      vi.mocked(service.listReviews).mockResolvedValue(
        [review(5), review(4), review(4), review(2)] as never
      )

      const summary = await service.getProductRatingSummary('prod_01')

      expect(summary.count).toBe(4)
      expect(summary.average).toBe(3.8) // 15 / 4 = 3.75 -> 3.8
      expect(summary.distribution).toEqual({ 1: 0, 2: 1, 3: 0, 4: 2, 5: 1 })
    })

    it('returns a null average and zeroed distribution when there are no reviews', async () => {
      const service = buildService()
      vi.mocked(service.listReviews).mockResolvedValue([] as never)

      const summary = await service.getSellerRatingSummary('sel_01')

      expect(summary).toEqual({
        average: null,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })
    })

    it('only counts published reviews', async () => {
      const service = buildService()
      vi.mocked(service.listReviews).mockResolvedValue([review(5)] as never)

      await service.getProductRatingSummary('prod_01')

      expect(service.listReviews).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published' })
      )
    })
  })

  describe('getRatingSummariesForProducts', () => {
    it('groups reviews per product and includes products with none', async () => {
      const service = buildService()
      vi.mocked(service.listReviews).mockResolvedValue(
        [review(5, 'prod_01'), review(3, 'prod_01'), review(4, 'prod_02')] as never
      )

      const summaries = await service.getRatingSummariesForProducts([
        'prod_01',
        'prod_02',
        'prod_03',
      ])

      expect(summaries.prod_01.average).toBe(4)
      expect(summaries.prod_01.count).toBe(2)
      expect(summaries.prod_02.average).toBe(4)
      expect(summaries.prod_03).toEqual({
        average: null,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })
    })

    it('short-circuits on an empty id list without querying', async () => {
      const service = buildService()
      const summaries = await service.getRatingSummariesForProducts([])

      expect(summaries).toEqual({})
      expect(service.listReviews).not.toHaveBeenCalled()
    })
  })

  describe('rejectReview', () => {
    it('marks the review rejected with the given reason', async () => {
      const service = buildService()
      vi.mocked(service.updateReviews).mockResolvedValue({ id: 'rev_01' } as never)

      await service.rejectReview('rev_01', 'Spam')

      expect(service.updateReviews).toHaveBeenCalledWith({
        id: 'rev_01',
        status: 'rejected',
        rejection_reason: 'Spam',
      })
    })
  })
})
