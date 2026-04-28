import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type SellerModuleService from "../modules/seller/service"

const SELLER_MODULE = "seller"

interface RegisterSellerInput {
  customer_id: string
  business_name: string
  business_email: string
  business_phone?: string
  business_address?: any
  tax_id?: string
  payout_method?: "bank_transfer" | "paypal" | "stripe"
  bank_details?: any
  paypal_email?: string
  commission_rate?: number
}

/**
 * Step 1: Create the Seller Profile
 */
export const createSellerStep = createStep(
  "create-seller-step",
  async (input: RegisterSellerInput, { container }) => {
    const sellerService = container.resolve<SellerModuleService>(SELLER_MODULE)
    
    // 1. Check if the customer is already a seller
    const existing = await sellerService.listSellers({
      customer_id: input.customer_id,
    })

    if (existing && existing.length > 0) {
      throw new Error("A seller profile already exists for this customer.")
    }

    // 2. Create the seller record. 
    // IMPORTANT: createSellers expects an ARRAY in Medusa v2.
    const sellers = await sellerService.createSellers([
      {
        ...input,
        commission_rate: input.commission_rate ?? 10.00,
        verification_status: "pending",
        is_active: true,
      }
    ])

    const seller = sellers[0]

    return new StepResponse(seller, seller.id)
  },
  async (sellerId: string, { container }) => {
    const sellerService = container.resolve<SellerModuleService>(SELLER_MODULE)
    if (sellerId) {
      await sellerService.deleteSellers(sellerId)
    }
  }
)

/**
 * Step 2: Update Role in Auth and Customer
 */
export const updateSellerRoleStep = createStep(
  "update-seller-role-step",
  async (input: { auth_id: string; customer_id: string }, { container }) => {
    const authService = container.resolve(Modules.AUTH)
    const customerService = container.resolve(Modules.CUSTOMER)
    
    // 1. Update Auth Identity metadata
    await authService.updateAuthIdentities({
      id: input.auth_id,
      app_metadata: {
        role: "seller"
      }
    })

    // 2. Update Customer metadata (for frontend sync)
    await customerService.updateCustomers(input.customer_id, {
      metadata: {
        role: "seller"
      }
    })

    return new StepResponse({ success: true })
  }
)

/**
 * Step 3: Notify Admin (Placeholder)
 */
export const notifyAdminStep = createStep(
  "notify-admin-step",
  async (seller: any) => {
    console.log(`[Notification] New seller application: ${seller.business_name} (${seller.id}) awaiting verification.`)
    return new StepResponse({ notified: true })
  }
)

/**
 * Workflow: Seller Registration
 */
export const registerSellerWorkflow = createWorkflow(
  "register-seller",
  (input: RegisterSellerInput & { auth_id: string }) => {
    const seller = createSellerStep(input)
    
    // Update role in auth identity and customer metadata
    updateSellerRoleStep({ auth_id: input.auth_id, customer_id: input.customer_id })
    
    notifyAdminStep(seller)
    
    return new WorkflowResponse(seller)
  }
)
