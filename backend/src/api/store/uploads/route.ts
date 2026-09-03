import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

type UploadedFile = {
  originalname: string
  mimetype: string
  buffer: Buffer
}

type StoreUploadRequest = AuthenticatedMedusaRequest & {
  files?: UploadedFile[]
}

/**
 * GET /store/uploads
 * Inform callers that this endpoint only supports multipart POST uploads.
 */
export async function GET(_: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.status(405).json({
    message: "Use POST /store/uploads with multipart/form-data and one or more files[] entries.",
  })
}

/**
 * POST /store/uploads
 * Upload one or more seller product images through Medusa's file workflow.
 */
export async function POST(req: StoreUploadRequest, res: MedusaResponse) {
  const files = req.files

  if (!files?.length) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "No files were uploaded")
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: files.map((file) => ({
        filename: file.originalname,
        mimeType: file.mimetype,
        content: file.buffer.toString("base64"),
        access: "public",
      })),
    },
  })

  res.status(200).json({
    uploads: result.map((file) => ({
      id: file.id,
      url: file.url,
    })),
  })
}
