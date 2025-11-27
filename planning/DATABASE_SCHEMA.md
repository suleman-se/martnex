# Database Schema Design

## Overview
This document outlines the database schema for the marketplace platform, building on top of Medusa.js's existing schema.

---

## Medusa.js Default Entities (Already Provided)

Medusa.js comes with these core entities out-of-the-box:

### Customer
- id, email, first_name, last_name
- phone, has_account, password_hash
- billing_address_id, metadata
- created_at, updated_at

### Product
- id, title, subtitle, description
- handle, is_giftcard, status
- thumbnail, profile_id, weight, length, height, width
- hs_code, origin_country, mid_code, material
- collection_id, type_id, discountable
- external_id, metadata
- created_at, updated_at, deleted_at

### Order
- id, status, fulfillment_status, payment_status
- display_id, cart_id, customer_id
- email, billing_address_id, shipping_address_id
- region_id, currency_code, tax_rate
- canceled_at, metadata, idempotency_key
- created_at, updated_at

### Cart
- id, email, billing_address_id, shipping_address_id
- region_id, customer_id, payment_id
- type, completed_at, payment_authorized_at
- idempotency_key, context, metadata
- created_at, updated_at, deleted_at

### User (Admin/Staff)
- id, email, first_name, last_name
- password_hash, api_token, metadata
- created_at, updated_at, deleted_at

### Payment
- id, swap_id, cart_id, order_id
- amount, currency_code, amount_refunded
- provider_id, data, captured_at, canceled_at
- metadata, created_at, updated_at

---

## Custom Entities (To Be Created)

### 1. Seller

Extends the user/customer concept to support sellers.

```sql
CREATE TABLE seller (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES customer(id),
  business_name VARCHAR(255) NOT NULL,
  business_email VARCHAR(255) NOT NULL,
  business_phone VARCHAR(50),
  business_address JSONB,
  tax_id VARCHAR(100),

  -- Verification
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verified_at TIMESTAMP,
  verification_notes TEXT,

  -- Bank/Payout Info
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(100),
  bank_name VARCHAR(255),
  bank_routing_number VARCHAR(100),
  paypal_email VARCHAR(255),

  -- Settings
  commission_rate DECIMAL(5,2), -- Override default rate if needed
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_seller_user_id ON seller(user_id);
CREATE INDEX idx_seller_status ON seller(verification_status);
```

---

### 2. Product Seller Mapping

Links products to sellers (extends Medusa's product table).

```sql
CREATE TABLE product_seller (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES product(id),
  seller_id VARCHAR(255) REFERENCES seller(id),

  -- Inventory for this seller
  quantity INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_seller_product ON product_seller(product_id);
CREATE INDEX idx_product_seller_seller ON product_seller(seller_id);
```

---

### 3. Commission

Tracks commissions per order/line item.

```sql
CREATE TABLE commission (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES "order"(id),
  line_item_id VARCHAR(255),
  seller_id VARCHAR(255) REFERENCES seller(id),

  -- Financial
  order_total DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  seller_payout DECIMAL(10,2) NOT NULL,

  -- Status
  status ENUM('pending', 'approved', 'paid') DEFAULT 'pending',

  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commission_order ON commission(order_id);
CREATE INDEX idx_commission_seller ON commission(seller_id);
CREATE INDEX idx_commission_status ON commission(status);
```

---

### 4. Payout

Tracks seller payouts.

```sql
CREATE TABLE payout (
  id VARCHAR(255) PRIMARY KEY,
  seller_id VARCHAR(255) REFERENCES seller(id),

  -- Financial
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Commission IDs included in this payout
  commission_ids JSONB,

  -- Status
  status ENUM('requested', 'approved', 'processing', 'completed', 'failed') DEFAULT 'requested',
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Payment details
  payment_method ENUM('bank_transfer', 'paypal', 'stripe'),
  payment_reference VARCHAR(255),

  -- Notes
  admin_notes TEXT,

  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payout_seller ON payout(seller_id);
CREATE INDEX idx_payout_status ON payout(status);
```

---

### 5. Review

Product reviews and ratings.

```sql
CREATE TABLE review (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES product(id),
  customer_id VARCHAR(255) REFERENCES customer(id),
  order_id VARCHAR(255) REFERENCES "order"(id),

  -- Review content
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,

  -- Moderation
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  moderated_by VARCHAR(255),
  moderated_at TIMESTAMP,

  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,

  -- Seller response
  seller_response TEXT,
  seller_response_at TIMESTAMP,

  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_review_product ON review(product_id);
CREATE INDEX idx_review_customer ON review(customer_id);
CREATE INDEX idx_review_status ON review(status);
```

---

### 6. Dispute

Handles order disputes between buyers and sellers.

```sql
CREATE TABLE dispute (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES "order"(id),
  raised_by VARCHAR(255) NOT NULL, -- customer_id or seller_id
  raised_by_type ENUM('customer', 'seller'),

  against_id VARCHAR(255) NOT NULL, -- seller_id or customer_id
  against_type ENUM('customer', 'seller'),

  -- Dispute details
  category ENUM('product_issue', 'delivery_issue', 'refund_request', 'fraud', 'other'),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Status
  status ENUM('open', 'under_review', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',

  -- Resolution
  resolved_by VARCHAR(255), -- admin user_id
  resolution TEXT,
  resolved_at TIMESTAMP,

  -- Evidence
  evidence JSONB, -- URLs to uploaded images/documents

  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dispute_order ON dispute(order_id);
CREATE INDEX idx_dispute_raised_by ON dispute(raised_by);
CREATE INDEX idx_dispute_status ON dispute(status);
```

---

### 7. Dispute Message

Messages within a dispute thread.

```sql
CREATE TABLE dispute_message (
  id VARCHAR(255) PRIMARY KEY,
  dispute_id VARCHAR(255) REFERENCES dispute(id),
  sender_id VARCHAR(255) NOT NULL,
  sender_type ENUM('customer', 'seller', 'admin'),

  message TEXT NOT NULL,
  attachments JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dispute_message_dispute ON dispute_message(dispute_id);
```

---

### 8. Commission Configuration

Admin-configurable commission rates.

```sql
CREATE TABLE commission_config (
  id VARCHAR(255) PRIMARY KEY,

  -- Scope
  scope_type ENUM('global', 'category', 'seller'),
  scope_id VARCHAR(255), -- category_id or seller_id if applicable

  -- Rate
  commission_rate DECIMAL(5,2) NOT NULL,

  -- Priority (higher priority overrides lower)
  priority INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,

  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commission_config_scope ON commission_config(scope_type, scope_id);
```

---

### 9. Notification

Centralized notification tracking.

```sql
CREATE TABLE notification (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL, -- customer_id, seller_id, or admin user_id
  user_type ENUM('customer', 'seller', 'admin'),

  -- Notification content
  type VARCHAR(100) NOT NULL, -- 'order_placed', 'payout_approved', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,

  -- Channels
  sent_via JSONB, -- ['email', 'sms', 'in_app']

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  -- Link/Action
  action_url VARCHAR(500),

  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_type ON notification(type);
CREATE INDEX idx_notification_read ON notification(is_read);
```

---

### 10. User Role Extension

Extend Medusa's user/customer tables with role information.

```sql
-- Add role column to customer table (migration)
ALTER TABLE customer
ADD COLUMN role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer';

CREATE INDEX idx_customer_role ON customer(role);
```

---

## Relationships Summary

```
Customer (Medusa)
  ├─> Seller (1:1)
  ├─> Order (1:N)
  ├─> Review (1:N)
  └─> Notification (1:N)

Seller
  ├─> Product (N:M via product_seller)
  ├─> Commission (1:N)
  ├─> Payout (1:N)
  └─> Dispute (1:N)

Product (Medusa)
  ├─> Product_Seller (1:N)
  └─> Review (1:N)

Order (Medusa)
  ├─> Commission (1:N)
  └─> Dispute (1:N)

Dispute
  └─> Dispute_Message (1:N)
```

---

## Indexes for Performance

Key indexes to create:
- All foreign keys
- Status fields (for filtering)
- Date fields (for sorting/filtering)
- User/seller lookup fields
- Frequently queried combinations

---

## Data Migration Strategy

1. **Phase 1:** Install Medusa.js (includes default schema)
2. **Phase 2:** Create custom entities via migrations
3. **Phase 3:** Seed initial data (categories, test products, admin user)
4. **Phase 4:** Add indexes for performance
5. **Phase 5:** Populate test data for development

---

## Notes

- Use Medusa's migration system for all schema changes
- All IDs use VARCHAR(255) to match Medusa's convention
- Use JSONB for flexible metadata/evidence storage
- Soft deletes (deleted_at) for important entities
- All timestamps include created_at, updated_at
- Enums can be implemented as CHECK constraints or separate lookup tables
