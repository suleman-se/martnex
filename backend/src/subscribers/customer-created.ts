import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import EmailService from "../services/email-service"

export default async function customerCreatedHandler({ event: { data }, container }: SubscriberArgs) {
  const logger = container.resolve("logger")
  const emailService = new EmailService({ logger: logger as any })
  const payload = data as any
  
  await emailService.sendVerificationEmail(
    payload.email,
    payload.token,
    payload.first_name || "Merchant"
  )
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
