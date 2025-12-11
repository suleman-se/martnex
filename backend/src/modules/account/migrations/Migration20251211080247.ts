import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251211080247 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "email_verification" ("id" text not null, "user_id" text not null, "email" text not null, "token" text not null, "expires_at" timestamptz not null, "used_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "email_verification_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_email_verification_deleted_at" ON "email_verification" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_email_verification_user_id" ON "email_verification" ("user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_email_verification_token" ON "email_verification" ("token") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_email_verification_email" ON "email_verification" ("email") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "password_reset" ("id" text not null, "user_id" text not null, "email" text not null, "token" text not null, "expires_at" timestamptz not null, "used_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "password_reset_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_password_reset_deleted_at" ON "password_reset" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_password_reset_user_id" ON "password_reset" ("user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_password_reset_token" ON "password_reset" ("token") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_password_reset_email" ON "password_reset" ("email") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "email_verification" cascade;`);

    this.addSql(`drop table if exists "password_reset" cascade;`);
  }

}
