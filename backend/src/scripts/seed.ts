import { Modules, ContainerRegistrationKeys, generateEntityId } from "@medusajs/framework/utils"
import type { IRegionModuleService, IStoreModuleService } from "@medusajs/framework/types"

/**
 * Martnex seed script — idempotent, creates:
 *  1. Default US/USD region
 *  2. Default warehouse stock location linked to the sales channel
 *  3. Default customer, seller, categories, and premium products
 *  4. Product -> sales channel links
 *  5. Variant -> inventory item links for managed variants
 *  6. Inventory levels (100 units) for all inventory items at that location
 *  7. Store default currency USD
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

  // ── 4b. Create default customer, seller, categories, and products ────────
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const sellerService = container.resolve("seller")
  const customerService = container.resolve(Modules.CUSTOMER)
  const productService = container.resolve(Modules.PRODUCT)

  // Find or create default seller
  let seller: any
  const existingSellers = await sellerService.listSellers({})
  if (existingSellers.length > 0) {
    seller = existingSellers[0]
    console.log(`✅ Using existing seller: ${seller.business_name} (${seller.id})`)
  } else {
    let customer: any
    const existingCustomers = await customerService.listCustomers({})
    if (existingCustomers.length > 0) {
      customer = existingCustomers[0]
    } else {
      customer = await customerService.createCustomers({
        email: "seller@martnex.com",
        first_name: "Store",
        last_name: "Owner",
      })
      console.log(`✅ Created default customer: ${customer.email}`)
    }

    const sellers = await sellerService.createSellers([
      {
        customer_id: customer.id,
        business_name: "Martnex Premium Goods",
        business_email: "seller@martnex.com",
        commission_rate: 10.00,
        verification_status: "verified",
        is_active: true,
      }
    ])
    seller = sellers[0]
    console.log(`✅ Created verified seller profile: ${seller.business_name} (${seller.id})`)

    await customerService.updateCustomers(customer.id, {
      metadata: { role: "seller" }
    })

    const authIdentity = await knex("auth_identity").first()
    if (authIdentity) {
      await knex("auth_identity")
        .where("id", authIdentity.id)
        .update({
          app_metadata: JSON.stringify({ ...authIdentity.app_metadata, role: "seller" })
        })
    }
  }

  // Categories
  const categorySpecs = [
    { name: "Apparel", handle: "apparel", description: "Designer fashion and premium outerwear" },
    { name: "Footwear", handle: "footwear", description: "Smart sneakers and handmade leather boots" },
    { name: "Lifestyle", handle: "lifestyle", description: "Commuter accessories and premium audio gear" }
  ]

  const categoryMap = new Map<string, string>()
  for (const spec of categorySpecs) {
    const existing = await productService.listProductCategories({ handle: spec.handle })
    if (existing.length > 0) {
      categoryMap.set(spec.handle, existing[0].id)
      console.log(`✅ Category already exists: ${spec.name} (${existing[0].id})`)
    } else {
      const cat = await productService.createProductCategories(spec)
      categoryMap.set(spec.handle, cat.id)
      console.log(`✅ Created category: ${spec.name} (${cat.id})`)
    }
  }

  // Premium Products Specifications
  const productsToCreate = [
    {
      title: "Urban Oversized Hoodie",
      handle: "oversized-hoodie",
      description: "An ultra-premium heavy weight oversized cotton-terry hoodie designed for ultimate comfort and architectural silhouette.",
      subtitle: "Premium Streetwear",
      is_giftcard: false,
      discountable: true,
      status: "published",
      images: [
        { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" },
        { url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600" },
        { url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600" }
      ],
      thumbnail: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600",
      categories: [{ id: categoryMap.get("apparel")! }],
      options: [
        { title: "Size", values: ["S", "M", "L", "XL"] },
        { title: "Color", values: ["Charcoal", "Sage"] }
      ],
      variants: [
        {
          title: "S / Charcoal",
          sku: "HOODIE-S-CHARCOAL",
          options: { Size: "S", Color: "Charcoal" },
          prices: [{ currency_code: "usd", amount: 89.00 }],
          manage_inventory: true
        },
        {
          title: "M / Charcoal",
          sku: "HOODIE-M-CHARCOAL",
          options: { Size: "M", Color: "Charcoal" },
          prices: [{ currency_code: "usd", amount: 89.00 }],
          manage_inventory: true
        },
        {
          title: "L / Charcoal",
          sku: "HOODIE-L-CHARCOAL",
          options: { Size: "L", Color: "Charcoal" },
          prices: [{ currency_code: "usd", amount: 89.00 }],
          manage_inventory: true
        },
        {
          title: "XL / Charcoal",
          sku: "HOODIE-XL-CHARCOAL",
          options: { Size: "XL", Color: "Charcoal" },
          prices: [{ currency_code: "usd", amount: 89.00 }],
          manage_inventory: true
        },
        {
          title: "S / Sage",
          sku: "HOODIE-S-SAGE",
          options: { Size: "S", Color: "Sage" },
          prices: [{ currency_code: "usd", amount: 89.00 }],
          manage_inventory: true
        },
        {
          title: "M / Sage",
          sku: "HOODIE-M-SAGE",
          options: { Size: "M", Color: "Sage" },
          prices: [{ currency_code: "usd", amount: 89.00 }],
          manage_inventory: true
        },
        {
          title: "L / Sage",
          sku: "HOODIE-L-SAGE",
          options: { Size: "L", Color: "Sage" },
          prices: [{ currency_code: "usd", amount: 89.00 }],
          manage_inventory: true
        },
        {
          title: "XL / Sage",
          sku: "HOODIE-XL-SAGE",
          options: { Size: "XL", Color: "Sage" },
          prices: [{ currency_code: "usd", amount: 89.00 }],
          manage_inventory: true
        }
      ]
    },
    {
      title: "Classic Tailored Blazer",
      handle: "tailored-blazer",
      description: "Double-breasted tailored blazer featuring relaxed shoulders and a crisp structural silhouette. Fully lined in organic silk-blend.",
      subtitle: "Elevated Outerwear",
      is_giftcard: false,
      discountable: true,
      status: "published",
      images: [
        { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600" },
        { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600" }
      ],
      thumbnail: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600",
      categories: [{ id: categoryMap.get("apparel")! }],
      options: [
        { title: "Size", values: ["S", "M", "L"] },
        { title: "Color", values: ["Midnight Black", "Sand"] }
      ],
      variants: [
        {
          title: "S / Midnight Black",
          sku: "BLAZER-S-BLACK",
          options: { Size: "S", Color: "Midnight Black" },
          prices: [{ currency_code: "usd", amount: 189.00 }],
          manage_inventory: true
        },
        {
          title: "M / Midnight Black",
          sku: "BLAZER-M-BLACK",
          options: { Size: "M", Color: "Midnight Black" },
          prices: [{ currency_code: "usd", amount: 189.00 }],
          manage_inventory: true
        },
        {
          title: "L / Midnight Black",
          sku: "BLAZER-L-BLACK",
          options: { Size: "L", Color: "Midnight Black" },
          prices: [{ currency_code: "usd", amount: 189.00 }],
          manage_inventory: true
        },
        {
          title: "S / Sand",
          sku: "BLAZER-S-SAND",
          options: { Size: "S", Color: "Sand" },
          prices: [{ currency_code: "usd", amount: 189.00 }],
          manage_inventory: true
        },
        {
          title: "M / Sand",
          sku: "BLAZER-M-SAND",
          options: { Size: "M", Color: "Sand" },
          prices: [{ currency_code: "usd", amount: 189.00 }],
          manage_inventory: true
        },
        {
          title: "L / Sand",
          sku: "BLAZER-L-SAND",
          options: { Size: "L", Color: "Sand" },
          prices: [{ currency_code: "usd", amount: 189.00 }],
          manage_inventory: true
        }
      ]
    },
    {
      title: "Apex Knit Sneakers",
      handle: "knit-sneakers",
      description: "Breathable knit training sneakers engineered with smart impact cushioning and premium recycled materials.",
      subtitle: "Athletic Footwear",
      is_giftcard: false,
      discountable: true,
      status: "published",
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600" },
        { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600" },
        { url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600" }
      ],
      thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
      categories: [{ id: categoryMap.get("footwear")! }],
      options: [
        { title: "Size", values: ["8", "9", "10", "11"] },
        { title: "Color", values: ["Aero Red", "Pure White"] }
      ],
      variants: [
        {
          title: "Size 8 / Aero Red",
          sku: "SNEAKERS-8-RED",
          options: { Size: "8", Color: "Aero Red" },
          prices: [{ currency_code: "usd", amount: 120.00 }],
          manage_inventory: true
        },
        {
          title: "Size 9 / Aero Red",
          sku: "SNEAKERS-9-RED",
          options: { Size: "9", Color: "Aero Red" },
          prices: [{ currency_code: "usd", amount: 120.00 }],
          manage_inventory: true
        },
        {
          title: "Size 10 / Aero Red",
          sku: "SNEAKERS-10-RED",
          options: { Size: "10", Color: "Aero Red" },
          prices: [{ currency_code: "usd", amount: 120.00 }],
          manage_inventory: true
        },
        {
          title: "Size 11 / Aero Red",
          sku: "SNEAKERS-11-RED",
          options: { Size: "11", Color: "Aero Red" },
          prices: [{ currency_code: "usd", amount: 120.00 }],
          manage_inventory: true
        },
        {
          title: "Size 8 / Pure White",
          sku: "SNEAKERS-8-WHITE",
          options: { Size: "8", Color: "Pure White" },
          prices: [{ currency_code: "usd", amount: 120.00 }],
          manage_inventory: true
        },
        {
          title: "Size 9 / Pure White",
          sku: "SNEAKERS-9-WHITE",
          options: { Size: "9", Color: "Pure White" },
          prices: [{ currency_code: "usd", amount: 120.00 }],
          manage_inventory: true
        },
        {
          title: "Size 10 / Pure White",
          sku: "SNEAKERS-10-WHITE",
          options: { Size: "10", Color: "Pure White" },
          prices: [{ currency_code: "usd", amount: 120.00 }],
          manage_inventory: true
        },
        {
          title: "Size 11 / Pure White",
          sku: "SNEAKERS-11-WHITE",
          options: { Size: "11", Color: "Pure White" },
          prices: [{ currency_code: "usd", amount: 120.00 }],
          manage_inventory: true
        }
      ]
    },
    {
      title: "Lugged Leather Boots",
      handle: "leather-boots",
      description: "Crafted from water-resistant full-grain leather, featuring a premium heavy duty lugged vibram outsole and cushioned insole.",
      subtitle: "Heritage Footwear",
      is_giftcard: false,
      discountable: true,
      status: "published",
      images: [
        { url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600" },
        { url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=600" }
      ],
      thumbnail: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600",
      categories: [{ id: categoryMap.get("footwear")! }],
      options: [
        { title: "Size", values: ["8", "9", "10"] },
        { title: "Color", values: ["Chestnut Brown", "Shadow Black"] }
      ],
      variants: [
        {
          title: "Size 8 / Chestnut Brown",
          sku: "BOOTS-8-BROWN",
          options: { Size: "8", Color: "Chestnut Brown" },
          prices: [{ currency_code: "usd", amount: 245.00 }],
          manage_inventory: true
        },
        {
          title: "Size 9 / Chestnut Brown",
          sku: "BOOTS-9-BROWN",
          options: { Size: "9", Color: "Chestnut Brown" },
          prices: [{ currency_code: "usd", amount: 245.00 }],
          manage_inventory: true
        },
        {
          title: "Size 10 / Chestnut Brown",
          sku: "BOOTS-10-BROWN",
          options: { Size: "10", Color: "Chestnut Brown" },
          prices: [{ currency_code: "usd", amount: 245.00 }],
          manage_inventory: true
        },
        {
          title: "Size 8 / Shadow Black",
          sku: "BOOTS-8-BLACK",
          options: { Size: "8", Color: "Shadow Black" },
          prices: [{ currency_code: "usd", amount: 245.00 }],
          manage_inventory: true
        },
        {
          title: "Size 9 / Shadow Black",
          sku: "BOOTS-9-BLACK",
          options: { Size: "9", Color: "Shadow Black" },
          prices: [{ currency_code: "usd", amount: 245.00 }],
          manage_inventory: true
        },
        {
          title: "Size 10 / Shadow Black",
          sku: "BOOTS-10-BLACK",
          options: { Size: "10", Color: "Shadow Black" },
          prices: [{ currency_code: "usd", amount: 245.00 }],
          manage_inventory: true
        }
      ]
    },
    {
      title: "Minimalist Leather Backpack",
      handle: "leather-backpack",
      description: "Sleek commuter backpack constructed with vegetable-tanned Italian leather and solid brass hardware. Features a padded 16-inch laptop pocket.",
      subtitle: "Everyday Carry",
      is_giftcard: false,
      discountable: true,
      status: "published",
      images: [
        { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600" },
        { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=600" }
      ],
      thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
      categories: [{ id: categoryMap.get("lifestyle")! }],
      options: [
        { title: "Color", values: ["Tan", "Obsidian"] }
      ],
      variants: [
        {
          title: "Tan",
          sku: "BACKPACK-TAN",
          options: { Color: "Tan" },
          prices: [{ currency_code: "usd", amount: 299.00 }],
          manage_inventory: true
        },
        {
          title: "Obsidian",
          sku: "BACKPACK-OBSIDIAN",
          options: { Color: "Obsidian" },
          prices: [{ currency_code: "usd", amount: 299.00 }],
          manage_inventory: true
        }
      ]
    },
    {
      title: "Acoustic Active ANC Headphones",
      handle: "anc-headphones",
      description: "Immersive sound experience with advanced active noise cancellation, custom dynamic drivers, and 40 hours of continuous wireless playback.",
      subtitle: "Premium Audio",
      is_giftcard: false,
      discountable: true,
      status: "published",
      images: [
        { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600" },
        { url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600" }
      ],
      thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
      categories: [{ id: categoryMap.get("lifestyle")! }],
      options: [
        { title: "Color", values: ["Matte Black", "Platinum Silver"] }
      ],
      variants: [
        {
          title: "Matte Black",
          sku: "ANC-HEADPHONES-BLACK",
          options: { Color: "Matte Black" },
          prices: [{ currency_code: "usd", amount: 350.00 }],
          manage_inventory: true
        },
        {
          title: "Platinum Silver",
          sku: "ANC-HEADPHONES-SILVER",
          options: { Color: "Platinum Silver" },
          prices: [{ currency_code: "usd", amount: 350.00 }],
          manage_inventory: true
        }
      ]
    }
  ]

  const { createProductsWorkflow } = await import("@medusajs/medusa/core-flows")

  // Collect all premium variant SKUs to clean up corresponding inventory items and prevent SKU conflicts
  const skusToDelete: string[] = []
  for (const item of productsToCreate) {
    if (Array.isArray(item.variants)) {
      for (const v of item.variants) {
        if (v.sku) {
          skusToDelete.push(v.sku)
        }
      }
    }
  }

  if (skusToDelete.length > 0) {
    const existingInventoryItems = await inventoryService.listInventoryItems({
      sku: skusToDelete
    })
    if (existingInventoryItems.length > 0) {
      const itemIds = existingInventoryItems.map((item: any) => item.id)
      await inventoryService.deleteInventoryItems(itemIds)
      console.log(`🧹 Cleaned up ${itemIds.length} existing inventory items to prevent SKU conflict`)
    }
  }

  for (const item of productsToCreate) {
    const existing = await productService.listProducts({ handle: item.handle })
    if (existing.length > 0) {
      const ids = existing.map((p: any) => p.id)
      await productService.deleteProducts(ids)
      console.log(`🧹 Cleaned up existing product to ensure proper pricing: ${item.title}`)
    }

    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [item as any]
      }
    })
    console.log(`✅ Seeded premium product with pricing: ${item.title} (${result[0].id})`)
  }

  // Link all products in database to the seller
  const finalProducts = await productService.listProducts({})
  for (const p of finalProducts) {
    const linkId = generateEntityId(undefined, "link")
    await knex.raw(
      `INSERT INTO product_product_seller_seller (id, product_id, seller_id, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())
       ON CONFLICT (product_id, seller_id) DO NOTHING`,
      [linkId, p.id, seller.id]
    )
  }
  console.log(`✅ Linked all products to seller: ${seller.business_name}`)

  // ── 5. Link all products → sales channel ─────────────────────────────────
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
