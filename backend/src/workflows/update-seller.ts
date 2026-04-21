import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SELLER_MODULE } from "@modules/seller"
import type SellerModuleService from "@modules/seller/service"

export interface UpdateSellerWorkflowInput {
  id: string
  updateData: Record<string, unknown>
}

export const updateSellerStep = createStep(
  "update-seller-step",
  async (input: UpdateSellerWorkflowInput, { container }) => {
    const sellerService = container.resolve<SellerModuleService>(SELLER_MODULE)

    const seller = await sellerService.updateSellers({
      id: input.id,
      ...(input.updateData as Record<string, unknown>),
    })

    return new StepResponse(seller)
  }
)

export const updateSellerWorkflow = createWorkflow(
  "update-seller-workflow",
  function (input: UpdateSellerWorkflowInput) {
    const seller = updateSellerStep(input)
    return new WorkflowResponse(seller)
  }
)
