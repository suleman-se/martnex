import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PAYOUT_MODULE } from "@modules/payout"
import type PayoutModuleService from "@modules/payout/service"

export interface ApprovePayoutWorkflowInput {
  id: string
  adminId: string
  notes?: string
}

export const approvePayoutStep = createStep(
  "approve-payout-step",
  async (input: ApprovePayoutWorkflowInput, { container }) => {
    const payoutService = container.resolve<PayoutModuleService>(PAYOUT_MODULE)
    const payout = await payoutService.approvePayout(
      input.id,
      input.adminId,
      input.notes
    )
    return new StepResponse(payout)
  }
)

export const approvePayoutWorkflow = createWorkflow(
  "approve-payout-workflow",
  function (input: ApprovePayoutWorkflowInput) {
    const payout = approvePayoutStep(input)
    return new WorkflowResponse(payout)
  }
)
