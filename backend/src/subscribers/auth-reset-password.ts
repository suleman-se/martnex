import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import EmailService from "../services/email-service"

export default async function authPasswordResetHandler({ event: { data }, container }: SubscriberArgs) {
  const logger = container.resolve("logger")
  const emailService = new EmailService({ logger: logger as any })
  const payload = data as any
  
  await emailService.sendPasswordResetEmail(
    payload.email,
    payload.token
  )
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
