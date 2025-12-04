/**
 * Test Script: Module Registration
 *
 * Tests if custom modules are properly registered in the container.
 * Run with: npx medusa exec ./src/scripts/test-modules.ts
 */

import type { MedusaContainer } from "@medusajs/types"
import { SELLER_MODULE } from "../modules/seller"
import { COMMISSION_MODULE } from "../modules/commission"
import { PAYOUT_MODULE } from "../modules/payout"
import { isMultiVendorMode } from "../config/store-mode"

export default async function testModules({ container }: { container: MedusaContainer }) {
  console.log("\n" + "=".repeat(50))
  console.log("🧪 MODULE REGISTRATION TEST")
  console.log("=".repeat(50) + "\n")

  console.log("Store Mode:", isMultiVendorMode() ? "Multi-Vendor Marketplace" : "Single Store")
  console.log("")

  if (!isMultiVendorMode()) {
    console.log("⚠️  Single Store Mode - Custom modules should NOT be loaded")
    console.log("")
  }

  // Test Seller Module
  console.log("1️⃣ Testing Seller Module...")
  try {
    const sellerService = container.resolve(SELLER_MODULE)
    console.log("   ✅ Registered in container")

    // Check available methods
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sellerService))
      .filter(m => !m.startsWith('_') && m !== 'constructor')

    console.log("   ✅ Available methods:")
    methods.slice(0, 5).forEach(method => {
      console.log(`      - ${method}()`)
    })
    if (methods.length > 5) {
      console.log(`      ... and ${methods.length - 5} more`)
    }
  } catch (error: any) {
    if (isMultiVendorMode()) {
      console.log("   ❌ NOT registered (ERROR)")
      console.log("   Error:", error.message)
    } else {
      console.log("   ✅ Correctly NOT loaded (Single Store Mode)")
    }
  }
  console.log("")

  // Test Commission Module
  console.log("2️⃣ Testing Commission Module...")
  try {
    const commissionService = container.resolve(COMMISSION_MODULE)
    console.log("   ✅ Registered in container")
    console.log("   ✅ Service type:", commissionService.constructor.name)
  } catch (error: any) {
    if (isMultiVendorMode()) {
      console.log("   ❌ NOT registered (ERROR)")
      console.log("   Error:", error.message)
    } else {
      console.log("   ✅ Correctly NOT loaded (Single Store Mode)")
    }
  }
  console.log("")

  // Test Payout Module
  console.log("3️⃣ Testing Payout Module...")
  try {
    const payoutService = container.resolve(PAYOUT_MODULE)
    console.log("   ✅ Registered in container")
    console.log("   ✅ Service type:", payoutService.constructor.name)
  } catch (error: any) {
    if (isMultiVendorMode()) {
      console.log("   ❌ NOT registered (ERROR)")
      console.log("   Error:", error.message)
    } else {
      console.log("   ✅ Correctly NOT loaded (Single Store Mode)")
    }
  }
  console.log("")

  console.log("=".repeat(50))
  console.log("✅ MODULE REGISTRATION TEST COMPLETE")
  console.log("=".repeat(50) + "\n")
}
