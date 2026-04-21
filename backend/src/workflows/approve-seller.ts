import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SELLER_MODULE } from "@modules/seller"
import type SellerModuleService from "@modules/seller/service"

export interface ApproveSellerWorkflowInput {
  id: string
  notes?: string
}

export const approveSellerStep = createStep(
  "approve-seller-step",
  async (input: ApproveSellerWorkflowInput, { container }) => {
    const sellerService = container.resolve<SellerModuleService>(SELLER_MODULE)
    const seller = await sellerService.approveSeller(input.id, input.notes)
    return new StepResponse(seller)
  }
)

export const approveSellerWorkflow = createWorkflow(
  "approve-seller-workflow",
  function (input: ApproveSellerWorkflowInput) {
    const seller = approveSellerStep(input)
    return new WorkflowResponse(seller)
  }
)
