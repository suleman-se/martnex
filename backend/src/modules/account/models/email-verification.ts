import { model } from "@medusajs/utils";

/**
 * Email Verification Model
 *
 * Stores email verification tokens for users/customers.
 * Tokens expire after 24 hours.
 */
export const EmailVerification = model.define("email_verification", {
  id: model.id().primaryKey(),

  /**
   * User/Customer ID - stores the entity_id from auth_identity or direct user/customer id
   */
  user_id: model.text().searchable(),

  /**
   * Email address being verified
   */
  email: model.text().searchable(),

  /**
   * Verification token (should be hashed in production)
   */
  token: model.text().searchable(),

  /**
   * Token expiration timestamp (24 hours from creation)
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
      name: "IDX_email_verification_user_id",
      on: ["user_id"],
    },
    {
      name: "IDX_email_verification_token",
      on: ["token"],
    },
    {
      name: "IDX_email_verification_email",
      on: ["email"],
    },
  ]);
