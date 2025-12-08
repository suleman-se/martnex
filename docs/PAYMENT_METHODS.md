# Payment Methods in Martnex

## Supported Payment Methods

Martnex supports multiple payment methods to cater to different markets and customer preferences.

### 1. **Stripe** (Online Payment)
- **Use Case:** Global online payments
- **Supports:** Credit cards, debit cards, digital wallets
- **Best For:** International customers, digital products
- **Setup:** Requires Stripe API key

```env
ENABLE_STRIPE=true
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. **PayPal** (Online Payment)
- **Use Case:** Trusted online payment gateway
- **Supports:** PayPal balance, cards
- **Best For:** Customers who prefer PayPal
- **Setup:** Requires PayPal credentials

```env
ENABLE_PAYPAL=true
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### 3. **Bank Transfer** (Manual Verification)
- **Use Case:** Direct bank deposits
- **Supports:** Wire transfer, NEFT, RTGS
- **Best For:** Large orders, B2B transactions
- **Setup:** Manual order verification required

```env
ENABLE_BANK_TRANSFER=true
```

**Process:**
1. Customer selects bank transfer
2. System shows bank details
3. Customer makes transfer
4. Admin verifies payment manually
5. Order is processed

### 4. **Cash on Delivery (COD)** ⭐ Popular in Many Regions
- **Use Case:** Pay when receiving the product
- **Popular In:** India, Pakistan, Middle East, Southeast Asia
- **Best For:** Physical products only
- **Setup:** No credentials needed, country restrictions configurable

```env
ENABLE_COD=true

# Optional: Restrict COD to specific countries (ISO codes)
COD_ALLOWED_COUNTRIES=IN,PK,BD,AE,SA  # India, Pakistan, Bangladesh, UAE, Saudi Arabia

# Or allow all countries
# COD_ALLOWED_COUNTRIES=*

# Or domestic only
# DOMESTIC_COUNTRY=IN
# COD_DOMESTIC_ONLY=true
```

**Important Restrictions:**
- ❌ **Digital products:** COD automatically disabled at checkout
- 🌍 **Country restrictions:** Can be limited to specific countries
- 🏠 **Domestic only:** Option to restrict to home country only

---

## Product Type Restrictions

### Physical Products
✅ All payment methods available:
- Stripe
- PayPal
- Bank Transfer
- **COD** ✅

### Digital Products (Downloads, Subscriptions, etc.)
✅ Online payments only:
- Stripe
- PayPal
- Bank Transfer
- ~~COD~~ ❌ (Not available)

**Why?** Digital products are delivered instantly. COD requires physical delivery to collect payment.

---

## Implementation Details

### Frontend (Checkout)

```typescript
// Example: Get available payment methods with country check
import { getAvailablePaymentMethods } from '@/config/payment-config'

function CheckoutPage({ cart, shippingAddress }) {
  // Automatically handles:
  // - Digital product check
  // - Country restrictions
  // - Enabled features
  const availableMethods = getAvailablePaymentMethods(cart, shippingAddress)

  return (
    <div>
      {availableMethods.map(method => (
        <PaymentOption key={method} method={method} />
      ))}
    </div>
  )
}

// Get COD availability message for customer
import { getCodAvailabilityMessage } from '@/config/payment-config'

const codStatus = getCodAvailabilityMessage(cart, shippingAddress)
if (!codStatus.available) {
  console.log(codStatus.reason)
  // "Cash on Delivery is not available for digital products"
  // or "Cash on Delivery is not available for US. Available in: IN, PK, BD"
}
```

### Backend (Order Processing)

COD orders have special workflow:
1. Order placed with status: `pending_payment`
2. Product shipped to customer
3. Payment collected on delivery
4. Delivery partner confirms payment
5. Order status: `completed`

---

## Configuration Examples

### Example 1: Digital Products Store
```env
# No COD - digital products only
ENABLE_STRIPE=true
ENABLE_PAYPAL=true
ENABLE_BANK_TRANSFER=false
ENABLE_COD=false
```

### Example 2: Indian Store (Domestic COD Only)
```env
# COD only for India, online payments for international
ENABLE_STRIPE=true
ENABLE_PAYPAL=false
ENABLE_BANK_TRANSFER=true
ENABLE_COD=true

# Restrict COD to India only
DOMESTIC_COUNTRY=IN
COD_DOMESTIC_ONLY=true
```

### Example 3: South Asian E-commerce
```env
# COD for specific countries
ENABLE_STRIPE=true
ENABLE_PAYPAL=true
ENABLE_COD=true

# Allow COD in India, Pakistan, Bangladesh
COD_ALLOWED_COUNTRIES=IN,PK,BD
```

### Example 4: Middle East Marketplace
```env
# COD for GCC countries
ENABLE_STRIPE=true
ENABLE_PAYPAL=false
ENABLE_COD=true

# Allow COD in UAE, Saudi Arabia, Kuwait, Qatar
COD_ALLOWED_COUNTRIES=AE,SA,KW,QA
```

### Example 5: Global Store with Regional COD
```env
# Mixed: Online payments global, COD regional
ENABLE_STRIPE=true
ENABLE_PAYPAL=true
ENABLE_COD=true

# COD for South Asia + Middle East + Southeast Asia
COD_ALLOWED_COUNTRIES=IN,PK,BD,AE,SA,ID,PH,MY,TH
```

---

## Validation

### Startup Validation

The system validates that at least one payment method is enabled:

```
✅ Valid: ENABLE_STRIPE=true
✅ Valid: ENABLE_COD=true
❌ Invalid: All payment methods disabled
```

### Runtime Warning

If COD is the only payment method:

```
⚠️  Warning: COD is enabled as the only payment method.
   Note: COD should be disabled for digital products at checkout.
   Consider enabling an online payment method for digital goods.
```

---

## Regional Considerations

### COD Popular Regions

| Region | COD Usage | Notes |
|--------|-----------|-------|
| India | 70-80% | Very popular, trust issues with online payments |
| Pakistan | 60-70% | Growing but still COD-first |
| Middle East | 40-50% | UAE, Saudi Arabia prefer COD |
| Southeast Asia | 50-60% | Indonesia, Philippines common |
| Europe | 5-10% | Rare, mostly online payments |
| USA | <5% | Almost exclusively online |

### Recommendations by Region

**For India/Pakistan/Middle East:**
- ✅ Enable COD (primary method)
- ✅ Enable Stripe (alternative)
- ✅ Consider Razorpay (local gateway)

**For Europe/USA:**
- ✅ Enable Stripe (primary)
- ✅ Enable PayPal (popular)
- ❌ Skip COD (rarely used)

**For Global Marketplace:**
- ✅ Enable all methods
- Let customers choose based on location

---

## Future Enhancements

### Planned Payment Methods

1. **Razorpay** (India)
2. **Paymob** (Middle East)
3. **GCash** (Philippines)
4. **Cryptocurrency** (Bitcoin, USDT)
5. **Buy Now Pay Later** (Klarna, Afterpay)

### COD Enhancements

1. **Partial COD:** Pay 20% online, rest on delivery
2. **COD Verification:** OTP before accepting COD orders
3. **COD Limits:** Maximum order value for COD
4. **COD Fees:** Extra charge for COD orders (to cover risk)

---

## Database Schema

Products should have `is_digital` flag:

```typescript
const Product = model.define("product", {
  id: model.id().primaryKey(),
  title: model.text(),
  is_digital: model.boolean().default(false), // Digital vs Physical
  // ... other fields
})
```

This flag determines if COD is available at checkout.

---

## Testing

### Test Scenarios

1. ✅ Physical product → COD available
2. ✅ Digital product → COD hidden
3. ✅ Mixed cart → COD hidden (any digital product)
4. ✅ No payment methods enabled → Validation error
5. ✅ COD order → Special fulfillment workflow

---

## Support

For payment gateway integration help:
- Stripe: https://stripe.com/docs
- PayPal: https://developer.paypal.com/
- COD: No external integration needed
