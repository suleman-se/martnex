import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { COMMISSION_MODULE } from "@modules/commission"
import type CommissionModuleService from "@modules/commission/service"
import { PAYOUT_MODULE } from "@modules/payout"
import type PayoutModuleService from "@modules/payout/service"

export interface CreatePayoutRequestWorkflowInput {
  sellerId: string
  commissionIds: string[]
  amount: number
}

const validateCommissionsStep = createStep(
  "validate-commissions-for-payout-step",
  async (input: CreatePayoutRequestWorkflowInput, { container }) => {
    const commissionService =
      container.resolve<CommissionModuleService>(COMMISSION_MODULE)

    const commissions = await Promise.all(
      input.commissionIds.map((id) => commissionService.retrieveCommission(id))
    )

    const invalidCommissions = commissions.filter(
      (commission) =>
        !commission ||
        commission.seller_id !== input.sellerId ||
        commission.status !== "approved"
    )

    if (invalidCommissions.length > 0) {
      throw new Error(
        "Some commissions are invalid. Only approved commissions from this seller can be included."
      )
    }

    return new StepResponse(input)
  }
)

const createPayoutRequestStep = createStep(
  "create-payout-request-step",
  async (input: CreatePayoutRequestWorkflowInput, { container }) => {
    const payoutService = container.resolve<PayoutModuleService>(PAYOUT_MODULE)

    const payout = await payoutService.createPayoutRequest({
      sellerId: input.sellerId,
      commissionIds: input.commissionIds,
      amount: input.amount,
    })

    return new StepResponse(payout)
  }
)

export const createPayoutRequestWorkflow = createWorkflow(
  "create-payout-request-workflow",
  function (input: CreatePayoutRequestWorkflowInput) {
    const validatedInput = validateCommissionsStep(input)
    const payout = createPayoutRequestStep(validatedInput)
    return new WorkflowResponse(payout)
  }
)
