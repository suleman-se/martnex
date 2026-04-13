import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function authPasswordResetHandler({ event: { data }, container }: SubscriberArgs) {
  const logger = container.resolve("logger")
  const payload = data as any
  
  // In a production environment with @medusajs/notification installed, 
  // you would resolve Modules.NOTIFICATION here and dispatch an email.
  logger.info(`[Notification] Would send Mock Password Reset Email to: ${payload.entity_id} with token: ${payload.token}`)
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
