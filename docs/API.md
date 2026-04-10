# Martnex API Documentation

This document provides an overview of the Martnex API endpoints. As the project develops, this will be expanded with detailed endpoint documentation.

## Base URLs

- **Production:** `https://api.martnex.io`
- **Development:** `http://localhost:9001`

## Authentication

Martnex uses **Medusa v2's built-in Auth Module** with JWT tokens for authentication.

All authenticated requests require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Registration

**Register a new account:**
```http
POST /auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "buyer"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user_id": "cus_01ABC123XYZ",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "buyer",
    "email_verified": false
  }
}
```

### Login

**Login with email and password:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "cus_01ABC123XYZ",
      "email": "user@example.com",
      "role": "buyer"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using the Token

Include the access token in all authenticated requests:

```http
GET /api/seller/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Password Reset

**Request password reset:**
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Reset password with token:**
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

**Note:** Passwords are automatically hashed using `scrypt-kdf` by Medusa's Auth Module.

## API Endpoints

### Public Endpoints (No Auth Required)

#### Products
- `GET /store/products` - List all products
- `GET /store/products/:id` - Get product details
- `GET /store/products/search` - Search products

#### Categories
- `GET /store/collections` - List all categories
- `GET /store/collections/:id` - Get category details

### Buyer Endpoints (Customer Auth Required)

#### Cart
- `POST /store/carts` - Create a cart
- `GET /store/carts/:id` - Get cart details
- `POST /store/carts/:id/line-items` - Add item to cart
- `POST /store/carts/:id/complete` - Complete cart (place order)

#### Orders
- `GET /store/customers/me/orders` - Get my orders
- `GET /store/orders/:id` - Get order details

#### Reviews
- `POST /api/review` - Create a review
- `GET /api/review/product/:id` - Get product reviews
- `PUT /api/review/:id` - Update my review
- `DELETE /api/review/:id` - Delete my review

### Seller Endpoints (Seller Auth Required)

#### Seller Registration
- `POST /api/seller/register` - Register as seller
- `GET /api/seller/me` - Get my seller profile
- `PUT /api/seller/me` - Update seller profile

#### Seller Products
- `GET /api/seller/products` - Get my products
- `POST /api/seller/products` - Create product
- `PUT /api/seller/products/:id` - Update product
- `DELETE /api/seller/products/:id` - Delete product

#### Seller Orders
- `GET /api/seller/orders` - Get my orders
- `PUT /api/seller/orders/:id/status` - Update order status

#### Seller Earnings
- `GET /api/seller/earnings` - Get earnings summary
- `GET /api/seller/commissions` - Get commission details
- `POST /api/seller/payout/request` - Request payout
- `GET /api/seller/payouts` - Get payout history

### Admin Endpoints (Admin Auth Required)

#### User Management
- `GET /admin/customers` - List all users
- `GET /admin/customers/:id` - Get user details
- `PUT /admin/customers/:id` - Update user
- `DELETE /admin/customers/:id` - Delete user

#### Seller Management
- `GET /api/admin/sellers` - List all sellers
- `PUT /api/admin/sellers/:id/verify` - Verify seller
- `PUT /api/admin/sellers/:id/reject` - Reject seller

#### Product Moderation
- `GET /api/admin/products/pending` - Get pending products
- `PUT /api/admin/products/:id/approve` - Approve product
- `PUT /api/admin/products/:id/reject` - Reject product

#### Commission Management
- `GET /api/admin/commissions` - List all commissions
- `PUT /api/admin/commission/config` - Update commission rates

#### Payout Management
- `GET /api/admin/payouts/pending` - Get pending payouts
- `PUT /api/admin/payouts/:id/approve` - Approve payout
- `PUT /api/admin/payouts/:id/reject` - Reject payout

#### Disputes
- `GET /api/admin/disputes` - List all disputes
- `GET /api/admin/disputes/:id` - Get dispute details
- `POST /api/admin/disputes/:id/message` - Add message to dispute
- `PUT /api/admin/disputes/:id/resolve` - Resolve dispute

#### Reports
- `GET /api/admin/reports/sales` - Sales reports
- `GET /api/admin/reports/revenue` - Revenue analytics
- `GET /api/admin/reports/users` - User activity reports

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

API requests are rate-limited per IP address:
- **Anonymous:** 60 requests per 15 minutes
- **Authenticated:** 100 requests per 15 minutes
- **Admin:** 200 requests per 15 minutes

Rate limit headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit` - Number of items per page (default: 20, max: 100)
- `offset` - Number of items to skip

**Example:**
```http
GET /store/products?limit=20&offset=40
```

**Response:**
```json
{
  "products": [...],
  "count": 150,
  "offset": 40,
  "limit": 20
}
```

## Filtering & Sorting

**Filter by field:**
```http
GET /store/products?category_id=cat_123&price_gte=10&price_lte=100
```

**Sort results:**
```http
GET /store/products?order=created_at&sort=DESC
```

## Webhooks

Martnex supports webhooks for important events:

### Available Events
- `order.placed` - New order created
- `order.updated` - Order status changed
- `payment.succeeded` - Payment completed
- `payment.failed` - Payment failed
- `payout.requested` - Seller requested payout
- `payout.completed` - Payout processed

### Webhook Payload
```json
{
  "event": "order.placed",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    // Event-specific data
  }
}
```

## SDK & Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- PHP SDK

## Postman Collection

A Postman collection with all endpoints will be provided once the API is implemented.

## Need Help?

- **Documentation:** https://docs.martnex.io (coming soon)
- **GitHub Issues:** https://github.com/suleman-se/martnex/issues
- **Discord:** Join our community server

---

**Note:** This API documentation is a work in progress and will be updated as endpoints are implemented.
