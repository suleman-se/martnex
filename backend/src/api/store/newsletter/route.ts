import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const subscribeSchema = z.object({
  email: z.string().email("A valid email address is required"),
})

/**
 * POST /store/newsletter
 *
 * Records a newsletter subscription request.
 *
 * NOTE: no mailing-list provider is wired up yet, so a successful response
 * means the address was accepted and logged - not that a provider stored it.
 * Swap the log line for the provider call when one is chosen.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = subscribeSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Invalid request",
    })
  }

  const { email } = parsed.data
  req.scope.resolve("logger").info(`[newsletter] subscription request: ${email}`)

  return res.status(200).json({
    message: "You're on the list. Watch your inbox for early catalog access.",
  })
}
