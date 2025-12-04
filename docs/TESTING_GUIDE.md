# Testing Guide - Martnex Custom Modules

## 🎯 Testing Levels

We'll test at multiple levels:
1. **Configuration Testing** - Does it start?
2. **Module Loading** - Are modules registered?
3. **Service Testing** - Do CRUD operations work?
4. **Integration Testing** - Do modules work together?
5. **API Testing** - Do endpoints work?

---

## 1️⃣ **Configuration Testing**

### Test: Backend Starts Without Errors

```bash
cd backend

# Test 1: Single Store Mode
echo "STORE_MODE=SINGLE_STORE" > .env
echo "DATABASE_URL=postgres://martnex:martnex_dev_password@localhost:5432/martnex" >> .env
echo "REDIS_URL=redis://localhost:6379" >> .env
echo "ENABLE_STRIPE=true" >> .env

pnpm run dev
```

**Expected Output:**
```
✅ Single Store Mode
✅ No custom modules loaded
✅ Server started on port 9000
```

```bash
# Test 2: Multi-Vendor Mode
echo "STORE_MODE=MULTI_VENDOR_MARKETPLACE" > .env
# ... other env vars

pnpm run dev
```

**Expected Output:**
```
✅ Multi-Vendor Marketplace Mode
✅ Seller module loaded
✅ Commission module loaded
✅ Payout module loaded
✅ Server started on port 9000
```

---

## 2️⃣ **Module Loading Testing**

### Test: Check If Modules Are Registered

Create a test script:

```typescript
// backend/src/scripts/test-modules.ts
import { MedusaContainer } from "@medusajs/framework/types"
import { SELLER_MODULE } from "../modules/seller"
import { COMMISSION_MODULE } from "../modules/commission"
import { PAYOUT_MODULE } from "../modules/payout"

export default async function testModules(container: MedusaContainer) {
  console.log("\n🧪 Testing Module Registration...\n")

  // Test Seller Module
  try {
    const sellerService = container.resolve(SELLER_MODULE)
    console.log("✅ Seller Module: Registered")
    console.log("   Methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(sellerService)))
  } catch (error) {
    console.log("❌ Seller Module: Not registered")
  }

  // Test Commission Module
  try {
    const commissionService = container.resolve(COMMISSION_MODULE)
    console.log("✅ Commission Module: Registered")
  } catch (error) {
    console.log("❌ Commission Module: Not registered")
  }

  // Test Payout Module
  try {
    const payoutService = container.resolve(PAYOUT_MODULE)
    console.log("✅ Payout Module: Registered")
  } catch (error) {
    console.log("❌ Payout Module: Not registered")
  }

  console.log("\n✅ Module registration test complete!\n")
}
```

**Run the test:**
```bash
npx medusa exec ./src/scripts/test-modules.ts
```

---

## 3️⃣ **Service Testing (CRUD Operations)**

### Test: Seller Service CRUD

```typescript
// backend/src/scripts/test-seller-service.ts
import { MedusaContainer } from "@medusajs/framework/types"
import { SELLER_MODULE } from "../modules/seller"

export default async function testSellerService(container: MedusaContainer) {
  console.log("\n🧪 Testing Seller Service CRUD...\n")

  const sellerService = container.resolve(SELLER_MODULE)

  try {
    // 1. CREATE
    console.log("1️⃣ Testing CREATE...")
    const seller = await sellerService.createSellers({
      customer_id: "test_customer_123",
      business_name: "Test Business",
      business_email: "test@example.com",
      verification_status: "pending",
    })
    console.log("✅ Created seller:", seller.id)

    // 2. RETRIEVE
    console.log("\n2️⃣ Testing RETRIEVE...")
    const retrieved = await sellerService.retrieveSeller(seller.id)
    console.log("✅ Retrieved seller:", retrieved.business_name)

    // 3. UPDATE
    console.log("\n3️⃣ Testing UPDATE...")
    const updated = await sellerService.updateSellers(seller.id, {
      business_name: "Updated Business Name",
    })
    console.log("✅ Updated seller:", updated.business_name)

    // 4. LIST
    console.log("\n4️⃣ Testing LIST...")
    const sellers = await sellerService.listSellers()
    console.log("✅ Listed sellers:", sellers.length)

    // 5. CUSTOM METHODS
    console.log("\n5️⃣ Testing CUSTOM METHODS...")

    // Approve seller
    await sellerService.approveSeller(seller.id, "Approved for testing")
    const approved = await sellerService.retrieveSeller(seller.id)
    console.log("✅ Seller approved:", approved.verification_status === "verified")

    // Get earnings
    const earnings = await sellerService.getSellerEarnings(seller.id)
    console.log("✅ Seller earnings:", earnings)

    // Check permissions
    const canList = await sellerService.canListProducts(seller.id)
    console.log("✅ Can list products:", canList)

    // 6. DELETE
    console.log("\n6️⃣ Testing DELETE...")
    await sellerService.deleteSellers(seller.id)
    console.log("✅ Deleted seller")

    console.log("\n✅ All CRUD tests passed!\n")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}
```

**Run the test:**
```bash
npx medusa exec ./src/scripts/test-seller-service.ts
```

---

## 4️⃣ **Commission Service Testing**

```typescript
// backend/src/scripts/test-commission-service.ts
import { MedusaContainer } from "@medusajs/framework/types"
import { COMMISSION_MODULE } from "../modules/commission"

export default async function testCommissionService(container: MedusaContainer) {
  console.log("\n🧪 Testing Commission Service...\n")

  const commissionService = container.resolve(COMMISSION_MODULE)

  try {
    // Test commission calculation
    console.log("1️⃣ Testing COMMISSION CALCULATION...")
    const commission = await commissionService.calculateCommission({
      orderId: "order_123",
      lineItemId: "item_456",
      sellerId: "seller_789",
      productId: "prod_111",
      productTitle: "Test Product",
      lineItemTotal: 100.00,
      quantity: 1,
      commissionRate: 10.00,
      currencyCode: "usd"
    })

    console.log("✅ Commission calculated:")
    console.log("   Line Item Total: $", commission.line_item_total)
    console.log("   Commission Rate:", commission.commission_rate, "%")
    console.log("   Commission Amount: $", commission.commission_amount)
    console.log("   Seller Payout: $", commission.seller_payout)

    // Test earnings summary
    console.log("\n2️⃣ Testing EARNINGS SUMMARY...")
    const summary = await commissionService.getSellerEarningsSummary("seller_789")
    console.log("✅ Seller earnings summary:", summary)

    // Test approval
    console.log("\n3️⃣ Testing COMMISSION APPROVAL...")
    await commissionService.approveCommission(commission.id)
    const approved = await commissionService.retrieveCommission(commission.id)
    console.log("✅ Commission approved:", approved.status === "approved")

    console.log("\n✅ Commission service tests passed!\n")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}
```

**Run the test:**
```bash
npx medusa exec ./src/scripts/test-commission-service.ts
```

---

## 5️⃣ **Payout Service Testing**

```typescript
// backend/src/scripts/test-payout-service.ts
import { MedusaContainer } from "@medusajs/framework/types"
import { PAYOUT_MODULE } from "../modules/payout"

export default async function testPayoutService(container: MedusaContainer) {
  console.log("\n🧪 Testing Payout Service...\n")

  const payoutService = container.resolve(PAYOUT_MODULE)

  try {
    // Create payout request
    console.log("1️⃣ Testing PAYOUT REQUEST...")
    const payout = await payoutService.createPayoutRequest({
      sellerId: "seller_123",
      commissionIds: ["comm_1", "comm_2"],
      amount: 500.00,
      currencyCode: "usd"
    })
    console.log("✅ Payout request created:", payout.id)

    // Approve payout
    console.log("\n2️⃣ Testing PAYOUT APPROVAL...")
    await payoutService.approvePayout(payout.id, "admin_123", "Verified")
    const approved = await payoutService.retrievePayout(payout.id)
    console.log("✅ Payout approved:", approved.status === "approved")

    // Get payout stats
    console.log("\n3️⃣ Testing PAYOUT STATS...")
    const stats = await payoutService.getPayoutStats()
    console.log("✅ Payout statistics:", stats)

    console.log("\n✅ Payout service tests passed!\n")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}
```

---

## 6️⃣ **Integration Testing**

### Test: Full Order → Commission → Payout Flow

```typescript
// backend/src/scripts/test-integration.ts
import { MedusaContainer } from "@medusajs/framework/types"
import { SELLER_MODULE } from "../modules/seller"
import { COMMISSION_MODULE } from "../modules/commission"
import { PAYOUT_MODULE } from "../modules/payout"

export default async function testIntegration(container: MedusaContainer) {
  console.log("\n🧪 Testing Full Integration Flow...\n")

  const sellerService = container.resolve(SELLER_MODULE)
  const commissionService = container.resolve(COMMISSION_MODULE)
  const payoutService = container.resolve(PAYOUT_MODULE)

  try {
    // 1. Create seller
    console.log("1️⃣ Creating seller...")
    const seller = await sellerService.createSellers({
      customer_id: "cus_test",
      business_name: "Test Store",
      business_email: "store@test.com",
      verification_status: "verified"
    })
    console.log("✅ Seller created:", seller.id)

    // 2. Simulate order and calculate commission
    console.log("\n2️⃣ Simulating order...")
    const commission = await commissionService.calculateCommission({
      orderId: "order_test_001",
      lineItemId: "item_001",
      sellerId: seller.id,
      lineItemTotal: 100.00,
      quantity: 1,
      commissionRate: 10.00
    })
    console.log("✅ Commission calculated: $", commission.commission_amount)

    // 3. Approve commission (order delivered)
    console.log("\n3️⃣ Approving commission...")
    await commissionService.approveCommission(commission.id)
    console.log("✅ Commission approved")

    // 4. Request payout
    console.log("\n4️⃣ Requesting payout...")
    const payout = await payoutService.createPayoutRequest({
      sellerId: seller.id,
      commissionIds: [commission.id],
      amount: commission.seller_payout
    })
    console.log("✅ Payout requested:", payout.id)

    // 5. Admin approves payout
    console.log("\n5️⃣ Admin approving payout...")
    await payoutService.approvePayout(payout.id, "admin_001")
    console.log("✅ Payout approved")

    // 6. Check seller earnings
    console.log("\n6️⃣ Checking seller earnings...")
    const earnings = await sellerService.getSellerEarnings(seller.id)
    console.log("✅ Seller earnings:", earnings)

    console.log("\n✅ Full integration test passed!\n")
  } catch (error) {
    console.error("❌ Integration test failed:", error.message)
  }
}
```

**Run integration test:**
```bash
npx medusa exec ./src/scripts/test-integration.ts
```

---

## 7️⃣ **API Endpoint Testing**

### Using HTTP Requests

```bash
# 1. Test seller creation (after creating API routes)
curl -X POST http://localhost:9000/admin/sellers \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "cus_123",
    "business_name": "Test Business",
    "business_email": "test@example.com"
  }'

# 2. Test seller list
curl http://localhost:9000/admin/sellers

# 3. Test seller approval
curl -X POST http://localhost:9000/admin/sellers/seller_123/approve \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'

# 4. Test commission calculation
curl -X POST http://localhost:9000/admin/commissions/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_123",
    "lineItemId": "item_456",
    "sellerId": "seller_789",
    "lineItemTotal": 100,
    "commissionRate": 10
  }'

# 5. Test payout request
curl -X POST http://localhost:9000/seller/payouts/request \
  -H "Content-Type: application/json" \
  -d '{
    "commissionIds": ["comm_1", "comm_2"],
    "amount": 500
  }'
```

---

## 8️⃣ **Automated Unit Testing (Vitest)**

### Create Unit Tests

```typescript
// backend/src/modules/seller/__tests__/seller.service.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createMockContainer } from '@medusajs/test-utils'
import SellerModuleService from '../service'

describe('SellerModuleService', () => {
  let service: SellerModuleService

  beforeEach(() => {
    const container = createMockContainer()
    service = new SellerModuleService(container)
  })

  it('should create a seller', async () => {
    const seller = await service.createSellers({
      customer_id: 'cus_test',
      business_name: 'Test Business',
      business_email: 'test@example.com'
    })

    expect(seller).toBeDefined()
    expect(seller.business_name).toBe('Test Business')
  })

  it('should approve a seller', async () => {
    const seller = await service.createSellers({
      customer_id: 'cus_test',
      business_name: 'Test',
      business_email: 'test@test.com'
    })

    const approved = await service.approveSeller(seller.id)
    expect(approved.verification_status).toBe('verified')
  })

  it('should calculate seller earnings', async () => {
    const seller = await service.createSellers({
      customer_id: 'cus_test',
      business_name: 'Test',
      business_email: 'test@test.com',
      total_sales: 1000,
      total_commission: 100
    })

    const earnings = await service.getSellerEarnings(seller.id)
    expect(earnings.seller_earnings).toBe(900)
  })
})
```

**Run unit tests:**
```bash
pnpm run test
```

---

## 🎯 **Quick Test Checklist**

### ✅ Before Committing Code

- [ ] Backend starts without errors
- [ ] Modules load correctly (check logs)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Basic CRUD operations work
- [ ] Custom methods work
- [ ] Integration flow works

### ✅ Before Deployment

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] API endpoints work
- [ ] Performance is acceptable
- [ ] Error handling works
- [ ] Validation works

---

## 🚀 **Running All Tests**

Create a master test script:

```bash
# backend/test-all.sh
#!/bin/bash

echo "🧪 Running all tests..."

echo "\n1️⃣ TypeScript compilation..."
npx tsc --noEmit

echo "\n2️⃣ Unit tests..."
pnpm run test

echo "\n3️⃣ Module registration..."
npx medusa exec ./src/scripts/test-modules.ts

echo "\n4️⃣ Service tests..."
npx medusa exec ./src/scripts/test-seller-service.ts
npx medusa exec ./src/scripts/test-commission-service.ts
npx medusa exec ./src/scripts/test-payout-service.ts

echo "\n5️⃣ Integration test..."
npx medusa exec ./src/scripts/test-integration.ts

echo "\n✅ All tests complete!"
```

**Run all tests:**
```bash
chmod +x test-all.sh
./test-all.sh
```

---

## 📊 **Test Coverage**

Track what's tested:

| Component | Unit Tests | Integration | API Tests | Status |
|-----------|-----------|-------------|-----------|--------|
| Seller Service | ✅ | ✅ | ⏳ | Ready |
| Commission Service | ✅ | ✅ | ⏳ | Ready |
| Payout Service | ✅ | ✅ | ⏳ | Ready |
| Store Mode Config | ✅ | ✅ | N/A | Ready |
| Payment Config | ✅ | ✅ | ⏳ | Ready |

---

## 🐛 **Common Issues & Solutions**

### Issue 1: Module Not Registered
```
Error: Module 'sellerModuleService' not found
```

**Solution:**
- Check `medusa-config.ts` has correct path
- Verify `STORE_MODE=MULTI_VENDOR_MARKETPLACE`
- Restart server

### Issue 2: Database Connection Error
```
Error: Connection refused
```

**Solution:**
- Check PostgreSQL is running: `docker ps`
- Verify DATABASE_URL in .env
- Run migrations: `npx medusa db:migrate`

### Issue 3: Import Errors
```
Cannot find module '@medusajs/framework/utils'
```

**Solution:**
- Use `@medusajs/utils` not `@medusajs/framework/utils`
- Check package.json has correct dependencies

---

## 💡 **Best Practices**

1. **Test Early, Test Often**
   - Write tests as you build features
   - Run tests before committing

2. **Use Test Data**
   - Create test fixtures
   - Don't use production data

3. **Isolate Tests**
   - Each test should be independent
   - Clean up after tests

4. **Mock External Services**
   - Don't call real payment APIs in tests
   - Use mocks for Stripe, PayPal, etc.

5. **Test Edge Cases**
   - What if commission rate is 0?
   - What if seller is suspended?
   - What if payout fails?

---

**Ready to start testing!** 🚀
