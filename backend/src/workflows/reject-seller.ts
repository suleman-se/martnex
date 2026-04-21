import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SELLER_MODULE } from "@modules/seller"
import type SellerModuleService from "@modules/seller/service"

export interface RejectSellerWorkflowInput {
  id: string
  reason: string
}

export const rejectSellerStep = createStep(
  "reject-seller-step",
  async (input: RejectSellerWorkflowInput, { container }) => {
    const sellerService = container.resolve<SellerModuleService>(SELLER_MODULE)
    const seller = await sellerService.rejectSeller(input.id, input.reason)
    return new StepResponse(seller)
  }
)

export const rejectSellerWorkflow = createWorkflow(
  "reject-seller-workflow",
  function (input: RejectSellerWorkflowInput) {
    const seller = rejectSellerStep(input)
    return new WorkflowResponse(seller)
  }
)
