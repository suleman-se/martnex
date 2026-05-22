import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { IRegionModuleService, IStoreModuleService } from "@medusajs/framework/types"

/**
 * Martnex seed script — idempotent, creates:
 *  1. Default US/USD region
 *  2. Default warehouse stock location linked to the sales channel
 *  3. Product -> sales channel links
 *  4. Variant -> inventory item links for managed variants
 *  5. Inventory levels (100 units) for all inventory items at that location
 *  6. Store default currency USD
 */
export default async function seed({ container }: { container: any }) {
  const regionService = container.resolve(Modules.REGION) as IRegionModuleService
  const storeService = container.resolve(Modules.STORE) as IStoreModuleService
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
  const inventoryService = container.resolve(Modules.INVENTORY)
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK)
  const remoteQuery = container.resolve(ContainerRegistrationKeys.QUERY)

  // ── 1. Region ─────────────────────────────────────────────────────────────
  const existingRegions = await regionService.listRegions({})
  let region: any
  if (existingRegions.length > 0) {
    region = existingRegions[0]
    console.log(`✅ Region: ${region.name} (${region.currency_code})`)
  } else {
    region = await regionService.createRegions({
      name: "United States",
      currency_code: "usd",
      countries: ["us", "ca", "gb", "au", "de", "fr"],
    })
    console.log(`✅ Created region: ${region.name}`)
  }

  // ── 2. Sales Channel ──────────────────────────────────────────────────────
  const salesChannels = await salesChannelService.listSalesChannels({})
  const salesChannel = salesChannels[0]
  if (!salesChannel) {
    console.log("❌ No sales channel found. Run create-publishable-key first.")
    return
  }
  console.log(`✅ Sales channel: ${salesChannel.name} (${salesChannel.id})`)

  // ── 3. Stock Location (no address to avoid constraints) ───────────────────
  let stockLocation: any
  try {
    // Try to find existing via query (listStockLocations can miss in some versions)
    const { data: existing } = await remoteQuery.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    })
    stockLocation = existing?.[0] ?? null
  } catch {
    stockLocation = null
  }

  if (stockLocation) {
    console.log(`✅ Stock location: ${stockLocation.name} (${stockLocation.id})`)
  } else {
    try {
      stockLocation = await stockLocationService.createStockLocations({
        name: "Default Warehouse",
      })
      console.log(`✅ Created stock location: ${stockLocation.name} (${stockLocation.id})`)
    } catch (e: any) {
      console.log(`⚠️  Stock location creation failed: ${e.message}`)
      // Last resort — list again
      const fallback = await stockLocationService.listStockLocations({})
      stockLocation = fallback?.[0]
      if (stockLocation) {
        console.log(`✅ Using existing stock location: ${stockLocation.id}`)
      } else {
        console.log("❌ Could not create or find a stock location — stopping")
        return
      }
    }
  }

  // ── 4. Link stock location ↔ sales channel ────────────────────────────────
  try {
    await remoteLink.create([{
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    }])
    console.log(`✅ Linked stock location → sales channel`)
  } catch (e: any) {
    if (e.message?.includes("unique") || e.message?.includes("duplicate") || e.message?.includes("already")) {
      console.log(`ℹ️  Stock location → sales channel link already exists`)
    } else {
      console.log(`⚠️  Link failed: ${e.message}`)
    }
  }

  // ── 5. Link all products → sales channel ─────────────────────────────────
  const productService = container.resolve(Modules.PRODUCT)
  const products = await productService.listProducts({})
  let productLinksCreated = 0
  let productLinksSkipped = 0
  for (const product of products) {
    try {
      await remoteLink.create([{
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
      }])
      productLinksCreated++
    } catch {
      productLinksSkipped++
    }
  }
  console.log(`✅ Products → sales channel: ${productLinksCreated} linked, ${productLinksSkipped} already linked`)

  // ── 6. Ensure managed variants have inventory-item links ─────────────────
  let variants: any[] = []
  try {
    const result = await remoteQuery.graph({
      entity: "variant",
      fields: ["id", "sku", "manage_inventory", "inventory_items.inventory_item_id"],
    })
    variants = result?.data ?? []
  } catch {
    variants = []
  }

  let inventoryItemsCreated = 0
  let variantLinksCreated = 0
  for (const variant of variants) {
    if (!variant?.manage_inventory) {
      continue
    }

    const linkedItems = Array.isArray(variant.inventory_items) ? variant.inventory_items : []
    if (linkedItems.length > 0) {
      continue
    }

    try {
      const createdItem = await inventoryService.createInventoryItems({
        sku: variant.sku || undefined,
      })

      await remoteLink.create([{
        [Modules.PRODUCT]: { variant_id: variant.id },
        [Modules.INVENTORY]: { inventory_item_id: createdItem.id },
      }])

      inventoryItemsCreated++
      variantLinksCreated++
    } catch (e: any) {
      console.log(`⚠️  Could not repair inventory link for variant ${variant.id}: ${e.message}`)
    }
  }
  console.log(`✅ Variant inventory links: ${variantLinksCreated} repaired (${inventoryItemsCreated} items created)`)

  // ── 7. Inventory levels for all inventory items ───────────────────────────
  let inventoryItems: any[] = []
  try {
    const result = await remoteQuery.graph({
      entity: "inventory_item",
      fields: ["id"],
    })
    inventoryItems = result?.data ?? []
  } catch {
    inventoryItems = []
  }

  let levelsCreated = 0
  let levelsSkipped = 0
  for (const item of inventoryItems) {
    try {
      await inventoryService.createInventoryLevels([{
        inventory_item_id: item.id,
        location_id: stockLocation.id,
        stocked_quantity: 100,
      }])
      levelsCreated++
    } catch {
      levelsSkipped++
    }
  }
  if (inventoryItems.length > 0) {
    console.log(`✅ Inventory levels: ${levelsCreated} created, ${levelsSkipped} already existed`)
  } else {
    console.log(`ℹ️  No inventory items found (add products via Medusa admin first)`)
  }

  // ── 8. Link all products → default shipping profile ──────────────────────
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const shippingProfiles = await fulfillmentService.listShippingProfiles({})
  const shippingProfile = shippingProfiles[0]
  if (shippingProfile) {
    const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    let profileLinksCreated = 0
    let profileLinksSkipped = 0
    for (const product of products) {
      const existing = await knex.raw(
        `SELECT id FROM product_shipping_profile WHERE product_id = ? AND shipping_profile_id = ?`,
        [product.id, shippingProfile.id]
      )
      if (existing.rows?.length) {
        profileLinksSkipped++
        continue
      }
      const { generateEntityId } = await import("@medusajs/framework/utils")
      await knex.raw(
        `INSERT INTO product_shipping_profile (id, product_id, shipping_profile_id, created_at, updated_at)
         VALUES (?, ?, ?, now(), now())`,
        [generateEntityId(undefined, "prodsp"), product.id, shippingProfile.id]
      )
      profileLinksCreated++
    }
    console.log(`✅ Products → shipping profile: ${profileLinksCreated} linked, ${profileLinksSkipped} already linked`)
  } else {
    console.log(`ℹ️  No shipping profile found — run setup-shipping script first`)
  }

  // ── 9. Store default currency ──────────────────────────────────────────────
  const stores = await storeService.listStores({})
  if (stores.length > 0) {
    try {
      await storeService.updateStores(stores[0].id, {
        supported_currencies: [{ currency_code: "usd", is_default: true }],
      })
      console.log(`✅ Store default currency: USD`)
    } catch (e: any) {
      console.log(`ℹ️  Store currency: ${e.message}`)
    }
  }

  console.log("\n🎉 Seed complete!")
  console.log(`   Region:         ${region.name} (${region.id})`)
  console.log(`   Stock Location: ${stockLocation.name} (${stockLocation.id})`)
  console.log(`   Sales Channel:  ${salesChannel.name} (${salesChannel.id})`)
}
