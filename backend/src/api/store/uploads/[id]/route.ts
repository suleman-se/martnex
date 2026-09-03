import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deleteFilesWorkflow } from "@medusajs/medusa/core-flows"

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const id = req.params.id

  await deleteFilesWorkflow(req.scope).run({
    input: { ids: [id] },
  })

  res.status(200).json({
    id,
    object: "file",
    deleted: true,
  })
}