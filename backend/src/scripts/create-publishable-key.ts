import { Modules } from "@medusajs/framework/utils"
import type { IApiKeyModuleService } from "@medusajs/framework/types"

export default async function createPublishableKey({ container }: { container: any }) {
  const apiKeyService = container.resolve(Modules.API_KEY) as IApiKeyModuleService

  // Check for existing publishable keys
  const existing = await apiKeyService.listApiKeys({ type: "publishable" })
  if (existing.length > 0) {
    console.log("✅ Publishable API key already exists:")
    existing.forEach((k: any) => {
      console.log(`  Title: ${k.title}`)
      console.log(`  Token: ${k.token}`)
      console.log(`  ID: ${k.id}`)
      console.log("")
      console.log("Add to frontend/.env.local:")
      console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${k.token}`)
    })
    return
  }

  // Create a new publishable key
  const key = await apiKeyService.createApiKeys({
    title: "Martnex Storefront",
    type: "publishable",
    created_by: "seed",
  })

  console.log("✅ Created publishable API key:")
  console.log(`  Title: ${key.title}`)
  console.log(`  Token: ${key.token}`)
  console.log(`  ID: ${key.id}`)
  console.log("")
  console.log("Add this to frontend/.env.local:")
  console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}`)
}
