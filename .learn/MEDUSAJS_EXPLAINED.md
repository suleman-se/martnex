# Medusa.js Deep Dive - Everything You Need to Know

This document explains **every single detail** about Medusa.js, how it works, and how we're using it in Martnex.

---

## Table of Contents

1. [What is Medusa.js?](#what-is-medusajs)
2. [Why We Chose Medusa.js](#why-we-chose-medusajs)
3. [How Medusa.js Works](#how-medusajs-works)
4. [Medusa.js Architecture](#medusajs-architecture)
5. [Core Concepts](#core-concepts)
6. [File Structure Explained](#file-structure-explained)
7. [How Data Flows](#how-data-flows)
8. [Database & Models](#database--models)
9. [Services Layer](#services-layer)
10. [API Routes](#api-routes)
11. [Events & Subscribers](#events--subscribers)
12. [Customization for Martnex](#customization-for-martnex)
13. [Development Workflow](#development-workflow)
14. [Our Medusa v2 Setup Experience](#our-medusa-v2-setup-experience-latest-findings)

---

## ⚠️ CRITICAL: Correct Import Paths for Medusa v2

**ALWAYS use these exact import paths:**

```typescript
// ✅ CORRECT - For modules, services, models
import { Module } from "@medusajs/utils"
import { MedusaService } from "@medusajs/utils"
import { model } from "@medusajs/utils"
import { defineConfig, loadEnv } from "@medusajs/utils"

// ❌ WRONG - Do NOT use this path
import { Module } from "@medusajs/framework/utils"  // WRONG!
```

**Package Structure:**
- `@medusajs/utils` - Contains `Module`, `MedusaService`, `model`, `defineConfig`
- `@medusajs/framework` - Contains `./config`, `./database`, `./logger` (different exports)
- `@medusajs/medusa` - Core commerce modules

**Configuration Structure:**

```typescript
// medusa-config.ts
import { loadEnv, defineConfig } from "@medusajs/utils"

loadEnv(process.env.NODE_ENV, process.cwd())

module.exports = defineConfig({
  projectConfig: { ... },
  modules: [  // ✅ ARRAY, not object!
    {
      resolve: "@medusajs/event-bus-redis",
      options: { ... }
    },
    {
      resolve: "./src/modules/seller",  // ✅ Full path with ./src/
    },
  ],
})
```

**Common Mistakes:**
- ❌ Using `modules: {}` (object) - Should be `modules: []` (array)
- ❌ Path `./modules/seller` - Should be `./src/modules/seller`
- ❌ Import from `@medusajs/framework/utils` - Should be `@medusajs/utils`

---

## What is Medusa.js?

**Medusa.js** is an **open-source e-commerce platform** (like Shopify, but you own the code).

### Simple Explanation:
Think of Medusa.js as a ready-made **e-commerce engine** that handles:
- Products (creating, updating, deleting)
- Shopping carts
- Orders and checkout
- Payments (Stripe, PayPal)
- Inventory management
- Customer accounts
- Admin dashboard

Instead of building all this from scratch (which takes months), Medusa gives us a solid foundation.

### Key Points:
- **Built on Node.js** and **Express.js** (web framework)
- **Uses PostgreSQL** for database
- **MikroORM** for database queries (replaces TypeORM in v2)
- **Module-first architecture** (v2 feature)
- **Workflows engine** for complex operations
- **API-first** design (REST endpoints)
- **Headless** (backend only, frontend is separate)
- **Extensible** via modules (we can add custom features)

---

## Why We Chose Medusa.js

### Problem We're Solving:
We want to build a **multi-vendor marketplace** (like Etsy or Amazon). Building this from scratch would require:
- Product management system (3-4 weeks)
- Shopping cart logic (2 weeks)
- Payment processing (2-3 weeks)
- Order management (2-3 weeks)
- Admin panel (4-5 weeks)
- **Total: 3-4 months minimum**

### Solution:
Medusa.js gives us **80% of this for free**. We only need to add:
- Multi-vendor features (sellers)
- Commission system
- Seller dashboard
- Payout management

### Why Medusa.js vs Others?

| Feature | Medusa.js | Shopify | WooCommerce | Saleor |
|---------|-----------|---------|-------------|--------|
| **Open Source** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Own Your Code** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Modern Stack** | ✅ Node.js | ❌ Ruby | ❌ PHP | ✅ Python |
| **API-First** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Extensible** | ✅ Easy | ❌ Limited | ✅ Yes | ✅ Yes |
| **Active Development** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Multi-vendor Ready** | ⚠️ Need to add | ❌ Paid only | ⚠️ Plugins | ⚠️ Need to add |

**Winner: Medusa.js** because:
1. Modern JavaScript/TypeScript (we know this)
2. Easy to extend (we can add sellers, commissions)
3. Great documentation
4. Active community
5. Built on Express (familiar framework)

---

## How Medusa.js Works

### High-Level Flow:

```
┌─────────────┐
│   Browser   │ → Makes request (e.g., "Add to cart")
└─────────────┘
       ↓
┌─────────────────────────────────────┐
│    Medusa Backend (Port 9000)       │
│                                     │
│  1. API Route receives request      │
│  2. Service handles business logic  │
│  3. Database stores/retrieves data  │
│  4. Response sent back              │
└─────────────────────────────────────┘
       ↓
┌─────────────┐
│  PostgreSQL │ ← Stores all data
└─────────────┘
```

### Example: Adding Item to Cart

**Step 1:** User clicks "Add to Cart" on product
```javascript
// Frontend makes API call
POST http://localhost:9000/store/carts/cart_123/line-items
{
  "variant_id": "variant_456",
  "quantity": 2
}
```

**Step 2:** Medusa API Route receives request
```javascript
// File: backend/node_modules/@medusajs/medusa/api/routes/store/carts/...
// Medusa handles this automatically!
```

**Step 3:** Cart Service processes the request
```javascript
// File: backend/node_modules/@medusajs/medusa/services/cart.ts
class CartService {
  async addLineItem(cartId, item) {
    // 1. Find the cart in database
    // 2. Check if product exists
    // 3. Check inventory
    // 4. Calculate price
    // 5. Add item to cart
    // 6. Save to database
    return updatedCart
  }
}
```

**Step 4:** Database stores the data
```sql
INSERT INTO cart_items (cart_id, variant_id, quantity, price)
VALUES ('cart_123', 'variant_456', 2, 29.99);
```

**Step 5:** Response sent back
```javascript
{
  "cart": {
    "id": "cart_123",
    "items": [
      {
        "id": "item_789",
        "variant_id": "variant_456",
        "quantity": 2,
        "unit_price": 29.99,
        "total": 59.98
      }
    ],
    "subtotal": 59.98,
    "total": 59.98
  }
}
```

---

## Medusa.js Architecture

### Layer Structure:

```
┌──────────────────────────────────────────┐
│           API LAYER (Routes)             │  ← HTTP endpoints
│  - /store/*  (customer-facing)           │
│  - /admin/*  (admin panel)               │
└──────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│        SERVICES LAYER (Business Logic)   │  ← Where magic happens
│  - CartService                           │
│  - ProductService                        │
│  - OrderService                          │
└──────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│        MODELS LAYER (Data Structure)     │  ← Database schema
│  - Cart                                  │
│  - Product                               │
│  - Order                                 │
└──────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│            DATABASE (PostgreSQL)         │  ← Actual data storage
└──────────────────────────────────────────┘
```

### Communication Flow:

1. **Client** makes HTTP request → **API Route**
2. **API Route** validates input → calls **Service**
3. **Service** performs business logic → queries **Model**
4. **Model** interacts with **Database**
5. **Database** returns data → **Model** → **Service** → **API Route** → **Client**

---

## Core Concepts

### 1. Data Models (Database Tables) - v2 Approach

**What:** Define the structure of data in database using Medusa's Data Model Language (DML)

**Example:** Product Model in v2 (Simple DML Syntax)
```typescript
// File: backend/src/modules/product/models/product.ts
// CORRECT IMPORT PATH: @medusajs/utils (NOT @medusajs/framework/utils)
import { model } from "@medusajs/utils"

const Product = model.define("product", {
  id: model.id().primaryKey(),
  title: model.text(),
  description: model.text().nullable(),
  price: model.bigNumber(), // Stored in major units (dollars, not cents)
  inventory_quantity: model.integer().default(0),
  seller_id: model.text(), // Link to seller for multi-vendor
  created_at: model.timestamps().createdAt(),
  updated_at: model.timestamps().updatedAt(),
})

export default Product
```

**What this means:**
- Creates a `product` table in PostgreSQL using MikroORM
- Clean, simple syntax without decorators
- Automatically includes `created_at`, `updated_at`, `deleted_at`
- `seller_id` links products to sellers (multi-vendor feature)
- Prices stored in major units (see Pricing Changes section)

**Database table created (auto-generated via migrations):**
```sql
CREATE TABLE product (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  inventory_quantity INTEGER DEFAULT 0,
  seller_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

**Key Changes from v1 (TypeORM):**
- ✅ No `@Entity()` or `@Column()` decorators
- ✅ Use `model.define()` instead of TypeORM's `@Entity()`
- ✅ Prices in major units (not cents)
- ✅ Migrations auto-generated: `npx medusa db:generate product`
- ✅ Uses MikroORM instead of TypeORM

---

### 2. Services (Business Logic) - v2 Module Services

**What:** Handle all business operations within a module using auto-generated CRUD methods

**Example:** Product Service in v2 (Using Service Factory)
```typescript
// File: backend/src/modules/product/service.ts
// CORRECT IMPORT: @medusajs/utils
import { MedusaService } from "@medusajs/utils"
import Product from "./models/product"

class ProductModuleService extends MedusaService({
  Product,
}) {
  // Auto-generated methods from MedusaService:
  // - retrieveProduct(productId)
  // - createProducts(data)
  // - updateProducts(productId, data)
  // - deleteProducts(productId)
  // - listProducts(filters)
  // - listAndCountProducts()

  // Custom method: Get seller's products
  async getSellerProducts(sellerId: string) {
    const products = await this.listProducts({
      filters: { seller_id: sellerId }
    })
    return products
  }

  // Custom method: Check if product is in stock
  async isInStock(productId: string, quantity: number) {
    const product = await this.retrieveProduct(productId)
    return product.inventory_quantity >= quantity
  }
}

export default ProductModuleService
```

**What this service provides:**
- ✅ Auto-generated CRUD methods from `MedusaService`
- ✅ Custom business logic methods
- ✅ Encapsulates module-specific operations
- ✅ Registered automatically in Medusa container
- ✅ Reusable across workflows, routes, and subscribers

**Key Changes from v1:**
- ✅ Extend `MedusaService` for auto-generated methods
- ✅ No manual repository management
- ✅ Methods auto-generated: `createProducts`, `retrieveProduct`, `updateProducts`, `deleteProducts`, etc.
- ✅ Services live inside modules (not separate `src/services` folder)

---

### 3. API Routes (Endpoints)

**What:** HTTP endpoints that clients call

**Example:** Product Routes
```typescript
// File: backend/src/api/routes/store/products/index.ts
import { Router } from "express"

const router = Router()

// GET /store/products (list all products)
router.get("/", async (req, res) => {
  const productService = req.scope.resolve("productService")
  const products = await productService.list()
  res.json({ products })
})

// GET /store/products/:id (get single product)
router.get("/:id", async (req, res) => {
  const productService = req.scope.resolve("productService")
  const product = await productService.retrieve(req.params.id)
  res.json({ product })
})

export default router
```

**What this means:**
- `GET /store/products` returns list of products
- `GET /store/products/prod_123` returns single product
- Services are injected automatically (dependency injection)

---

### 4. Subscribers (Event Listeners)

**What:** React to events happening in the system

**Example:** Order Placed Event (v2 Pattern)
```typescript
// File: backend/src/subscribers/order-placed.ts
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { sendOrderConfirmationWorkflow } from "../workflows/send-order-confirmation"
import { calculateSellerCommissionWorkflow } from "../workflows/calculate-seller-commission"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  // Instead of implementing logic here, call workflows
  // This ensures data consistency and proper error handling

  // Send confirmation email (as workflow)
  await sendOrderConfirmationWorkflow(container)
    .run({
      input: { order_id: data.id },
    })

  // Calculate seller commission (as workflow)
  await calculateSellerCommissionWorkflow(container)
    .run({
      input: { order_id: data.id },
    })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

**What this does:**
- When an order is placed, this runs automatically
- Calls workflows (not inline logic) for error handling
- Workflows ensure rollback on failure
- Decouples logic via workflows (best practice in v2)

**Key Changes from v1:**
- ✅ Use `SubscriberArgs` and `SubscriberConfig` from `@medusajs/framework`
- ✅ Parameter structure: `{ event: { data }, container }`
- ✅ Call workflows instead of implementing logic directly
- ✅ Export config separately

---

## File Structure Explained

### Our Medusa Backend Structure:

```
backend/
├── src/
│   ├── models/              # Database tables (custom)
│   │   ├── seller.ts        # Seller model
│   │   ├── commission.ts    # Commission model
│   │   └── payout.ts        # Payout model
│   │
│   ├── services/            # Business logic (custom)
│   │   ├── seller.ts        # Seller operations
│   │   ├── commission.ts    # Commission calculations
│   │   └── payout.ts        # Payout processing
│   │
│   ├── api/                 # API endpoints (custom)
│   │   └── routes/
│   │       ├── seller/      # Seller routes
│   │       │   ├── register.ts
│   │       │   ├── products.ts
│   │       │   └── earnings.ts
│   │       └── admin/       # Admin routes
│   │           ├── sellers.ts
│   │           └── commissions.ts
│   │
│   ├── subscribers/         # Event handlers (custom)
│   │   ├── order.ts         # Handle order events
│   │   └── payout.ts        # Handle payout events
│   │
│   └── migrations/          # Database migrations
│       ├── 1234567890-CreateSeller.ts
│       └── 1234567891-CreateCommission.ts
│
├── medusa-config.ts         # Medusa v2 configuration (TypeScript)
├── package.json             # Dependencies
└── Dockerfile               # Docker setup
```

### What Each Folder Does:

#### **models/**
- Defines database tables
- We add custom tables (Seller, Commission, Payout)
- Medusa's default tables (Product, Cart, Order) are built-in

#### **services/**
- Business logic for our custom features
- SellerService: register sellers, verify sellers, list sellers
- CommissionService: calculate commissions, track earnings
- PayoutService: process payouts, send to Stripe

#### **api/routes/**
- HTTP endpoints for our custom features
- `/seller/*` - Seller dashboard APIs
- `/admin/*` - Admin panel APIs
- Medusa's default routes (`/store/*`, `/admin/*`) are built-in

#### **subscribers/**
- React to events in the system
- When order is placed → calculate commission
- When payout is approved → send money to seller

#### **migrations/**
- Database schema changes
- Each migration creates/modifies tables
- Run in order (timestamp-based)

---

## How Data Flows

### Example: Customer Places Order

**Step-by-Step:**

```
1. Customer clicks "Checkout"
   ↓
2. Frontend calls: POST /store/carts/cart_123/complete
   ↓
3. Medusa CartService.complete()
   - Validates cart items
   - Checks inventory
   - Processes payment (Stripe)
   - Creates Order record
   ↓
4. Medusa emits event: "order.placed"
   ↓
5. Our OrderSubscriber.handleOrderPlaced() runs
   - Reads order details
   - Finds which seller owns each product
   - Calculates commission for each seller
   - Creates Commission records
   ↓
6. Database now has:
   - Order (created by Medusa)
   - Commission records (created by us)
   ↓
7. Seller sees earnings in dashboard
```

### Data Flow Diagram:

```
┌────────────┐
│  Customer  │
└────────────┘
      ↓ Places order
┌──────────────────────┐
│   Medusa CartService │ → Creates Order
└──────────────────────┘
      ↓ Emits "order.placed" event
┌────────────────────────┐
│  Our OrderSubscriber   │ → Calculates commissions
└────────────────────────┘
      ↓ Saves to database
┌─────────────────────────────────┐
│  Database Tables:               │
│  - orders (Medusa default)      │
│  - commissions (our custom)     │
│  - payouts (our custom)         │
└─────────────────────────────────┘
```

---

## Database & Models

### Medusa's Default Tables:

Medusa creates these tables automatically:
- `products` - Product catalog
- `product_variants` - Product options (size, color)
- `carts` - Shopping carts
- `line_items` - Items in carts/orders
- `orders` - Completed purchases
- `customers` - User accounts
- `payments` - Payment records
- `shipping_methods` - Delivery options
- `regions` - Geographic regions (countries, currencies)

### Our Custom Tables:

We'll add these for multi-vendor features:
- `sellers` - Seller accounts
- `commissions` - Earnings per order
- `payouts` - Money transfers to sellers
- `disputes` - Customer complaints

### Example: Seller Model

```typescript
// File: backend/src/models/seller.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { User } from "@medusajs/medusa"

@Entity()
export class Seller {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  user_id: string // Link to Medusa's User table

  @ManyToOne(() => User)
  user: User

  @Column()
  business_name: string

  @Column()
  business_email: string

  @Column({ type: "enum", enum: ["pending", "approved", "rejected"] })
  status: string

  @Column({ type: "decimal", default: 10.0 })
  commission_rate: number // Platform takes 10% by default

  @Column({ type: "jsonb", nullable: true })
  payout_info: {
    stripe_account_id: string
    bank_account: string
  }

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date
}
```

**What this creates:**
```sql
CREATE TABLE sellers (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  business_name VARCHAR NOT NULL,
  business_email VARCHAR NOT NULL,
  status VARCHAR CHECK (status IN ('pending', 'approved', 'rejected')),
  commission_rate DECIMAL DEFAULT 10.0,
  payout_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Services Layer

### What Services Do:

Services encapsulate **all business logic** for a feature.

### Example: SellerService

```typescript
// File: backend/src/services/seller.ts
import { TransactionBaseService } from "@medusajs/medusa"

class SellerService extends TransactionBaseService {
  constructor({ sellerRepository, userService, eventBus }) {
    super(arguments[0])
    this.sellerRepository = sellerRepository
    this.userService = userService
    this.eventBus = eventBus
  }

  // Register a new seller
  async register(data) {
    // 1. Validate input
    if (!data.business_name || !data.business_email) {
      throw new Error("Business name and email required")
    }

    // 2. Create user account (using Medusa's UserService)
    const user = await this.userService.create({
      email: data.business_email,
      password: data.password,
      role: "seller"
    })

    // 3. Create seller record
    const seller = this.sellerRepository.create({
      user_id: user.id,
      business_name: data.business_name,
      business_email: data.business_email,
      status: "pending" // Needs admin approval
    })

    // 4. Save to database
    await this.sellerRepository.save(seller)

    // 5. Emit event (for notifications)
    this.eventBus.emit("seller.registered", { seller_id: seller.id })

    return seller
  }

  // Get seller by ID
  async retrieve(sellerId) {
    const seller = await this.sellerRepository.findOne(sellerId, {
      relations: ["user"] // Include user data
    })

    if (!seller) {
      throw new Error("Seller not found")
    }

    return seller
  }

  // Approve seller
  async approve(sellerId) {
    const seller = await this.retrieve(sellerId)

    seller.status = "approved"
    await this.sellerRepository.save(seller)

    // Emit event (send approval email)
    this.eventBus.emit("seller.approved", { seller_id: seller.id })

    return seller
  }

  // Get seller earnings
  async getEarnings(sellerId) {
    // Query commissions for this seller
    const commissions = await this.commissionRepository.find({
      where: { seller_id: sellerId },
      relations: ["order"]
    })

    const total = commissions.reduce((sum, c) => sum + c.amount, 0)
    const pending = commissions.filter(c => c.status === "pending")
    const paid = commissions.filter(c => c.status === "paid")

    return {
      total_earned: total,
      pending_amount: pending.reduce((sum, c) => sum + c.amount, 0),
      paid_amount: paid.reduce((sum, c) => sum + c.amount, 0),
      commissions
    }
  }
}

export default SellerService
```

**What this service provides:**
- `register()` - Register new seller
- `retrieve()` - Get seller details
- `approve()` - Admin approves seller
- `getEarnings()` - Calculate seller earnings

---

## API Routes

### What API Routes Do:

Routes are **HTTP endpoints** that clients call.

### Example: Seller Registration Route

```typescript
// File: backend/src/api/routes/seller/register.ts
import { Router } from "express"

const router = Router()

router.post("/register", async (req, res) => {
  try {
    // 1. Get SellerService (dependency injection)
    const sellerService = req.scope.resolve("sellerService")

    // 2. Validate input
    const { business_name, business_email, password } = req.body

    if (!business_name || !business_email || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      })
    }

    // 3. Call service
    const seller = await sellerService.register({
      business_name,
      business_email,
      password
    })

    // 4. Return response
    res.status(201).json({
      success: true,
      data: {
        seller: {
          id: seller.id,
          business_name: seller.business_name,
          status: seller.status
        }
      }
    })

  } catch (error) {
    console.error("Seller registration error:", error)

    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
```

**How to use this API:**
```bash
curl -X POST http://localhost:9000/seller/register \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "My Shop",
    "business_email": "shop@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "seller": {
      "id": "seller_abc123",
      "business_name": "My Shop",
      "status": "pending"
    }
  }
}
```

---

## Events & Subscribers

### What Events Are:

Events are **notifications** that something happened in the system.

### Built-in Medusa Events:

- `order.placed` - Order was created
- `order.completed` - Payment successful
- `order.canceled` - Order was cancelled
- `product.created` - New product added
- `customer.created` - New customer registered

### Custom Events We'll Add:

- `seller.registered` - New seller signed up
- `seller.approved` - Admin approved seller
- `commission.calculated` - Commission was calculated
- `payout.requested` - Seller requested payout
- `payout.completed` - Money sent to seller

### Example: Order Event Subscriber

```typescript
// File: backend/src/subscribers/order.ts
class OrderSubscriber {
  constructor({ eventBusService, commissionService, emailService }) {
    this.commissionService = commissionService
    this.emailService = emailService

    // Subscribe to order events
    eventBusService.subscribe("order.placed", this.handleOrderPlaced)
  }

  handleOrderPlaced = async (data) => {
    const { id: orderId } = data

    console.log(`Order ${orderId} was placed, calculating commissions...`)

    // 1. Calculate commissions for all sellers in this order
    const commissions = await this.commissionService.calculateForOrder(orderId)

    console.log(`Created ${commissions.length} commission records`)

    // 2. Send email to each seller
    for (const commission of commissions) {
      await this.emailService.sendSellerNotification(
        commission.seller_id,
        `You earned $${commission.amount} from order ${orderId}`
      )
    }

    console.log("Seller notifications sent")
  }
}

export default OrderSubscriber
```

**What happens:**
1. Customer completes checkout
2. Medusa creates Order record
3. Medusa emits `order.placed` event
4. Our `OrderSubscriber.handleOrderPlaced()` runs automatically
5. We calculate commissions
6. We send emails to sellers

---

## Customization for Martnex

### What We're Adding:

Medusa gives us basic e-commerce. We're adding:

1. **Seller Management**
   - Seller registration
   - Admin approval workflow
   - Seller verification

2. **Multi-Vendor Products**
   - Products belong to sellers
   - Seller dashboard to manage products

3. **Commission System**
   - Calculate commission on each sale
   - Track pending vs paid commissions
   - Support different commission rates

4. **Payout System**
   - Sellers request payouts
   - Admin approves payouts
   - Integration with Stripe Connect

5. **Seller Dashboard**
   - View earnings
   - Manage products
   - Request payouts
   - View orders

### How We Customize:

#### 1. Extend Medusa Models

Add `seller_id` to Product model:
```typescript
// File: backend/src/models/product.ts
import { Product as MedusaProduct } from "@medusajs/medusa"
import { Entity, Column, ManyToOne } from "typeorm"
import { Seller } from "./seller"

@Entity()
export class Product extends MedusaProduct {
  @Column()
  seller_id: string

  @ManyToOne(() => Seller)
  seller: Seller
}
```

#### 2. Override Medusa Services

Modify ProductService to filter by seller:
```typescript
// File: backend/src/services/product.ts
import { ProductService as MedusaProductService } from "@medusajs/medusa"

class ProductService extends MedusaProductService {
  // Get products for a specific seller
  async listBySeller(sellerId) {
    return await this.productRepository.find({
      where: { seller_id: sellerId }
    })
  }

  // Override create to add seller_id
  async create(data) {
    if (!data.seller_id) {
      throw new Error("seller_id is required")
    }
    return await super.create(data)
  }
}
```

#### 3. Add Custom Routes

Create seller-specific endpoints:
```typescript
// File: backend/src/api/routes/seller/products.ts
router.get("/products", authenticate, async (req, res) => {
  const sellerId = req.user.seller_id
  const productService = req.scope.resolve("productService")

  const products = await productService.listBySeller(sellerId)

  res.json({ products })
})
```

---

## Development Workflow

### How to Develop with Medusa:

#### 1. Start Medusa Backend

```bash
cd backend
pnpm run dev
```

**What this does:**
- Starts Express server on port 9000
- Watches for file changes (hot reload)
- Connects to PostgreSQL database
- Exposes API endpoints

#### 2. Access Admin Dashboard

```bash
# Backend runs admin UI automatically
# Open browser: http://localhost:7001
# Login: admin@martnex.io / supersecret
```

**What you can do:**
- View products, orders, customers
- Create test products
- Test checkout flow
- Configure settings

#### 3. Test API Endpoints

```bash
# Using curl
curl http://localhost:9000/store/products

# Or use Thunder Client, Postman, Insomnia
```

#### 4. Create Database Migration

```bash
cd backend
pnpm medusa migrations create AddSellerIdToProduct
```

**Creates file:**
```typescript
// backend/src/migrations/1234567890-AddSellerIdToProduct.ts
export class AddSellerIdToProduct1234567890 {
  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN seller_id VARCHAR
    `)
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE products
      DROP COLUMN seller_id
    `)
  }
}
```

**Run migration:**
```bash
pnpm medusa migrations run
```

#### 5. Add Custom Service

```bash
# Create file: backend/src/services/seller.ts
# Medusa auto-discovers services!
```

**Medusa automatically:**
- Registers the service
- Makes it available via dependency injection
- Exposes it to routes

#### 6. Add Custom Route

```bash
# Create file: backend/src/api/routes/seller/index.ts
```

**Medusa automatically:**
- Registers the route
- Makes it accessible at `/seller/*`

#### 7. Test Everything

```bash
# Run tests
pnpm test

# Check types
pnpm tsc --noEmit

# Lint code
pnpm lint
```

---

## Common Patterns

### Pattern 1: Creating a Resource

**Steps:**
1. Create Model (database table)
2. Create Service (business logic)
3. Create API Route (endpoint)
4. Create Migration (apply schema changes)

**Example: Adding Seller Resource**

```bash
# 1. Create model
touch backend/src/models/seller.ts

# 2. Create service
touch backend/src/services/seller.ts

# 3. Create routes
mkdir backend/src/api/routes/seller
touch backend/src/api/routes/seller/index.ts

# 4. Create migration
pnpm medusa migrations create CreateSeller
```

### Pattern 2: Handling Events

**Steps:**
1. Create Subscriber
2. Listen to event
3. Handle event

**Example:**
```typescript
// backend/src/subscribers/seller.ts
class SellerSubscriber {
  constructor({ eventBusService, emailService }) {
    eventBusService.subscribe("seller.approved", async (data) => {
      await emailService.send({
        to: data.seller_email,
        subject: "Congratulations! Your seller account is approved",
        template: "seller-approved"
      })
    })
  }
}
```

### Pattern 3: Dependency Injection

**How Medusa injects services:**
```typescript
// In routes
const sellerService = req.scope.resolve("sellerService")

// In services
class MyService {
  constructor({ sellerService, productService }) {
    this.sellerService = sellerService
    this.productService = productService
  }
}
```

**Medusa automatically:**
- Finds services by name
- Injects them where needed
- Manages their lifecycle

---

## Summary

### What You Need to Remember:

1. **Medusa.js = E-commerce Backend**
   - Handles products, carts, orders, payments
   - Built on Node.js + Express + PostgreSQL
   - API-first, headless architecture

2. **We Customize It For Multi-Vendor**
   - Add Seller model, service, routes
   - Add Commission calculation
   - Add Payout management
   - Extend Product to link to sellers

3. **Development is Simple**
   - Create models → database tables
   - Create services → business logic
   - Create routes → API endpoints
   - Medusa auto-discovers everything

4. **File Structure**
   - `models/` = database tables
   - `services/` = business logic
   - `api/routes/` = HTTP endpoints
   - `subscribers/` = event handlers
   - `migrations/` = database changes

5. **Data Flow**
   - Client → Route → Service → Model → Database
   - Database → Model → Service → Route → Client
   - Complex processes → Workflows (with error handling)

---

## Medusa v2 Architecture (Complete Overhaul)

### What Changed in v2?

Medusa v2 is a **major rewrite** from v1 with a module-first architecture. Here are the key changes:

### 1. Module-First Architecture (New in v2)

**v1 Approach (Outdated):**
```
src/
├── models/ (all entities together)
├── services/ (all services together)
├── api/routes/ (all routes together)
└── subscribers/ (all subscribers together)
```

**v2 Approach (New - Modular):**
```
src/
└── modules/
    ├── product/ (product module)
    │   ├── models/
    │   ├── service.ts
    │   ├── index.ts (module definition)
    │   └── migrations/
    ├── seller/ (seller module)
    │   ├── models/
    │   ├── service.ts
    │   ├── index.ts
    │   └── migrations/
    ├── order/ (order module)
    │   ├── models/
    │   ├── service.ts
    │   ├── index.ts
    │   └── migrations/
    └── commission/ (custom module)
        ├── models/
        ├── service.ts
        ├── index.ts
        └── migrations/
```

**Benefits:**
- ✅ Code is organized by domain (seller, product, order)
- ✅ Easy to understand - everything related to sellers is in `modules/seller`
- ✅ Easy to test - each module is isolated
- ✅ Easy to reuse - modules can be shared across projects
- ✅ Easy to scale - add new modules without touching existing ones

**Module Definition:**
```typescript
// src/modules/product/index.ts
import { Module } from "@medusajs/framework/utils"
import ProductService from "./service"

export default Module("product", {
  service: ProductService,
})
```

### 2. Module Links (New in v2 - Replaces Entity Relationships)

**v1 Approach (Outdated - Extended Entities):**
```typescript
// v1: Extend the Product entity to add seller_id
@Entity()
export class Product extends BaseEntity {
  @Column()
  seller_id: string // Direct column
}
```

**v2 Approach (New - Module Links):**
```typescript
// src/links/product-seller.ts
import ProductModule from "../modules/product"
import SellerModule from "../modules/seller"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true, // One seller has many products
  },
  SellerModule.linkable.seller
)
```

**Benefits:**
- ✅ No entity extension needed
- ✅ Loose coupling between modules
- ✅ Easy to query related data
- ✅ Custom columns on links
- ✅ Read-only links for security

**Query with Links:**
```typescript
// Get product with seller
const product = await productService.retrieveProduct(productId, {
  relations: ["seller"], // Via module link
})

// Get seller's products
const seller = await sellerService.retrieveSeller(sellerId, {
  relations: ["products"], // Via module link
})
```

### 3. Workflows Engine (New in v2 - Replaces Events)

**v1 Approach (Outdated - Events & Subscribers):**
```typescript
// v1: Emit event, subscriber listens
eventBus.emit("seller.registered", { seller_id })

// Later, subscriber reacts (might fail without rollback)
subscriber handles event but direct logic had no rollback
```

**v2 Approach (New - Workflows):**
```typescript
// src/workflows/register-seller.ts
import { createWorkflow, createStep, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { SELLER_MODULE } from "../modules/seller"

const registerSellerStep = createStep(
  "register-seller",
  async ({ data }, { container }) => {
    const sellerService = container.resolve(SELLER_MODULE)
    const seller = await sellerService.create(data)
    return new StepResponse(seller)
  },
  async (seller, { container }) => {
    // Rollback function - runs if later step fails
    const sellerService = container.resolve(SELLER_MODULE)
    await sellerService.delete(seller.id)
  }
)

const sendWelcomeEmailStep = createStep(
  "send-welcome-email",
  async ({ seller }, { container }) => {
    const emailService = container.resolve("emailService")
    await emailService.send({
      to: seller.email,
      template: "welcome"
    })
    return new StepResponse({ success: true })
  }
)

export const registerSellerWorkflow = createWorkflow(
  "register-seller",
  ({ data }) => {
    const seller = registerSellerStep({ data })
    const email = sendWelcomeEmailStep({ seller })
    return new WorkflowResponse(seller)
  }
)
```

**Execute Workflow:**
```typescript
// In API route
const { result: seller } = await registerSellerWorkflow(req.scope)
  .run({
    input: {
      data: {
        email: "seller@example.com",
        business_name: "My Shop"
      }
    }
  })
```

**Benefits:**
- ✅ Automatic error handling
- ✅ Rollback on failure (like database transactions)
- ✅ Parallel steps supported
- ✅ Long-running workflows
- ✅ Workflow hooks for customization
- ✅ Better debugging

### 4. Service Factory (Auto-Generated CRUD Methods)

**v1 Approach (Outdated - Manual Methods):**
```typescript
// v1: Write every CRUD method manually
class ProductService {
  async create(data) { /* manual */ }
  async retrieve(id) { /* manual */ }
  async update(id, data) { /* manual */ }
  async delete(id) { /* manual */ }
  async list() { /* manual */ }
}
```

**v2 Approach (New - Auto-Generated):**
```typescript
// v2: Extend MedusaService for auto-generated methods
// CORRECT IMPORT: @medusajs/utils
import { MedusaService } from "@medusajs/utils"
import Product from "./models/product"

class ProductService extends MedusaService({ Product }) {
  // Auto-generated methods:
  // - createProducts(data) ✅ Automatic
  // - retrieveProduct(id) ✅ Automatic
  // - updateProducts(id, data) ✅ Automatic
  // - deleteProducts(id) ✅ Automatic
  // - listProducts() ✅ Automatic
  // - listAndCountProducts() ✅ Automatic

  // Add custom methods
  async getSellerProducts(sellerId) {
    return this.listProducts({
      filters: { seller_id: sellerId }
    })
  }
}
```

**Benefits:**
- ✅ 80% less boilerplate code
- ✅ Consistent method naming
- ✅ Built-in filtering, pagination, relations
- ✅ Type-safe

### 5. Pricing Changes (Prices in Major Units)

**v1 Approach (Outdated - Cents/Cents):**
```typescript
// v1: Price $19.99 stored as 1999 (cents)
const product = {
  price: 1999 // This is 1999 cents = $19.99
}
```

**v2 Approach (New - Major Units):**
```typescript
// v2: Price $19.99 stored as 19.99 (dollars)
const product = {
  price: 19.99 // This is $19.99 directly
}
```

**Calculation Impact:**
```typescript
// v1: Manual conversion needed
const totalPrice = (price / 100) * quantity

// v2: Direct calculation
const totalPrice = price * quantity

// No more division by 100!
```

### 6. Data Model Language (DML) - New in v2

**v1 Approach (Outdated - TypeORM Decorators):**
```typescript
// v1: TypeORM with decorators
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Commission {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  seller_id: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number

  @Column({ type: "varchar", length: 50 })
  status: string

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date
}
```

**v2 Approach (New - DML):**
```typescript
// v2: Medusa DML - cleaner, simpler
import { model } from "@medusajs/framework/utils"

const Commission = model.define("commission", {
  id: model.id().primaryKey(),
  seller_id: model.text(),
  amount: model.bigNumber(), // Decimal number
  status: model.enum({
    values: ["pending", "processed", "failed"],
    default: "pending"
  }),
  created_at: model.timestamps().createdAt(),
})

export default Commission
```

**Benefits:**
- ✅ No decorators
- ✅ Simpler syntax
- ✅ Automatic timestamps
- ✅ Type safety
- ✅ Automatic migration generation

### 7. API Routes with Protected Routes

**v1 Approach (Outdated - Manual Authentication):**
```typescript
// v1: Manual auth checking in routes
router.post("/seller/register", (req, res) => {
  // Check auth manually
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  // ...
})
```

**v2 Approach (New - Middleware-Based):**
```typescript
// src/api/middlewares.ts
import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/seller/admin*", // Admin routes
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/store/customers/me*", // Customer routes
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
```

**API Route:**
```typescript
// src/api/store/seller/register/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { registerSellerWorkflow } from "../../../../workflows/register-seller"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result: seller } = await registerSellerWorkflow(req.scope).run({
    input: req.body,
  })

  res.json({ seller })
}
```

**Benefits:**
- ✅ Centralized auth management
- ✅ Multiple auth methods (session, bearer token, API key)
- ✅ Clean separation of concerns
- ✅ Easy to test

### 8. Events & Subscribers (Still in v2, But Different)

**v1 Approach (Outdated - Constructor Injection):**
```typescript
// v1: Old pattern
class OrderSubscriber {
  constructor({ eventBusService }) {
    eventBusService.subscribe("order.placed", this.handleOrderPlaced)
  }
}
```

**v2 Approach (New - Function Export):**
```typescript
// v2: New pattern
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { completeOrderWorkflow } from "../workflows/complete-order"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  // Call workflow instead of direct logic
  await completeOrderWorkflow(container).run({
    input: { order_id: data.id },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

**Benefits:**
- ✅ Cleaner syntax
- ✅ Integrated with workflows
- ✅ Better error handling
- ✅ Easier to test

### 9. Migration Management

**v1 Approach (Outdated - Manual Migrations):**
```bash
# v1: Manual creation and setup
medusa migrations create AddSellerToProduct
# Then manually write SQL...
```

**v2 Approach (New - Auto-Generated):**
```bash
# v2: Auto-generated from data models
npx medusa db:generate product

# This creates migration from your DML models!
# No manual SQL needed!
```

**v2 Generated Migration:**
```typescript
// src/modules/product/migrations/Migration20241121_AddSeller.ts
import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20241121_AddSeller extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "product" add column "seller_id" text;')
  }

  async down(): Promise<void> {
    this.addSql('alter table "product" drop column "seller_id";')
  }
}
```

### 10. Commerce Modules (Built-In Modules)

Medusa v2 comes with these pre-built modules:

**Cart Module:**
- Add items to cart
- Update quantities
- Apply discounts
- Calculate totals

**Product Module:**
- Product catalog
- Variants
- Collections
- Images

**Order Module:**
- Order management
- Line items
- Fulfillment
- Promotions

**Payment Module:**
- Multiple payment providers
- Authorize payments
- Capture payments
- Refunds

**Inventory Module:**
- Stock management
- Reservations
- Stock levels

**Customer Module:**
- Customer accounts
- Customer groups
- Addresses

**Pricing Module:**
- Price rules
- Tier pricing
- Regional pricing

**Many More:**
- Region, Sales Channel, Tax, Currency, Fulfillment, Stock Location, API Keys, User Module, Auth

---

### 1. Modules System

**What:** New architecture for organizing code

**Benefits:**
- Easy to understand
- Easy to customize
- Easy to test
- Easy to share

**Example:**
```typescript
// src/modules/seller/index.ts
import SellerService from "./service"
// CORRECT IMPORT: @medusajs/utils (NOT @medusajs/framework/utils)
import { Module } from "@medusajs/utils"

export const SELLER_MODULE = "seller"

export default Module(SELLER_MODULE, {
  service: SellerService,
})
```

---

### 2. Workflows & Step Functions

**What:** Manage complex business processes with rollback support

**Example: Seller Payout**
```typescript
// src/workflows/seller-payout.ts
import { createWorkflow, createStep, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

const validatePayoutStep = createStep(
  "validate-payout",
  async ({ sellerId, amount }, { container }) => {
    const sellerService = container.resolve("seller")
    const seller = await sellerService.retrieveSeller(sellerId)
    
    if (seller.balance < amount) {
      throw new Error("Insufficient balance")
    }
    
    return new StepResponse({ seller })
  }
)

const processPaymentStep = createStep(
  "process-payment",
  async ({ amount }, { container }) => {
    const paymentService = container.resolve("payment")
    const payment = await paymentService.capturePayment({
      amount,
      method: "bank_transfer"
    })
    return new StepResponse(payment)
  },
  async (payment, { container }) => {
    // Rollback: refund if later step fails
    const paymentService = container.resolve("payment")
    await paymentService.refundPayment(payment.id, payment.amount)
  }
)

export const sellerPayoutWorkflow = createWorkflow(
  "seller-payout",
  ({ sellerId, amount }) => {
    const { seller } = validatePayoutStep({ sellerId, amount })
    const payment = processPaymentStep({ amount })
    
    return new WorkflowResponse({
      seller,
      payment
    })
  }
)
```

**Benefits:**
- Automatic error handling
- Transaction-like behavior (rollback on failure)
- Easy to debug
- Parallel steps supported
- Long-running workflows supported

---

### 3. Enhanced Admin Dashboard

**What:** Better admin interface for marketplace with widgets

**Custom Widgets:**
```typescript
// src/admin/widgets/seller-stats.tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"

export const SellerStats = () => {
  return (
    <div className="p-4">
      <h2>Seller Statistics</h2>
      {/* Widget content */}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default SellerStats
```

---

### 4. Better Error Handling & Logging

**Instrumentation with Sentry:**
```typescript
// src/modules/seller/service.ts
import { Sentry } from "@medusajs/framework"

class SellerService {
  async approveSeller(sellerId: string) {
    try {
      const seller = await this.retrieveSeller(sellerId)
      seller.status = "approved"
      await this.sellerRepository_.save(seller)
    } catch (error) {
      Sentry.captureException(error)
      throw error
    }
  }
}
```

**Custom Logging:**
```typescript
class SellerService {
  constructor(container) {
    this.logger_ = container.logger
  }

  async register(data) {
    this.logger_.info("Seller registering", { email: data.email })
    // ...
  }
}
```

---

### 5. Feature Flags & A/B Testing

**Define Feature Flags:**
```typescript
// src/modules/seller/service.ts
const isSellerCommissionEnabled = process.env.FEATURE_SELLER_COMMISSION === "true"

class SellerService {
  async calculateCommission(orderId: string) {
    if (!isSellerCommissionEnabled) {
      return null // Feature disabled
    }
    // Calculate commission
  }
}
```

---

## Summary: v1 vs v2 Migration Path

| Feature | v1 (Old) | v2 (New) | Change |
|---------|----------|----------|--------|
| Entity Definitions | TypeORM `@Entity()` | DML `model.define()` | Simpler syntax |
| Service CRUD | Manual methods | Auto-generated `MedusaService` | 80% less code |
| Entity Relationships | Extend entities | Module Links | Loose coupling |
| Business Logic | Services + Events | Workflows | Better error handling |
| Event Handling | Constructor injection | Function export | Cleaner |
| Prices | Stored in cents | Stored in major units | Simpler calculations |
| Migrations | Manual SQL | Auto-generated | Less work |
| Auth | Manual checking | Middleware-based | Centralized |
| Admin UI | Basic widgets | Advanced components | Better UX |
| Modules | Flat structure | Organized by domain | Better organization |

---

### 1. Modules System

**What:** New architecture for organizing code

**Benefits:**
- Easy to understand
- Easy to customize
- Easy to test
- Easy to share

**Example:**
```typescript
// src/modules/seller/index.ts
import SellerService from "./services/seller"
import { defineModuleConfig } from "@medusajs/medusa/utils"

export const config = defineModuleConfig("seller", {
  services: [SellerService]
})
```

---

### 2. Workflows & Step Functions

**What:** Manage complex business processes

**Example: Seller Payout**
```typescript
// src/workflows/seller-payout.ts
import { createWorkflow, StepResponse } from "@medusajs/medusa/workflows-sdk"

const validatePayoutStep = async (input) => {
  const seller = await sellerService.retrieve(input.sellerId)
  if (seller.balance < input.amount) {
    throw new Error("Insufficient balance")
  }
  return new StepResponse({ seller })
}

export const sellerPayoutWorkflow = createWorkflow(
  "seller-payout",
  async (input) => {
    const { seller } = await validatePayoutStep(input)
    return seller
  }
)
```

**Benefits:**
- Automatic error handling
- Transaction-like behavior
- Easy to debug

---

### 3. Enhanced Admin Dashboard

**What:** Better admin interface for marketplace

**Custom Widgets:**
```typescript
// src/admin/routes/seller-stats.tsx
export const config = {
  type: "admin",
  route: "seller-stats"
}

export default function SellerStats() {
  return <div className="p-4"><h2>Seller Statistics</h2></div>
}
```

---

### 4. Scheduled Jobs (Cron Tasks)

**What:** Automate recurring tasks at scheduled intervals (runs during application runtime)

**Create Scheduled Job:**
```typescript
// src/jobs/sync-seller-earnings.ts
import { MedusaContainer } from "@medusajs/framework/types"

export default async function syncSellerEarningsJob(
  container: MedusaContainer
) {
  const logger = container.resolve("logger")
  const orderService = container.resolve("orderService")
  const sellerService = container.resolve("sellerService")
  
  logger.info("Starting daily seller earnings sync...")
  
  // Get all orders from past 24 hours
  const orders = await orderService.list({
    created_at: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  })
  
  // Calculate and update seller earnings
  for (const order of orders) {
    const seller = await sellerService.retrieve(order.seller_id)
    const commission = order.total * (seller.commission_rate || 0.1)
    
    await sellerService.update(seller.id, {
      total_earnings: (seller.total_earnings || 0) + order.total,
      total_commission: (seller.total_commission || 0) + commission
    })
  }
  
  logger.info(`Synced earnings for ${orders.length} orders`)
}

// Export cron configuration
export const config = {
  name: "sync-seller-earnings-job",
  schedule: "0 0 * * *" // Every day at midnight
}
```

**Scheduled Job Interval Options:**
- `"* * * * *"` - Every minute
- `"0 * * * *"` - Every hour
- `"0 0 * * *"` - Daily (midnight)
- `"0 0 * * 0"` - Weekly (Sunday)
- `"0 0 1 * *"` - Monthly (1st day)

**Important:** Scheduled jobs run ONLY during application runtime. For tasks that need to run when the app is stopped, use custom CLI scripts with OS cron jobs instead.

---

### 5. Custom CLI Scripts

**What:** One-off tasks executed via command line (separate from scheduled jobs)

**Seed Data Script:**
```typescript
// src/scripts/seed-demo-sellers.ts
import { ExecArgs } from "@medusajs/framework/types"
import { createSellerWorkflow } from "../workflows/create-seller"
import { faker } from "@faker-js/faker"

export default async function seedDemoSellers({
  container
}: ExecArgs) {
  const logger = container.resolve("logger")
  
  logger.info("Seeding 10 demo sellers...")
  
  for (let i = 0; i < 10; i++) {
    await createSellerWorkflow(container).run({
      input: {
        name: faker.company.name(),
        email: faker.internet.email(),
        description: faker.company.catchPhrase(),
        commission_rate: 0.1 + Math.random() * 0.1 // 10-20% commission
      }
    })
  }
  
  logger.info("✅ Demo sellers seeded successfully")
}
```

**Run Script:**
```bash
npx medusa exec src/scripts/seed-demo-sellers.ts
```

**Data Migration Script:**
```typescript
// src/scripts/migrate-v1-sellers.ts
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function migrateV1Sellers({
  container
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const sellerService = container.resolve("sellerService")
  
  logger.info("Migrating sellers from v1...")
  
  // Query v1 sellers from direct database access
  const oldSellers = await query.raw(`SELECT * FROM sellers_v1`)
  
  for (const oldSeller of oldSellers) {
    await sellerService.create({
      name: oldSeller.shop_name,
      email: oldSeller.email,
      commission_rate: 0.1,
      metadata: {
        v1_id: oldSeller.id,
        migrated_at: new Date().toISOString()
      }
    })
  }
  
  logger.info(`✅ Migrated ${oldSellers.length} sellers`)
}
```

---

### 6. Plugin Architecture

**What:** Reusable packages of Medusa customizations that can be shared across projects

**Create Plugin Project:**
```bash
npx create-medusa-app my-seller-plugin --plugin
```

**Plugin Directory Structure:**
```
my-seller-plugin/
├── src/
│   ├── modules/          # Custom modules
│   ├── workflows/        # Workflows exported to parent app
│   ├── api/             # API routes
│   ├── jobs/            # Scheduled jobs
│   ├── subscribers/      # Event subscribers
│   └── admin/           # Admin customizations
├── package.json         # Plugin metadata
└── medusa-config.ts     # Configuration
```

**Configure Plugin in package.json:**
```json
{
  "name": "@mymarketplace/seller-module-plugin",
  "version": "1.0.0",
  "keywords": [
    "medusa-plugin-integration",
    "medusa-v2"
  ],
  "exports": {
    "./package.json": "./package.json",
    "./workflows": "./.medusa/server/src/workflows/index.js",
    "./.medusa/server/src/modules/*": "./.medusa/server/src/modules/*/index.js",
    "./providers/*": "./.medusa/server/src/providers/*/index.js",
    "./admin": {
      "import": "./.medusa/server/src/admin/index.mjs",
      "require": "./.medusa/server/src/admin/index.js"
    }
  },
  "devDependencies": {
    "@medusajs/framework": "2.5.0",
    "@medusajs/cli": "2.5.0",
    "@medusajs/admin-sdk": "2.5.0"
  }
}
```

**Develop Plugin Locally:**
```bash
# 1. Publish plugin to local registry
npx medusa plugin:publish

# 2. In your main Medusa app, install plugin
npx medusa plugin:add @mymarketplace/seller-module-plugin

# 3. Register in medusa-config.ts
module.exports = defineConfig({
  plugins: [
    {
      resolve: "@mymarketplace/seller-module-plugin",
      options: {
        enableNotifications: true
      }
    }
  ]
})

# 4. Watch for changes (in plugin directory)
npx medusa plugin:develop

# 5. Start main app (in main app directory)
npm run dev
```

**Publish to NPM:**
```bash
# Build plugin
npx medusa plugin:build

# Publish to NPM
npm publish
```

---

### 7. Testing & Debugging

**Integration Tests - API Routes:**
```typescript
// src/__tests__/api/admin/sellers.test.ts
import { describe, it, expect, beforeAll } from "vitest"
import { TestContainer } from "@medusajs/test-utils"

describe("Admin Sellers API", () => {
  let testContainer: TestContainer
  
  beforeAll(async () => {
    testContainer = new TestContainer()
    await testContainer.setUpServer()
  })
  
  it("should list sellers", async () => {
    const response = await testContainer.request(
      "GET",
      `/admin/sellers`
    )
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("sellers")
  })
  
  it("should create seller", async () => {
    const response = await testContainer.request(
      "POST",
      `/admin/sellers`,
      {
        name: "Test Seller",
        email: "seller@test.com",
        commission_rate: 0.1
      }
    )
    
    expect(response.status).toBe(201)
    expect(response.body.seller.name).toBe("Test Seller")
  })
})
```

**Integration Tests - Workflows:**
```typescript
// src/__tests__/workflows/create-seller.test.ts
import { describe, it, expect } from "vitest"
import { createSellerWorkflow } from "../../workflows/create-seller"
import { TestContainer } from "@medusajs/test-utils"

describe("Create Seller Workflow", () => {
  it("should create seller with commission calculation", async () => {
    const container = new TestContainer()
    
    const { result } = await createSellerWorkflow(container).run({
      input: {
        name: "Test Seller",
        email: "seller@test.com",
        commission_rate: 0.1
      }
    })
    
    expect(result.seller).toBeDefined()
    expect(result.seller.commission_rate).toBe(0.1)
    expect(result.seller.status).toBe("pending_verification")
  })
  
  it("should handle validation errors", async () => {
    const container = new TestContainer()
    
    await expect(
      createSellerWorkflow(container).run({
        input: {
          name: "", // Invalid: empty name
          email: "invalid-email",
          commission_rate: 1.5 // Invalid: > 1.0
        }
      })
    ).rejects.toThrow()
  })
})
```

**Debug Workflows:**
```typescript
// Enable workflow debugging in medusa-config.ts
module.exports = defineConfig({
  debug: true, // Enables detailed logging
  loggerLevel: "debug"
})

// Or programmatically:
import { workflowDebugging } from "@medusajs/framework/workflows"

workflowDebugging.enabled = true
```

**Logging:**
```typescript
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function myWorkflow(
  input,
  { container }
) {
  const logger = container.resolve(
    ContainerRegistrationKeys.LOGGER
  )
  
  logger.info("Processing seller creation", {
    sellerId: input.seller_id,
    timestamp: new Date()
  })
  
  logger.warn("Commission rate unusually high", {
    rate: input.commission_rate
  })
  
  logger.error("Seller creation failed", {
    reason: error.message,
    stack: error.stack
  })
}
```

**Instrumentation with Sentry:**
```typescript
// src/modules/my-module/index.ts
import * as Sentry from "@sentry/node"

export default defineModule("myModule", {
  service: {
    createSeller: async (input) => {
      const transaction = Sentry.startTransaction({
        op: "seller.create",
        name: "Create Seller"
      })
      
      try {
        const span = transaction.startChild({
          op: "db.query",
          description: "Insert seller"
        })
        
        const seller = await container
          .resolve("db")
          .query.sellers.create(input)
        
        span.finish()
        transaction.finish()
        return seller
      } catch (error) {
        Sentry.captureException(error)
        transaction.finish()
        throw error
      }
    }
  }
})
```

---

### 8. Feature Flags & A/B Testing

**Create Feature Flag:**
```typescript
// src/__tests__/feature-flags.test.ts
import { createFeatureFlag } from "@medusajs/framework"

const flag = await createFeatureFlag(container, {
  name: "new_commission_system",
  description: "Test new seller commission calculation",
  enabled: false
})
```

**Use in Application:**
```typescript
export default async function calculateCommission(
  order,
  { container }
) {
  const featureFlags = container.resolve("featureFlags")
  
  // A/B Test: New commission system
  const useNewSystem = await featureFlags.isEnabled(
    "new_commission_system"
  )
  
  if (useNewSystem) {
    // Calculate using new tiered system
    return calculateTieredCommission(order)
  } else {
    // Calculate using old flat system
    return order.total * 0.1
  }
}
```

---

### 9. Environment Variables & Configurations (Updated for v2)

**Medusa v2 Config (Our Actual Implementation):**
```typescript
// backend/medusa-config.ts
import { loadEnv, defineConfig } from "@medusajs/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  modules: {
    eventBus: {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL
      }
    },
    cacheService: {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL
      }
    }
  },
})
```

**Key Points from Our Setup:**
- ✅ Uses `loadEnv` to automatically load `.env` files
- ✅ `defineConfig` from `@medusajs/utils` (not `@medusajs/framework`)
- ✅ Modules configured as object (not array) for Redis event bus and caching
- ✅ Environment variables loaded from `backend/.env`
- ✅ Database URL points to Docker PostgreSQL
- ✅ Redis URL points to Docker Redis instance

**Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medusa
POSTGRES_URL=postgresql://user:password@localhost:5432/medusa

# Redis (for events, jobs, cache)
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-key

# Application
NODE_ENV=development
PORT=9000

# Seller/Commission Config
DEFAULT_COMMISSION_RATE=0.10
SELLER_VERIFICATION_REQUIRED=true
MAX_COMMISSION_RATE=0.50

# Email (Notifications)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-key

# Logging & Monitoring
LOG_LEVEL=debug
SENTRY_DSN=https://your-sentry-dsn
```

---

### 10. Production Deployment

**Build for Production:**
```bash
npm run build
```

**Worker Mode (Separate Process):**
```bash
# API server
npm run start

# Background job worker (separate process)
npm run start -- --worker
```

This allows horizontal scaling - run multiple workers for processing jobs while main API handles requests.

**Docker Deployment:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 9000
CMD ["npm", "start"]
```

---

### 11. Marketplace Best Practices (Martnex-Specific)

**Commission & Payout Architecture:**
```typescript
// src/modules/seller/models.ts - Multi-vendor commission model
const SellerModel = model.define("Seller", {
  // ... other fields
  commission_rate: {
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: false,
    default: 10 // 10% default
  },
  total_earnings: {
    type: "bigint",
    nullable: false,
    default: 0
  },
  total_commission: {
    type: "bigint",
    nullable: false,
    default: 0
  },
  pending_payout: {
    type: "bigint",
    nullable: false,
    default: 0
  },
  verification_status: {
    type: "enum",
    enum: ["pending", "verified", "suspended"],
    default: "pending"
  }
})
```

**Seller Verification Workflow:**
```typescript
// src/workflows/verify-seller.ts
import { createWorkflow } from "@medusajs/framework"

const verifySeller = createWorkflow(
  "verify_seller",
  async (input) => {
    const { sellerId, documents } = input
    
    // Step 1: Validate seller documents
    const isValid = await validateSellerDocs(documents)
    
    // Step 2: Check seller history
    const history = await checkSellerHistory(sellerId)
    
    // Step 3: Update verification status
    const seller = await updateSellerStatus(
      sellerId,
      isValid && !history.hasIssues 
        ? "verified" 
        : "suspended"
    )
    
    // Step 4: Notify seller
    await notifySellerOfVerification(sellerId, seller.verification_status)
    
    return { seller }
  }
)
```

**Automated Payout Workflow (Daily):**
```typescript
// src/jobs/process-seller-payouts.ts
export default async function processPayoutsJob(container) {
  const logger = container.resolve("logger")
  const orderService = container.resolve("orderService")
  const sellerService = container.resolve("sellerService")
  
  logger.info("Processing seller payouts...")
  
  // Get verified sellers with pending payouts
  const sellers = await sellerService.list({
    verification_status: "verified",
    pending_payout: { $gt: 0 }
  })
  
  for (const seller of sellers) {
    try {
      // Process payout to seller's bank account
      const payout = await processPayoutWorkflow(container).run({
        input: {
          seller_id: seller.id,
          amount: seller.pending_payout
        }
      })
      
      logger.info(`Payout processed for seller ${seller.id}`, {
        amount: seller.pending_payout
      })
    } catch (error) {
      logger.error(`Payout failed for seller ${seller.id}`, {
        error: error.message
      })
      // Alert admin for manual review
    }
  }
}

export const config = {
  name: "process-seller-payouts",
  schedule: "0 2 * * *" // 2 AM daily
}
```

---

## Next Steps

1. Read [Next.js 16 Explained](NEXTJS16_EXPLAINED.md) to understand frontend
2. Read [Database Schema](../planning/DATABASE_SCHEMA.md) to see our tables
3. Read [Architecture](../planning/ARCHITECTURE.md) to see how it all connects

## Next Steps

1. Read [Next.js 16 Explained](NEXTJS16_EXPLAINED.md) to understand frontend
2. Read [Database Schema](../planning/DATABASE_SCHEMA.md) to see our tables
3. Read [Architecture](../planning/ARCHITECTURE.md) to see how it all connects

---

## Advanced Commerce Modules

### Inventory Module

Multi-warehouse management with reservations:

```typescript
const inventoryService = req.scope.resolve("inventoryService")

// Get inventory levels
const inventory = await inventoryService.retrieveInventoryItem("item_123")

// Check availability at location
const available = inventory.locations.find(
  l => l.location_id === "warehouse_1"
)?.stocked_quantity

// Reserve stock
await inventoryService.reserve({
  inventory_item_id: "item_123",
  location_id: "warehouse_1",
  quantity: 5
})
```

---

### Pricing Module

Advanced pricing engine with rules and tiers:

```typescript
const pricingService = req.scope.resolve("pricingService")

// Create wholesale pricing
await pricingService.createPriceList({
  title: "Wholesale Pricing",
  type: "override",
  prices: [
    {
      currency_code: "usd",
      variant_id: "variant_123",
      amount: 1500 // $15 wholesale price
    }
  ]
})

// Add tiered pricing
await pricingService.createPriceRule({
  price_list_id: "list_123",
  price_rules: [
    {
      variant_id: "variant_456",
      min_quantity: 100,
      amount: 1000 // Bulk discount
    }
  ]
})
```

---

### Tax Module

Per-region tax management:

```typescript
const taxService = req.scope.resolve("taxService")

// Configure region tax
await taxService.createTaxRate({
  region_id: "region_us",
  code: "SALES_TAX",
  name: "Sales Tax (California)",
  rate: 8.5
})

// Automatic tax calculation
const tax = await taxService.calculateTax({
  variant_id: "var_123",
  region_id: "region_us",
  amount: 10000
})
```

---

### Fulfillment Module

Order fulfillment with shipping integration:

```typescript
const fulfillmentService = req.scope.resolve("fulfillmentService")

// Create fulfillment
const fulfillment = await fulfillmentService.createFulfillment({
  order_id: "order_123",
  provider_id: "fedex",
  items: [{ item_id: "item_1", quantity: 2 }],
  shipping_data: {
    tracking_number: "794644383649",
    carrier: "fedex"
  }
})

// Get shipping rates
const rates = await fulfillmentService.fetchShippingRates({
  address: { country_code: "US", province_code: "CA" },
  items: [{ variant_id: "var_123", quantity: 1 }]
})
```

---

### Sales Channel Module (Omnichannel)

Support multiple sales channels:

```typescript
const channelService = req.scope.resolve("salesChannelService")

// Create channel
const webChannel = await channelService.create({
  name: "Web Store",
  description: "Our main website",
  is_disabled: false
})

const mobileChannel = await channelService.create({
  name: "Mobile App",
  description: "Native mobile application",
  is_disabled: false
})

const marketplaceChannel = await channelService.create({
  name: "Etsy",
  description: "Etsy marketplace listings",
  is_disabled: false
})

// Get orders per channel
const webOrders = await orderService.list({
  sales_channel_id: webChannel.id
})
```

---

### Order Module (Omnichannel)

Unified order management across channels:

```typescript
const orderService = req.scope.resolve("orderService")

// Get all orders
const allOrders = await orderService.list()

// Filter by channel
const etsy = await orderService.list({
  sales_channel_id: "etsy_channel"
})

// Get order details
const order = await orderService.retrieve("order_123", {
  relations: ["items", "fulfillments", "payments"]
})

// Update order status
await orderService.update("order_123", {
  status: "completed"
})
```

---

### Payment Module

Multiple payment provider support:

```typescript
const paymentService = req.scope.resolve("paymentService")

// Authorize payment (Stripe)
const payment = await paymentService.authorizePayment({
  provider_id: "stripe",
  amount: 5000,
  currency_code: "usd",
  data: {
    token: "tok_visa"
  }
})

// Capture payment
await paymentService.capturePayment({
  payment_session_id: "session_123",
  amount: 5000
})

// Process refund
await paymentService.refundPayment({
  payment_id: "pay_123",
  amount: 2500
})
```

---

### Customer Module

Customer and group management:

```typescript\nconst customerService = req.scope.resolve("customerService")

// Create customer
const customer = await customerService.create({
  email: "buyer@example.com",
  first_name: "John",
  last_name: "Doe",
  phone: "+1234567890"
})

// Create customer group (VIP tier)
const vipGroup = await customerService.createCustomerGroup({
  name: "VIP Customers",
  metadata: {
    discount_percentage: 15,
    priority: "high"
  }
})

// Add customer to group
await customerService.addToGroup(customer.id, vipGroup.id)
```

---

## Medusa Cloud

Managed hosting with:
- PostgreSQL database
- Redis cache  
- File storage
- Auto-scaling
- SSL certificates
- Backups
- Global CDN

---

## Real-Time Features

Event-driven architecture for live updates:

```typescript
const eventBus = req.scope.resolve("eventBus")

// Listen for order events
eventBus.subscribe("order.placed", async (event) => {
  console.log("Order placed:", event.order_id)
  // Send confirmation email
  // Update inventory
  // Notify seller
})

// Listen for payment events
eventBus.subscribe("payment.captured", async (event) => {
  console.log("Payment received:", event.amount)
  // Update seller earnings
  // Calculate commission
  // Trigger fulfillment
})

// Emit custom event
eventBus.emit("seller.earnings.updated", {
  seller_id: "seller_123",
  amount: 5000,
  timestamp: new Date()
})
```

---

## Publishing Workflows

Draft/published state management:

```typescript
const productService = req.scope.resolve("productService")

// Create as draft
const draft = await productService.create({
  title: "Limited Edition Item",
  description: "Coming soon",
  status: "draft"
})

```

---

## Our Medusa v2 Setup Experience (Latest Findings)

### Configuration File Migration (v1 → v2)

**Problem:** We had both `medusa-config.js` (v1) and `medusa-config.ts` (v2) files.

**Solution:** 
- Medusa v2 prioritizes `medusa-config.js` if it exists
- We renamed `medusa-config.js` to `medusa-config.old.js` 
- Now uses `medusa-config.ts` with proper v2 syntax

**Key Changes Made:**
```typescript
// OLD (v1 - medusa-config.js)
module.exports = {
  projectConfig: {
    database_url: DATABASE_URL,  // snake_case
    redis_url: REDIS_URL,        // snake_case
    store_cors: STORE_CORS,
    // ...
  },
  modules: {
    eventBus: { /* Redis config */ },
    cacheService: { /* Redis config */ }
  }
}

// NEW (v2 - medusa-config.ts)
import { loadEnv, defineConfig } from "@medusajs/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,  // camelCase
    http: { /* CORS and auth config */ }
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL
  },
  modules: {
    eventBus: {
      resolve: "@medusajs/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL }
    },
    cacheService: {
      resolve: "@medusajs/cache-redis", 
      options: { redisUrl: process.env.REDIS_URL }
    }
  }
})
```

### Redis Configuration in v2

**Finding:** Redis is configured via modules, not `projectConfig.redisUrl`

**Our Setup:**
- Docker Redis container on `localhost:6379`
- Event bus uses `@medusajs/event-bus-redis`
- Cache service uses `@medusajs/cache-redis`
- Both modules share the same Redis instance

**Connection Output:**
```
info: Connection to Redis in module 'event-bus-redis' established
info: Connection to Redis in module 'cache-redis' established
```

### PostgreSQL Configuration in v2

**Finding:** Database URL uses `databaseUrl` (camelCase) in `projectConfig`

**Our Setup:**
- Docker PostgreSQL container on `localhost:5432`
- Database: `martnex`, User: `martnex`
- Connection: `postgres://martnex:martnex_dev_password@localhost:5432/martnex`

**Migration Process:**
```bash
# 1. Update package.json script
"db:migrate": "medusa db:migrate"

# 2. Run migrations
pnpm run db:migrate

# Output: Successfully created all tables for modules
# - product, pricing, customer, cart, order, etc.
```

### Environment Variables Loading

**Finding:** `loadEnv` loads `.env` files automatically

**Debug Experience:**
```typescript
// Added to medusa-config.ts for debugging
console.error("cwd:", process.cwd())
console.error("REDIS_URL:", process.env.REDIS_URL)
console.error("DATABASE_URL:", process.env.DATABASE_URL)
```

**Output:**
```
cwd: /Users/macair/Documents/Project/martnex/backend
REDIS_URL: redis://localhost:6379
DATABASE_URL: postgres://martnex:martnex_dev_password@localhost:5432/martnex
```

### Docker Hybrid Setup

**Architecture:**
- PostgreSQL in Docker (`localhost:5432`)
- Redis in Docker (`localhost:6379`) 
- Backend runs locally (Node.js)

**Benefits:**
- ✅ Fast development (no container rebuilds)
- ✅ Direct debugging of backend code
- ✅ Database persistence across restarts
- ✅ Easy to switch between local/Docker DB

### Migration Script Updates

**Finding:** Migration scripts run automatically after table creation

**Our Experience:**
- `medusa db:migrate` creates tables AND runs migration scripts
- Scripts include: product-shipping-profile, tax-region-provider
- All completed successfully

### Current Status

**✅ Working:**
- Backend starts successfully
- Database tables created
- Redis connections established
- Environment variables loaded
- Admin dashboard accessible

**🔄 Next Steps:**
- Add custom seller module
- Implement commission calculations
- Create seller dashboard API
- Add payout workflows

**📝 Key Lessons:**
1. Remove old `medusa-config.js` to use v2 config
2. Use `defineConfig` from `@medusajs/utils`
3. Configure Redis via modules, not `projectConfig.redisUrl`
4. Use `loadEnv` for automatic `.env` loading
5. Run `medusa db:migrate` (not `medusa migrations run`)
6. Hybrid Docker setup works well for development

// Schedule publish
await productService.update(draft.id, {
  status: "published",
  published_at: new Date("2025-12-25")
})
```

---

**Questions?** Check [Medusa Documentation](https://docs.medusajs.com) or ask!
