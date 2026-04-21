import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260416115133 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "seller" ("id" text not null, "customer_id" text not null, "business_name" text not null, "business_email" text not null, "business_phone" text null, "business_address" jsonb null, "tax_id" text null, "verification_status" text check ("verification_status" in ('pending', 'verified', 'rejected', 'suspended')) not null default 'pending', "verified_at" timestamptz null, "verification_notes" text null, "payout_method" text check ("payout_method" in ('bank_transfer', 'paypal', 'stripe')) null, "bank_details" jsonb null, "paypal_email" text null, "stripe_account_id" text null, "commission_rate" numeric null, "is_active" boolean not null default true, "total_sales" numeric not null default 0, "total_commission" numeric not null default 0, "pending_payout" numeric not null default 0, "metadata" jsonb null, "raw_commission_rate" jsonb null, "raw_total_sales" jsonb not null default '{"value":"0","precision":20}', "raw_total_commission" jsonb not null default '{"value":"0","precision":20}', "raw_pending_payout" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seller_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seller_deleted_at" ON "seller" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "seller" cascade;`);
  }

}
