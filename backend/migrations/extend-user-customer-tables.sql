-- Migration: Extend User and Customer Tables with Custom Authentication Fields
-- Date: 2024-12-10
-- Description: Adds custom columns to Medusa's user and customer tables for marketplace authentication

-- ========================================
-- EXTEND USER TABLE
-- ========================================

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "failed_login_attempts" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "locked_until" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "last_login_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "seller_id" text;

-- Create indexes on user table
CREATE INDEX IF NOT EXISTS "IDX_user_role" ON "user" ("role");
CREATE INDEX IF NOT EXISTS "IDX_user_locked_until" ON "user" ("locked_until") WHERE locked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_user_seller_id" ON "user" ("seller_id") WHERE seller_id IS NOT NULL;

-- ========================================
-- EXTEND CUSTOMER TABLE
-- ========================================

ALTER TABLE "customer"
ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "failed_login_attempts" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "locked_until" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "last_login_at" timestamp with time zone;

-- Create index on customer table
CREATE INDEX IF NOT EXISTS "IDX_customer_locked_until" ON "customer" ("locked_until") WHERE locked_until IS NOT NULL;
