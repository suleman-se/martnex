import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PAYOUT_MODULE } from "@modules/payout"
import type PayoutModuleService from "@modules/payout/service"

export interface CancelPayoutWorkflowInput {
  id: string
  adminId: string
  reason: string
}

export const cancelPayoutStep = createStep(
  "cancel-payout-step",
  async (input: CancelPayoutWorkflowInput, { container }) => {
    const payoutService = container.resolve<PayoutModuleService>(PAYOUT_MODULE)
    const payout = await payoutService.cancelPayout(
      input.id,
      input.adminId,
      input.reason
    )
    return new StepResponse(payout)
  }
)

export const cancelPayoutWorkflow = createWorkflow(
  "cancel-payout-workflow",
  function (input: CancelPayoutWorkflowInput) {
    const payout = cancelPayoutStep(input)
    return new WorkflowResponse(payout)
  }
)
