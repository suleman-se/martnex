import { model } from "@medusajs/utils";

/**
 * Password Reset Model
 *
 * Stores password reset tokens for users/customers.
 * Tokens expire after 15 minutes for security.
 */
export const PasswordReset = model.define("password_reset", {
  id: model.id().primaryKey(),

  /**
   * User/Customer ID - stores the entity_id from auth_identity or direct user/customer id
   */
  user_id: model.text().searchable(),

  /**
   * Email address requesting password reset
   */
  email: model.text().searchable(),

  /**
   * Reset token (should be hashed in production)
   */
  token: model.text().searchable(),

  /**
   * Token expiration timestamp (15 minutes from creation)
   */
  expires_at: model.dateTime(),

  /**
   * Timestamp when token was used (null if not used yet)
   */
  used_at: model.dateTime().nullable(),

  // Timestamps (created_at, updated_at, deleted_at) are auto-added by Medusa v2.12+
})
  .indexes([
    {
      name: "IDX_password_reset_user_id",
      on: ["user_id"],
    },
    {
      name: "IDX_password_reset_token",
      on: ["token"],
    },
    {
      name: "IDX_password_reset_email",
      on: ["email"],
    },
  ]);
