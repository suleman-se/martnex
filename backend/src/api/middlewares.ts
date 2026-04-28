import { 
  type MiddlewaresConfig, 
  authenticate,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "zod/v3"

// ─── Validation Schemas ──────────────────────────────────────────────────────

const CreateProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["draft", "proposed", "published"]).default("draft"),
  category_ids: z.array(z.string()).optional(),
  images: z.array(z.object({ url: z.string().url() })).optional(),
  options: z
    .array(z.object({ title: z.string().min(1), values: z.array(z.string()) }))
    .optional(),
  variants: z
    .array(
      z.object({
        title: z.string(),
        prices: z.array(
          z.object({ amount: z.number().nonnegative(), currency_code: z.string().length(3) })
        ),
        inventory_quantity: z.number().int().nonnegative().optional(),
        sku: z.string().optional(),
        options: z
          .array(z.object({ title: z.string(), value: z.string() }))
          .optional(),
      })
    )
    .optional(),
})

const UpdateProductSchema = CreateProductSchema.partial()

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

export default {
  routes: [
    // ─── Custom Store routes ──────────────────────────────────────────
    {
      matcher: "/store/sellers",
      methods: ["POST"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/sellers/me*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/commissions*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/payouts*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/sellers/me/products*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/sellers/me/products",
      methods: ["POST"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      middlewares: [validateAndTransformBody(CreateProductSchema as any)],
    },
    {
      matcher: "/store/sellers/me/products/:id",
      methods: ["POST"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      middlewares: [validateAndTransformBody(UpdateProductSchema as any)],
    },

    // ─── Custom Admin routes ──────────────────────────────────────────
    {
      matcher: "/admin/sellers*",
      middlewares: [authenticate("user", ["session", "bearer"])],
    },
    {
      matcher: "/admin/commissions*",
      middlewares: [authenticate("user", ["session", "bearer"])],
    },
    {
      matcher: "/admin/payouts*",
      middlewares: [authenticate("user", ["session", "bearer"])],
    },
  ],
} as MiddlewaresConfig

