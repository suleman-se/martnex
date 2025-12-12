/**
 * Account Service (Medusa v2)
 *
 * This service extends MedusaService which auto-generates CRUD methods.
 * Manages email verification and password reset tokens.
 *
 * Auto-generated methods (free!):
 * - createEmailVerifications(data)
 * - retrieveEmailVerification(id, config?)
 * - updateEmailVerifications(id, data, config?)
 * - deleteEmailVerifications(id)
 * - listEmailVerifications(filters?, config?)
 * - listAndCountEmailVerifications(filters?, config?)
 *
 * - createPasswordResets(data)
 * - retrievePasswordReset(id, config?)
 * - updatePasswordResets(id, data, config?)
 * - deletePasswordResets(id)
 * - listPasswordResets(filters?, config?)
 * - listAndCountPasswordResets(filters?, config?)
 */

import { MedusaService } from "@medusajs/utils";
import { EmailVerification } from "./models/email-verification";
import { PasswordReset } from "./models/password-reset";
import crypto from "crypto";

/**
 * AccountModuleService
 *
 * Handles email verification and password reset token management.
 * Extends MedusaService to get free CRUD methods for both models.
 */
class AccountModuleService extends MedusaService({
  EmailVerification,
  PasswordReset,
}) {
  // ===================================
  // Email Verification Methods
  // ===================================

  /**
   * Create email verification token for a user
   *
   * @param userId - User/Customer ID
   * @param email - Email address to verify
   * @returns EmailVerification record with token
   *
   * @example
   * const verification = await accountService.createEmailVerificationToken(
   *   'user_123',
   *   'user@example.com'
   * )
   * // Send email with: verification.token
   */
  async createEmailVerificationToken(userId: string, email: string) {
    // Invalidate any existing verification tokens for this user
    await this.invalidateEmailVerificationTokens(userId);

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return await this.createEmailVerifications({
      user_id: userId,
      email,
      token,
      expires_at: expiresAt,
    });
  }

  /**
   * Verify email using token
   *
   * @param token - Verification token from email
   * @returns EmailVerification record if valid, null if invalid/expired
   *
   * @example
   * const verification = await accountService.verifyEmailToken('abc123...')
   * if (verification) {
   *   // Token is valid, mark user as verified
   *   await userService.markEmailVerified(verification.user_id)
   * }
   */
  async verifyEmailToken(token: string) {
    const verifications = await this.listEmailVerifications({
      filters: { token },
    });

    const verification = verifications[0];

    if (!verification) {
      return null; // Token not found
    }

    // Check if already used
    if (verification.used_at) {
      return null; // Token already used
    }

    // Check if expired
    if (new Date() > new Date(verification.expires_at)) {
      return null; // Token expired
    }

    // Mark token as used
    await this.updateEmailVerifications({
      id: verification.id,
      used_at: new Date(),
    });

    return verification;
  }

  /**
   * Invalidate all email verification tokens for a user
   *
   * Called when creating new token or when user verifies email.
   */
  async invalidateEmailVerificationTokens(userId: string) {
    const verifications = await this.listEmailVerifications({
      filters: { user_id: userId, used_at: null },
    });

    for (const verification of verifications) {
      await this.updateEmailVerifications({
        id: verification.id,
        used_at: new Date(), // Mark as used to invalidate
      });
    }
  }

  /**
   * Get pending verification for user
   *
   * Returns the latest unused, non-expired verification token.
   */
  async getPendingVerification(userId: string) {
    const verifications = await this.listEmailVerifications({
      filters: { user_id: userId, used_at: null },
    });

    // Find the first non-expired token
    const now = new Date();
    return (
      verifications.find((v) => new Date(v.expires_at) > now) || null
    );
  }

  // ===================================
  // Password Reset Methods
  // ===================================

  /**
   * Create password reset token for a user
   *
   * @param userId - User/Customer ID
   * @param email - Email address
   * @returns PasswordReset record with token
   *
   * @example
   * const reset = await accountService.createPasswordResetToken(
   *   'user_123',
   *   'user@example.com'
   * )
   * // Send email with: reset.token
   */
  async createPasswordResetToken(userId: string, email: string) {
    // Invalidate any existing reset tokens for this user
    await this.invalidatePasswordResetTokens(userId);

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires in 15 minutes (security best practice)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return await this.createPasswordResets({
      user_id: userId,
      email,
      token,
      expires_at: expiresAt,
    });
  }

  /**
   * Verify password reset token
   *
   * @param token - Reset token from email
   * @returns PasswordReset record if valid, null if invalid/expired
   *
   * @example
   * const reset = await accountService.verifyPasswordResetToken('abc123...')
   * if (reset) {
   *   // Token is valid, allow password change
   *   await authService.updatePassword(reset.user_id, newPassword)
   *   await accountService.markPasswordResetUsed(reset.id)
   * }
   */
  async verifyPasswordResetToken(token: string) {
    const resets = await this.listPasswordResets({
      filters: { token },
    });

    const reset = resets[0];

    if (!reset) {
      return null; // Token not found
    }

    // Check if already used
    if (reset.used_at) {
      return null; // Token already used
    }

    // Check if expired
    if (new Date() > new Date(reset.expires_at)) {
      return null; // Token expired
    }

    return reset;
  }

  /**
   * Mark password reset token as used
   *
   * Call this after successfully resetting password.
   */
  async markPasswordResetUsed(resetId: string) {
    return await this.updatePasswordResets({
      id: resetId,
      used_at: new Date(),
    });
  }

  /**
   * Invalidate all password reset tokens for a user
   *
   * Called when creating new token or when password is changed.
   */
  async invalidatePasswordResetTokens(userId: string) {
    const resets = await this.listPasswordResets({
      filters: { user_id: userId, used_at: null },
    });

    for (const reset of resets) {
      await this.updatePasswordResets({
        id: reset.id,
        used_at: new Date(), // Mark as used to invalidate
      });
    }
  }

  // ===================================
  // Cleanup Methods
  // ===================================

  /**
   * Delete expired tokens
   *
   * Should be run as a scheduled job (e.g., daily via cron).
   * Removes tokens older than their expiration time.
   */
  async cleanupExpiredTokens() {
    const now = new Date();

    // Get expired email verifications
    const expiredVerifications = await this.listEmailVerifications({});
    for (const verification of expiredVerifications) {
      if (new Date(verification.expires_at) < now) {
        await this.deleteEmailVerifications(verification.id);
      }
    }

    // Get expired password resets
    const expiredResets = await this.listPasswordResets({});
    for (const reset of expiredResets) {
      if (new Date(reset.expires_at) < now) {
        await this.deletePasswordResets(reset.id);
      }
    }
  }
}

export default AccountModuleService;

/**
 * EXPLANATION:
 *
 * MedusaService Auto-Generates:
 * =============================
 * For EmailVerification model:
 * - createEmailVerifications(data) → Create verification token
 * - retrieveEmailVerification(id) → Get by ID
 * - updateEmailVerifications(id, data) → Update token
 * - deleteEmailVerifications(id) → Delete token
 * - listEmailVerifications(filters) → Get filtered list
 *
 * For PasswordReset model:
 * - createPasswordResets(data) → Create reset token
 * - retrievePasswordReset(id) → Get by ID
 * - updatePasswordResets(id, data) → Update token
 * - deletePasswordResets(id) → Delete token
 * - listPasswordResets(filters) → Get filtered list
 *
 * We Add Custom Logic:
 * ====================
 * - createEmailVerificationToken() → Generate token with 24h expiry
 * - verifyEmailToken() → Validate and mark as used
 * - createPasswordResetToken() → Generate token with 15min expiry
 * - verifyPasswordResetToken() → Validate token
 * - cleanupExpiredTokens() → Remove old tokens (cron job)
 *
 * Security Features:
 * ==================
 * - Cryptographically secure tokens (crypto.randomBytes)
 * - Email verification: 24 hour expiry
 * - Password reset: 15 minute expiry (best practice)
 * - One-time use tokens (marked as used)
 * - Automatic invalidation of old tokens
 */
