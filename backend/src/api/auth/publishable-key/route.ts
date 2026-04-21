import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { IApiKeyModuleService } from "@medusajs/framework/types"

/**
 * GET /auth/publishable-key
 * Returns the first available publishable API key token for storefront requests.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const apiKeyService = req.scope.resolve<IApiKeyModuleService>(Modules.API_KEY)

    const keys = await apiKeyService.listApiKeys({ type: "publishable" })
    const key = keys[0]

    if (!key) {
      res.status(404).json({
        message: "No publishable API key found",
      })
      return
    }

    res.status(200).json({
      publishable_key: key.token,
      id: key.id,
      title: key.title,
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch publishable key",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
