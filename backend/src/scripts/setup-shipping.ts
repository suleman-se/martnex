import { Modules } from "@medusajs/framework/utils"
import type {
  IFulfillmentModuleService,
  IRegionModuleService,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function setupShipping({ container }: { container: any }) {
  const fulfillmentService = container.resolve(
    Modules.FULFILLMENT
  ) as IFulfillmentModuleService
  const regionService = container.resolve(
    Modules.REGION
  ) as IRegionModuleService
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // ── 1. Find existing data ──────────────────────────────────────────────────

  const [regions] = await regionService.listAndCountRegions({})
  if (!regions.length) {
    console.error("❌ No regions found. Run the seed script first.")
    return
  }
  const region = regions[0]
  console.log(`ℹ️  Region: ${region.name} (${region.id})`)

  // Find stock location via query
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  if (!stockLocations.length) {
    console.error("❌ No stock locations found. Run the seed script first.")
    return
  }
  const stockLocation = stockLocations[0]
  console.log(`ℹ️  Stock location: ${stockLocation.name} (${stockLocation.id})`)

  // Find or create shipping profile
  const profiles = await fulfillmentService.listShippingProfiles({})
  let shippingProfile = profiles.find((p: any) => p.name === "Default Shipping Profile") ?? profiles[0]
  if (!shippingProfile) {
    shippingProfile = await fulfillmentService.createShippingProfiles({
      name: "Default Shipping Profile",
      type: "default",
    })
    console.log(`✅ Created shipping profile: ${shippingProfile.id}`)
  } else {
    console.log(`ℹ️  Shipping profile: ${shippingProfile.name} (${shippingProfile.id})`)
  }

  // ── 2. Fulfillment set ─────────────────────────────────────────────────────

  const existingSets = await fulfillmentService.listFulfillmentSets({})
  let fulfillmentSet = existingSets.find((s: any) => s.name === "Default Fulfillment Set")
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentService.createFulfillmentSets({
      name: "Default Fulfillment Set",
      type: "shipping",
    })
    console.log(`✅ Created fulfillment set: ${fulfillmentSet.id}`)

    // Link fulfillment set to stock location
    await remoteLink.create([
      {
        [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
        [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
      },
    ])
    console.log("✅ Linked fulfillment set → stock location")
  } else {
    console.log(`ℹ️  Fulfillment set already exists: ${fulfillmentSet.id}`)
  }

  // ── 3. Service zone ────────────────────────────────────────────────────────

  // Reload fulfillment set with service zones
  const [fullFulfillmentSet] = await fulfillmentService.listFulfillmentSets(
    { id: fulfillmentSet.id },
    { relations: ["service_zones", "service_zones.geo_zones"] }
  )

  let serviceZone = fullFulfillmentSet?.service_zones?.[0]
  if (!serviceZone) {
    serviceZone = await fulfillmentService.createServiceZones({
      name: "Worldwide",
      fulfillment_set_id: fulfillmentSet.id,
      geo_zones: [{ type: "global" }],
    })
    console.log(`✅ Created service zone: ${serviceZone.id}`)
  } else {
    console.log(`ℹ️  Service zone already exists: ${serviceZone.id}`)
  }

  // ── 4. Shipping options ────────────────────────────────────────────────────

  const existingOptions = await fulfillmentService.listShippingOptions({
    service_zone_id: serviceZone.id,
  })

  if (existingOptions.length) {
    console.log(`ℹ️  ${existingOptions.length} shipping option(s) already exist:`)
    existingOptions.forEach((o: any) =>
      console.log(`     - ${o.name} (${o.id})`)
    )
    return
  }

  const standardOption = await fulfillmentService.createShippingOptions({
    name: "Standard Shipping",
    service_zone_id: serviceZone.id,
    shipping_profile_id: shippingProfile.id,
    provider_id: "manual_manual",
    type: {
      label: "Standard",
      description: "Standard shipping",
      code: "standard",
    },
    price_type: "flat",
    rules: [],
    prices: [
      { currency_code: "usd", amount: 0 },
    ],
  })
  console.log(`✅ Created shipping option: ${standardOption.name} (${standardOption.id}) — Free`)

  const expressOption = await fulfillmentService.createShippingOptions({
    name: "Express Shipping",
    service_zone_id: serviceZone.id,
    shipping_profile_id: shippingProfile.id,
    provider_id: "manual_manual",
    type: {
      label: "Express",
      description: "Express 1-2 day shipping",
      code: "express",
    },
    price_type: "flat",
    rules: [],
    prices: [
      { currency_code: "usd", amount: 999 },
    ],
  })
  console.log(`✅ Created shipping option: ${expressOption.name} (${expressOption.id}) — $9.99`)

  console.log("🎉 Shipping setup complete!")
}
