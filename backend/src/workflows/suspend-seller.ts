import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SELLER_MODULE } from "@modules/seller"
import type SellerModuleService from "@modules/seller/service"

export interface SuspendSellerWorkflowInput {
  id: string
  reason: string
}

export const suspendSellerStep = createStep(
  "suspend-seller-step",
  async (input: SuspendSellerWorkflowInput, { container }) => {
    const sellerService = container.resolve<SellerModuleService>(SELLER_MODULE)
    const seller = await sellerService.suspendSeller(input.id, input.reason)
    return new StepResponse(seller)
  }
)

export const suspendSellerWorkflow = createWorkflow(
  "suspend-seller-workflow",
  function (input: SuspendSellerWorkflowInput) {
    const seller = suspendSellerStep(input)
    return new WorkflowResponse(seller)
  }
)
