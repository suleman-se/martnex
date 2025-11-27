# Business Rules & Operational Logic

This document defines the business rules and operational logic for Martnex. As an open-source project, **most of these are configurable defaults** that platform owners can customize.

---

## Philosophy for Open-Source

- **Configurable by default** - Platform owners control the rules
- **Sensible defaults** - Works out-of-box with reasonable settings
- **No vendor lock-in** - Easy to switch payment providers, services
- **Community-driven** - Rules can evolve based on feedback
- **Transparent** - All rules documented and editable

---

## 1. Seller Onboarding & Verification

### Seller Registration Process

**Default Flow:**
1. Seller fills registration form (business info, bank details)
2. Account created with status: `pending_verification`
3. Admin receives notification
4. Admin reviews application
5. Admin approves/rejects
6. Seller receives notification of decision

### Required Information (Configurable)

**Minimum Required:**
- Business name
- Contact email
- Phone number
- Business address
- Bank account details (for payouts)

**Optional (Can be enforced via config):**
- Tax ID / VAT number
- Business registration documents
- Identity verification (government ID)
- Business license

### Verification Timeline

**Default:** Manual verification by admin (no automatic approval)

**Configurable Settings:**
```typescript
{
  autoApproveNewSellers: false,  // Platform owner decides
  requireDocumentUpload: false,   // Can enable if needed
  verificationSLA: null,          // No mandatory timeline
  allowProductsBeforeVerification: false
}
```

### During Pending Verification

**Sellers can:**
- Log in to dashboard
- Add products (saved as drafts)
- View documentation and guides

**Sellers cannot:**
- Publish products
- Receive payments
- Request payouts

### Rejection & Appeals

- Rejected sellers receive reason via email
- Can reapply after 30 days (configurable)
- Or contact admin to appeal decision

---

## 2. Commission & Payout System

### Commission Structure (Fully Configurable)

**Three-tier system:**

1. **Global Rate** - Default for entire platform
2. **Category Rate** - Overrides global for specific categories
3. **Seller Rate** - Overrides both (negotiated deals)

**Priority:** Seller Rate > Category Rate > Global Rate

**Default Global Rate:** 10% (configurable in admin settings)

### Commission Calculation

**Formula:**
```
order_total = sum(item_price × quantity)
commission_amount = order_total × commission_rate
seller_payout = order_total - commission_amount
```

**Calculated on:**
- Order placement (status: `pending`)
- Excludes shipping costs (configurable)
- Excludes taxes (configurable)

### Payout Mechanics

**Default Rules (All Configurable):**

```typescript
{
  minimumPayoutAmount: 50,        // USD (or platform currency)
  payoutRequestFrequency: "weekly",  // daily, weekly, monthly, manual
  escrowPeriod: 7,                // Days to hold funds after delivery
  processingTime: 3,              // Days for admin to process
  payoutMethods: ["stripe", "paypal", "bank_transfer"]
}
```

**Payout Request Flow:**
1. Seller requests payout (if balance ≥ minimum)
2. System validates available balance (completed orders past escrow)
3. Admin receives notification
4. Admin reviews and approves/rejects
5. Platform processes payment via configured method
6. Seller receives confirmation

**Available Balance Calculation:**
```
available_balance = sum(completed_commissions)
                    where order.delivered_at < (now - escrow_period)
                    and commission.status = 'approved'
                    and commission.payout_id = null
```

### Transaction Fees

**Default Policy:** Platform absorbs payment gateway fees

**Configurable Options:**
- Platform pays all fees
- Seller pays all fees
- Split fees (e.g., 50/50)

**Example (Stripe):**
- Transaction fee: 2.9% + $0.30
- Who pays: Configurable per platform

---

## 3. Inventory Management

### Inventory Strategy

**Model:** Each seller manages their own inventory independently

**Key Principle:** No shared inventory between sellers (each seller = separate stock)

### Stock Reservation

**Default Behavior:**
- Stock reserved on **order placement** (not on add-to-cart)
- Reserved for 24 hours (configurable)
- Auto-released if payment fails or order canceled

**Configurable:**
```typescript
{
  reserveOnAddToCart: false,      // Reserve when added to cart
  reservationDuration: 24,        // Hours to hold reservation
  allowBackorders: false,         // Accept orders when out of stock
  lowStockThreshold: 5            // Notify seller when stock < X
}
```

### Overselling Prevention

**Protection:**
- Database-level constraints
- Atomic stock updates
- Transaction isolation

**If overselling occurs:**
- First come, first served
- Later orders canceled with full refund
- Seller notified of inventory issue

### Multi-Seller Products

**Approach:** Separate products per seller (no shared listings)

**Example:**
- Seller A sells "Blue T-Shirt" (product_id: 123)
- Seller B sells "Blue T-Shirt" (product_id: 456)
- These are separate products with separate inventory

**Rationale:** Simpler, clearer ownership, easier commission tracking

---

## 4. Order Fulfillment & Shipping

### Fulfillment Model

**Decentralized:** Each seller ships their own products

**Not Supported (MVP):**
- Centralized fulfillment
- Dropshipping automation
- Platform-managed warehousing

### Multi-Vendor Cart Handling

**Strategy:** Split into multiple orders automatically

**Example:**
```
Customer Cart:
- Product A (Seller 1) - $20
- Product B (Seller 2) - $30
- Product C (Seller 1) - $10

Created Orders:
- Order #1001: Products A + C → Seller 1 ($30)
- Order #1002: Product B → Seller 2 ($30)
```

**Customer sees:**
- One payment transaction
- Multiple order confirmations (one per seller)
- Separate tracking numbers

**Commission calculated separately per order**

### Shipping Configuration

**Configurable per Platform:**
- Free shipping threshold (e.g., free over $50)
- Shipping zones and rates
- Carriers available (USPS, FedEx, UPS, etc.)

**Seller Responsibilities:**
- Set own shipping rates (or use platform defaults)
- Generate shipping labels
- Provide tracking numbers
- Mark orders as shipped

**Platform provides:**
- Shipping calculator integration (optional)
- Carrier API integration (optional - Phase 2)
- Tracking number field

---

## 5. Dispute Resolution

### Who Can Raise Disputes

**Buyers can dispute:**
- Non-delivery
- Wrong item received
- Damaged/defective item
- Item not as described

**Sellers can dispute:**
- Fraudulent order
- Unfair review
- Chargeback

### Dispute Categories

1. **Order Issues**
   - Non-delivery
   - Wrong item
   - Damaged goods
   - Quality issues

2. **Refund Requests**
   - Buyer wants refund
   - Seller denied refund

3. **Payment Issues**
   - Chargeback filed
   - Payment not received

4. **Other**
   - Policy violations
   - Harassment
   - Fraud

### Dispute Lifecycle

```
Open → Under Review → Resolved → Closed
```

**Timeline (Configurable):**
- Admin response SLA: 48 hours (default)
- Resolution target: 7 days
- Auto-close if no activity: 30 days

### Resolution Process

1. **Dispute filed** - Buyer/Seller submits with evidence
2. **Other party notified** - 48 hours to respond
3. **Admin reviews** - Examines evidence from both sides
4. **Decision made** - Refund, partial refund, or no action
5. **Both parties notified** - Final decision is binding

### Resolution Options

**Admin can:**
- Issue full refund (commission reversed)
- Issue partial refund
- Deny dispute (no refund)
- Request additional information
- Escalate to manual review

**Commission Handling:**
- If refund issued: Commission reversed
- If partial refund: Commission adjusted proportionally
- Seller's commission deducted from next payout

### Evidence Types

- Order confirmation
- Photos/videos
- Tracking information
- Communication screenshots
- Product description/listing

---

## 6. Product Reviews & Ratings

### Review Eligibility

**Who can review:**
- Only verified buyers (purchased and received product)
- One review per product per order
- Cannot review own products (sellers)

**When can review:**
- After order marked as "delivered"
- No time limit (can review years later)

### Review Content

**Allowed:**
- Rating: 1-5 stars (required)
- Written review: Up to 500 characters (optional)
- Photos: Up to 5 images (optional)

**Not Allowed:**
- Personal information (emails, phone numbers)
- External links
- Offensive language
- Spam/promotional content

### Moderation

**Default:** Auto-publish with post-moderation

**Configurable:**
```typescript
{
  requireApproval: false,        // Pre-moderation if true
  allowPhotos: true,
  allowSellerResponse: true,
  autoFlagKeywords: ["spam", "scam", ...],
  reviewEditWindow: 48           // Hours buyer can edit review
}
```

**Admin Actions:**
- Approve/reject review
- Flag as inappropriate
- Remove review (with reason logged)
- Hide review (temporarily)

### Seller Response

**Sellers can:**
- Respond once to each review
- Response limited to 300 characters
- Cannot edit after posting (can delete and repost within 24h)

**Sellers cannot:**
- Delete buyer reviews
- Rate buyers
- Hide reviews

### Review Impact

**Affects:**
- Product rating (average of all reviews)
- Seller rating (average across all products)
- Search ranking (higher rated = higher)
- Seller performance score

---

## 7. Returns & Refunds

### Return Policy (Configurable by Platform)

**Default Settings:**
```typescript
{
  returnWindow: 30,              // Days from delivery
  returnShippingPaidBy: "buyer", // buyer, seller, or platform
  restockingFee: 0,              // Percentage (0-20%)
  acceptUsedReturns: false,      // Only accept unused items
  requireOriginalPackaging: true
}
```

### Return Process

1. **Buyer requests return** - Within return window, states reason
2. **Seller reviews** - Has 48 hours to approve/deny
3. **If approved** - Buyer ships item back
4. **Seller receives** - Inspects and confirms condition
5. **Refund issued** - Minus any fees
6. **Commission reversed** - Deducted from seller's next payout

### Refund Scenarios

**Full Refund:**
- Item defective/damaged (seller's fault)
- Wrong item sent
- Item not as described

**Partial Refund:**
- Item returned in used condition
- Missing accessories
- Minor damage buyer keeps item

**No Refund:**
- Return window expired
- Item damaged by buyer
- Hygiene/safety items (unless defective)

### Commission Handling on Refunds

```
refund_amount = order_total
commission_reversal = refund_amount × commission_rate
seller_owes = commission_reversal (if already paid out)
```

**Scenarios:**
1. **Commission not yet paid:** Simply cancel commission record
2. **Commission already paid:** Deduct from next payout
3. **Seller balance negative:** Suspend payouts until cleared

---

## 8. Seller Performance Metrics

### Key Metrics (Tracked Automatically)

1. **Order Fulfillment Rate**
   - Orders shipped on time / total orders
   - Target: ≥ 95%

2. **Cancellation Rate**
   - Seller-canceled orders / total orders
   - Target: ≤ 2%

3. **Average Rating**
   - Average of all product reviews
   - Target: ≥ 4.0 stars

4. **Response Time**
   - Average time to ship after order
   - Average time to respond to messages (if messaging enabled)

5. **Dispute Rate**
   - Disputes filed against seller / total orders
   - Target: ≤ 1%

### Performance Tiers (Optional Feature)

**Configurable Tier System:**

```typescript
{
  enablePerformanceTiers: false,  // Platform owner decides
  tiers: {
    bronze: { minRating: 3.0, minOrders: 0 },
    silver: { minRating: 4.0, minOrders: 50 },
    gold: { minRating: 4.5, minOrders: 200 },
    platinum: { minRating: 4.8, minOrders: 1000 }
  },
  tierBenefits: {
    platinum: { commissionRate: 8 },  // 2% discount
    gold: { commissionRate: 9 }       // 1% discount
  }
}
```

### Poor Performance Actions

**Thresholds (Configurable):**
- Warning: Rating < 3.5 or cancellation rate > 5%
- Suspension: Rating < 3.0 or cancellation rate > 10%
- Termination: Rating < 2.5 or severe policy violations

**Process:**
1. Warning email sent with improvement plan
2. 30-day improvement period
3. Review performance again
4. Suspend or remove account if no improvement

**Sellers can:**
- Appeal decisions
- Request performance review
- View metrics dashboard

---

## 9. Platform Fees & Revenue Models

### Revenue Model (Configurable)

**Default:** Commission-only (simplest for MVP)

**Optional Models (Future):**

1. **Commission Only**
   - No upfront costs
   - Platform takes % of each sale
   - Default: 10%

2. **Subscription + Commission**
   - Monthly/yearly seller subscription
   - Lower commission rate
   - Example: $29/month + 5% commission

3. **Freemium**
   - Free tier: Limited products, higher commission
   - Paid tier: Unlimited products, lower commission

4. **Transaction Fee**
   - Fixed fee per order (e.g., $0.50)
   - Plus commission percentage

**Platform Owner Controls:**
- Which model to use
- All pricing values
- Feature limits per tier

### Default Configuration

```typescript
{
  revenueModel: "commission_only",
  defaultCommission: 10,          // Percentage
  freeTrialDays: 0,               // No trial by default
  listingFees: 0,                 // No listing fees
  subscriptionPlans: []           // No subscriptions
}
```

---

## 10. Data Privacy & Compliance

### GDPR Compliance (If Targeting EU)

**User Rights:**
- Right to access data
- Right to data portability (export)
- Right to be forgotten (delete account)
- Right to correct data

**Implementation:**
- Export data feature (JSON/CSV)
- Account deletion with data anonymization
- Cookie consent management
- Privacy policy acceptance on signup

### Data Retention

**Default Policy:**
```typescript
{
  activeAccountData: "indefinite",     // Keep while active
  deletedAccountData: 30,              // Days to permanent delete
  orderHistoryData: 2555,              // 7 years (tax/legal)
  analyticsData: 365,                  // 1 year
  logData: 90                          // 3 months
}
```

### Personal Data Handling

**What we store:**
- Authentication: Email, hashed password
- Profile: Name, phone, addresses
- Orders: Purchase history
- Payments: Last 4 digits only (full data with Stripe)
- Analytics: Anonymized user behavior

**What we don't store:**
- Full credit card numbers
- Plain-text passwords
- Social security numbers
- Sensitive government IDs (unless required for verification)

### Cookie Policy

**Configurable Cookie Banner:**
- Essential cookies only (by default)
- Analytics cookies (opt-in)
- Marketing cookies (opt-in)
- Preference saved per user

---

## 11. Platform Limits & Quotas

### Default Limits (All Configurable)

**Sellers:**
```typescript
{
  maxProductsPerSeller: 10000,
  maxImagesPerProduct: 10,
  maxProductVariants: 50,
  maxFileSize: 5,                // MB per image
  maxVideoSize: 50,              // MB
  storageQuotaPerSeller: 1000    // MB
}
```

**Buyers:**
```typescript
{
  maxCartItems: 100,
  maxSavedAddresses: 10,
  maxWishlistItems: 500
}
```

**API Rate Limits:**
```typescript
{
  anonymous: 60,                 // Requests per 15 min
  authenticated: 100,
  seller: 200,
  admin: 500
}
```

**Upload Limits:**
- Image formats: JPG, PNG, WebP
- Max dimensions: 4096x4096px
- Min dimensions: 500x500px (product images)

---

## 12. Product Approval & Moderation

### Approval Workflow

**Default:** Auto-publish (trust sellers)

**Configurable:**
```typescript
{
  requireApproval: false,        // Set true for manual approval
  autoApproveVerifiedSellers: true,
  flagKeywords: [...],           // Auto-flag for review
  bannedCategories: [],          // Not allowed on platform
  requireImageModeration: false
}
```

### Approval Criteria

**Auto-rejected if:**
- Prohibited category (weapons, drugs, etc.)
- Contains flagged keywords
- Violates content policy
- Duplicate listing (same product, same seller)

**Admin reviews:**
- Product title and description
- Images (no inappropriate content)
- Pricing (not predatory)
- Category accuracy

### Prohibited Products (Configurable List)

**Default banned categories:**
- Illegal items
- Weapons and ammunition
- Drugs and controlled substances
- Adult content
- Counterfeit goods
- Stolen items

**Platform owner can customize**

### Content Guidelines

**Required:**
- Clear product title
- Accurate description
- At least 1 product image
- Valid pricing
- Shipping information

**Image Guidelines:**
- High quality (min resolution)
- Shows actual product
- No watermarks (configurable)
- No misleading images

---

## 13. Notifications & Communication

### Notification Channels

**Available (Configurable):**
- Email (always enabled)
- SMS (optional, requires Twilio)
- In-app notifications (browser/mobile)
- Push notifications (mobile app - Phase 2)

### Notification Types

**Buyers:**
- Order confirmation
- Order shipped
- Order delivered
- Refund processed
- Review reminder
- Promotional (opt-in only)

**Sellers:**
- New order received
- Payout approved
- Low stock alert
- New review posted
- Dispute filed
- Performance warnings

**Admins:**
- New seller registration
- Dispute filed
- Payout request
- System errors

### User Preferences

**Users can control:**
- Which notifications to receive
- Preferred channel (email vs SMS)
- Frequency (instant, daily digest, weekly)
- Promotional opt-in/out

**Cannot disable:**
- Critical security notifications
- Order status updates
- Legal notices

---

## 14. Internationalization

### Multi-Currency (Phase 2)

**Default:** Single currency (USD)

**Future:**
- Display prices in user's currency
- Auto-conversion at checkout
- Settlement in seller's currency
- Exchange rate provider (configurable)

### Tax Calculation

**Default:** Platform owner configures tax rates

**Options:**
- Fixed rate per region
- Tax calculation service (TaxJar, Avalara)
- Seller sets own tax rates
- No tax (some regions)

**Configurable:**
```typescript
{
  enableTaxCalculation: true,
  taxProvider: "manual",         // manual, taxjar, avalara
  includesTax: false,            // Prices include tax?
  taxRates: {
    "US-CA": 9.25,
    "US-NY": 8.875,
    ...
  }
}
```

### Localization

**Language Support:**
- Default: English (en-US)
- Additional languages via community translations
- Right-to-left (RTL) support for Arabic, Hebrew

**Regional Formats:**
- Date/time formats
- Number formats (1,000.00 vs 1.000,00)
- Currency symbols
- Phone number formats

---

## 15. Platform Configuration

### Admin-Configurable Settings

**General:**
- Platform name and logo
- Default currency
- Default language
- Timezone
- Contact information

**Commerce:**
- Commission rates (global/category/seller)
- Payment gateways enabled
- Shipping carriers
- Tax settings
- Return policy

**Features:**
- Enable/disable reviews
- Enable/disable messaging
- Enable/disable wishlist
- Enable/disable guest checkout
- Require seller verification

**Limits:**
- Product limits
- Upload limits
- API rate limits
- Minimum payout amount

**Notifications:**
- Email provider settings
- SMS provider settings
- Notification templates
- Sender addresses

**Security:**
- Password requirements
- Session timeout
- Two-factor authentication
- IP whitelist (admin)

### Feature Flags

**Toggleable Features:**
```typescript
{
  enableReviews: true,
  enableMessaging: false,        // Phase 2
  enableWishlist: true,
  enableGuestCheckout: true,
  enableMultiCurrency: false,    // Phase 2
  enableSellerTiers: false,
  enableSubscriptions: false
}
```

---

## Configuration Files

All business rules are stored in:
- Database: `platform_settings` table
- Environment variables: For secrets
- Config files: For feature flags
- Admin panel: For runtime changes

### Example Configuration

```typescript
// backend/src/config/business-rules.ts
export const defaultBusinessRules = {
  commission: {
    globalRate: 10,
    minimumPayout: 50,
    escrowPeriod: 7,
    payoutFrequency: 'weekly'
  },
  orders: {
    reservationDuration: 24,
    autoSplitMultiVendor: true,
    allowGuestCheckout: true
  },
  sellers: {
    requireVerification: true,
    autoApprove: false,
    allowProductsBeforeVerification: false
  },
  reviews: {
    requireApproval: false,
    allowPhotos: true,
    allowSellerResponse: true
  },
  returns: {
    returnWindow: 30,
    shippingPaidBy: 'buyer',
    restockingFee: 0
  }
}
```

---

## Notes for Platform Owners

1. **Start simple** - Use defaults, customize later
2. **Test with real data** - Validate rules before launch
3. **Document changes** - Keep track of customizations
4. **Community input** - Let users suggest improvements
5. **Legal review** - Consult lawyer for your jurisdiction
6. **Be transparent** - Publish rules publicly (Terms of Service)

---

## Version History

- **v1.0** (2024-11-26) - Initial business rules documentation

---

**Remember:** This is an open-source platform. These are sensible defaults, not rigid requirements. Customize to fit your use case!
