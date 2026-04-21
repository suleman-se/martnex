import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260416115437 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "payout" ("id" text not null, "seller_id" text not null, "amount" numeric not null, "currency_code" text not null default 'usd', "commission_ids" jsonb not null, "status" text check ("status" in ('requested', 'pending_review', 'approved', 'processing', 'completed', 'failed', 'cancelled')) not null default 'requested', "payment_method" text check ("payment_method" in ('bank_transfer', 'paypal', 'stripe')) null, "payment_reference" text null, "payment_metadata" jsonb null, "requested_at" timestamptz null, "reviewed_at" timestamptz null, "approved_at" timestamptz null, "processing_at" timestamptz null, "completed_at" timestamptz null, "failed_at" timestamptz null, "cancelled_at" timestamptz null, "reviewed_by" text null, "admin_notes" text null, "failure_reason" text null, "retry_count" integer not null default 0, "metadata" jsonb null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payout_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_deleted_at" ON "payout" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "payout" cascade;`);
  }

}
