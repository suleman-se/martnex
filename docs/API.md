# Martnex API Documentation

This document provides an overview of the Martnex API endpoints. As the project develops, this will be expanded with detailed endpoint documentation.

## Base URLs

- **Production:** `https://api.martnex.io`
- **Development:** `http://localhost:9001`

## Authentication

Martnex uses **Medusa v2's native Auth Module** (`/auth/customer/emailpass`) for storefront authentication and custom routes for registration/reset flows.

All authenticated requests require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Store requests additionally require the publishable API key header:

```
x-publishable-api-key: <publishable-key>
```

> **Publishable key is safe to expose in frontend.** It is a scope-limited public identifier, not a secret.
> The frontend resolves it automatically from `GET /auth/publishable-key` at runtime.

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

### Login (Medusa Native)

**Login with email and password using Medusa's built-in auth provider:**
```http
POST /auth/customer/emailpass
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Store the returned `token` as the bearer token for all subsequent store requests.

### Fetch Authenticated Customer Profile

```http
GET /store/customers/me
Authorization: Bearer <token>
x-publishable-api-key: <publishable-key>
```

### Using the Token

Include the access token in all authenticated requests:

```http
GET /store/sellers/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-publishable-api-key: <publishable-key>
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

**Note:** Passwords are hashed using `scrypt` by Medusa's native Auth Module. The custom `/auth/token` route has been removed in favour of the native provider.

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

### Seller Endpoints (Customer Auth + Seller Role)

#### Seller Registration & Profile
- `POST /store/sellers` — Register as a seller (requires `Authorization` bearer token)
- `GET /store/sellers/me` — Get authenticated seller's own profile

#### Seller Commissions
- `GET /store/commissions` — Get seller's commission records
- `GET /store/commissions/:id` — Get specific commission

#### Seller Payout Requests
- `POST /store/payouts` — Create a payout request
- `GET /store/payouts` — Get seller's payout history

### Admin Endpoints (Admin/User Auth Required)

#### User Management
- `GET /admin/customers` — List all users
- `GET /admin/customers/:id` — Get user details
- `PUT /admin/customers/:id` — Update user
- `DELETE /admin/customers/:id` — Delete user

#### Seller Management
- `GET /admin/sellers` — List all sellers
- `POST /admin/sellers` — Update seller details
- `POST /admin/sellers/:id/verify` — Verify seller
- `POST /admin/sellers/:id/reject` — Reject seller
- `POST /admin/sellers/:id/suspend` — Suspend seller

#### Commission Management
- `GET /admin/commissions` — List all commissions
- `POST /admin/commissions` — Update commission status

#### Payout Management
- `GET /admin/payouts` — List payouts
- `POST /admin/payouts/:id/approve` — Approve payout
- `POST /admin/payouts/:id/cancel` — Cancel payout

#### Store Authentication / Key
- `GET /auth/publishable-key` — Returns the active publishable key for storefront requests (used by frontend to auto-resolve key at runtime)

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
