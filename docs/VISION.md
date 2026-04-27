# Martnex Vision & User Roles

## 🎯 Project Objective
Martnex is a next-generation multi-vendor marketplace platform built to be scalable, secure, and developer-friendly. It leverages **Medusa.js (v2)** as its foundation to provide a modular, high-performance e-commerce engine that can switch between a simple single-store and a complex multi-vendor ecosystem with ease.

## 👥 User Roles

### 1. Buyer
The primary customer of the platform.
- **Browse & Search**: Find products across multiple vendors.
- **Shopping Cart**: Persistent cart with seamless checkout.
- **Order Tracking**: Real-time updates on purchase status.
- **Reviews**: Leave feedback for products and sellers.
- **Secure Payments**: Multiple payment options (Stripe, PayPal, etc.).

### 2. Seller (Vendor)
Entrepreneurs or businesses selling on the platform.
- **Onboarding**: Multi-step verification process to join the marketplace.
- **Product Management**: Full CRUD capabilities for their own inventory.
- **Dashboard**: Track sales, commissions, and performance metrics.
- **Payouts**: Request earnings withdrawal through a managed workflow.
- **Order Management**: Handle fulfillment for their specific portion of an order.

### 3. Admin
The platform operator.
- **User Oversight**: Manage all buyers and sellers.
- **Seller Approval**: Verify and onboard new vendors.
- **Platform Rules**: Configure global commission rates and business policies.
- **Dispute Resolution**: Mediate between buyers and sellers.
- **System Health**: Monitor platform-wide analytics and logs.

## 🏗️ Architecture Philosophy
- **Modular First**: Use Medusa v2 modules (Seller, Commission, Payout) for clean separation of concerns.
- **Feature-Sliced Frontend**: A Next.js 15+ frontend organized by domain (auth, seller, admin) rather than technology type.
- **Developer Autonomy**: MIT Licensed code that you own completely.
- **Simplicity over Over-engineering**: Prioritize readable, standard patterns (Tailwind v4, Shadcn/UI, React Query).

## 🚀 Success Metrics
- **Performance**: < 3s page loads, < 500ms API responses.
- **Reliability**: 100% test coverage for core authentication and financial logic.
- **Scale**: Support thousands of concurrent users and hundreds of vendors.
- **Experience**: A "wow" factor in UI design and a "premium" feel for all user roles.
