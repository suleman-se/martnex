

/**
 * Global application EmailService
 * Handles sending transactional emails (Verifications, Resets).
 * Currently logs the tokens and URLs securely during development.
 */
export class EmailService {
  private getBaseUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:3000'
  }

  async sendVerificationEmail(email: string, token: string, firstName?: string) {
    const verificationUrl = `${this.getBaseUrl()}/verify-email?token=${token}`

    console.log(`
    📧 [EMAIL SENT: Email Verification]
    To: ${email}
    Subject: Verify your Martnex Account
    Body:
      Hello ${firstName || 'User'},
      
      Please verify your email address by clicking the link below:
      ${verificationUrl}
      
      This link will expire in 24 hours.
    `)
    
    // In production, instantiate SendGrid/Nodemailer here
    return true
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${this.getBaseUrl()}/reset-password?token=${token}`

    console.log(`
    📧 [EMAIL SENT: Password Reset]
    To: ${email}
    Subject: Reset your Martnex Password
    Body:
      We received a request to reset your password.
      
      Please click the link below to set a new password:
      ${resetUrl}
      
      This link will expire in 15 minutes.
      If you did not request this, please ignore this email.
    `)
    
    // In production, instantiate SendGrid/Nodemailer here
    return true
  }
}

export const emailService = new EmailService()
