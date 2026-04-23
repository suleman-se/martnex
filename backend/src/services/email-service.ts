import { Logger } from "@medusajs/framework/types"
import nodemailer from "nodemailer"

type EmailOptions = {
  to: string
  subject: string
  html: string
}

export default class EmailService {
  private transporter: nodemailer.Transporter
  private logger: Logger

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger
    
    const smtpOptions: any = {
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
    }

    // Only add auth if credentials are provided to avoid "Missing credentials for PLAIN" error
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      smtpOptions.auth = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    }

    this.transporter = nodemailer.createTransport(smtpOptions)
  }

  async sendEmail(options: EmailOptions) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        this.logger.warn(`[EmailService] SMTP credentials missing. Mocking email delivery to ${options.to}`)
        this.logger.info(`[EmailService] Subject: ${options.subject}`)
        // Optional: you can console.log(options.html) if you want to see the raw HTML
        return { messageId: 'mock-message-id' }
      }

      const from = process.env.SMTP_USER || '"Martnex" <noreply@martnex.com>'
      const info = await this.transporter.sendMail({
        from,
        ...options,
      })
      this.logger.info(`[EmailService] Email sent to ${options.to}: ${info.messageId}`)
      
      return info
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`[EmailService] Failed to send email to ${options.to}: ${error.message}`)
      }
      throw error
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string) {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`

    return this.sendEmail({
      to: email,
      subject: "Verify your Martnex account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #0F172A; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 900; font-size: 24px;">M</div>
          </div>
          <h1 style="color: #0F172A; text-align: center;">Welcome to Martnex, ${firstName}!</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
            You're almost there! Click the button below to verify your email address and activate your storefront access.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}" style="background-color: #0F172A; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; letter-spacing: 1px; text-transform: uppercase; font-size: 14px;">Verify Email Address</a>
          </div>
          <p style="color: #94A3B8; font-size: 12px; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #0F172A;">${verificationUrl}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #94A3B8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
            Martnex Distributed Network
          </p>
        </div>
      `,
    })
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    return this.sendEmail({
      to: email,
      subject: "Reset your Martnex password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #0F172A; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 900; font-size: 24px;">M</div>
          </div>
          <h1 style="color: #0F172A; text-align: center;">Password Reset Request</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
            We received a request to reset your password. If this wasn't you, you can safely ignore this email.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background-color: #0F172A; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; letter-spacing: 1px; text-transform: uppercase; font-size: 14px;">Reset Password</a>
          </div>
          <p style="color: #94A3B8; font-size: 12px; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #0F172A;">${resetUrl}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #94A3B8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
            Martnex Distributed Network
          </p>
        </div>
      `,
    })
  }
}
