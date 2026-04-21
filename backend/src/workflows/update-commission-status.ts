import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { COMMISSION_MODULE } from "@modules/commission"
import type CommissionModuleService from "@modules/commission/service"

export type CommissionStatus =
  | "pending"
  | "approved"
  | "paid"
  | "disputed"
  | "cancelled"

export interface UpdateCommissionStatusWorkflowInput {
  id: string
  status: CommissionStatus
}

export const updateCommissionStatusStep = createStep(
  "update-commission-status-step",
  async (input: UpdateCommissionStatusWorkflowInput, { container }) => {
    const commissionService =
      container.resolve<CommissionModuleService>(COMMISSION_MODULE)

    const commission = await commissionService.updateCommissions({
      id: input.id,
      status: input.status,
    })

    return new StepResponse(commission)
  }
)

export const updateCommissionStatusWorkflow = createWorkflow(
  "update-commission-status-workflow",
  function (input: UpdateCommissionStatusWorkflowInput) {
    const commission = updateCommissionStatusStep(input)
    return new WorkflowResponse(commission)
  }
)
