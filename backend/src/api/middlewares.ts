import { 
  type MiddlewaresConfig, 
  authenticate,
} from "@medusajs/framework/http"

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

