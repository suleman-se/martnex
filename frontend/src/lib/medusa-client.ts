import Medusa from "@medusajs/js-sdk"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9001"

let cachedPublishableKey =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export function getBackendUrl(): string {
  return BACKEND_URL
}

export async function getPublishableKey(): Promise<string> {
  if (cachedPublishableKey) {
    return cachedPublishableKey
  }

  // Traditional Martnex lookup fallback
  try {
    const response = await fetch(`${BACKEND_URL}/auth/publishable-key`)
    if (response.ok) {
      const data = (await response.json()) as { publishable_key?: string }
      if (data.publishable_key) {
        cachedPublishableKey = data.publishable_key
        return cachedPublishableKey
      }
    }
  } catch (e) {
    console.warn("Could not fetch publishable key from /auth/publishable-key")
  }

  return ""
}

// Official Medusa JS SDK Instance
export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: cachedPublishableKey || undefined,
})

export async function buildStoreHeaders(token?: string): Promise<HeadersInit> {
  const publishableKey = await getPublishableKey()

  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableKey,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
