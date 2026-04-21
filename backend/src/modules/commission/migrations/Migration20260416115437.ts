import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260416115437 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "commission" ("id" text not null, "order_id" text not null, "line_item_id" text not null, "seller_id" text not null, "product_id" text null, "product_title" text null, "variant_id" text null, "line_item_total" numeric not null, "quantity" integer not null, "commission_rate" numeric not null, "commission_amount" numeric not null, "seller_payout" numeric not null, "currency_code" text not null default 'usd', "status" text check ("status" in ('pending', 'approved', 'paid', 'disputed', 'cancelled')) not null default 'pending', "approved_at" timestamptz null, "paid_at" timestamptz null, "disputed_at" timestamptz null, "cancelled_at" timestamptz null, "notes" text null, "metadata" jsonb null, "raw_line_item_total" jsonb not null, "raw_commission_rate" jsonb not null, "raw_commission_amount" jsonb not null, "raw_seller_payout" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "commission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_deleted_at" ON "commission" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "commission" cascade;`);
  }

}
