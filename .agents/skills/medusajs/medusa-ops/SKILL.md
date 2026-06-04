---
name: medusa-ops
description: Operational tasks for Medusa like migrating databases, generating migrations, and creating admin users.
---

# Medusa Operational Tasks

Use this skill for common backend operations in the Medusa environment.

## 1. Database Migrations

### Generate Migrations
Use this when you've changed a data model and need to create a migration file.
**Command:** `npx medusa db:generate <module-name>`
**Example:** `npx medusa db:generate brand`

### Apply Migrations
Use this to apply pending migrations to the database.
**Command:** `npx medusa db:migrate`

## 2. User Management

### Create Admin User
Use this to create a new admin account.
**Command:** `npx medusa user -e <email> -p <password>`
**Example:** `npx medusa user -e admin@example.com -p secret123`

## Validation
Always confirm with the user after running these commands and report any errors from the stdout/stderr.
