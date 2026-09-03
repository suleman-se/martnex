/**
 * Stub for @medusajs/utils
 *
 * Medusa server packages use Node.js internals that Vite cannot transform
 * in a test environment. This stub exposes only the surface area needed by
 * unit tests (services that extend MedusaService).
 *
 * Every model method returns a Proxy that satisfies unlimited chaining, e.g.
 *   model.text().nullable().default("x")
 *   model.enum([...]).nullable()
 *   model.id().primaryKey()
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// A Proxy that returns itself (wrapped in a new Proxy) for any property access
// or function call, supporting arbitrary method chaining depths.
function chainable(): any {
  const handler: ProxyHandler<any> = {
    get(_target: any, _prop: any) {
      // Return a callable chainable for any property access
      return chainable()
    },
    apply(_target: any, _thisArg: any, _args: any[]) {
      // Return a chainable when the proxy itself is called as a function
      return chainable()
    },
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Proxy(function () {}, handler)
}

const MedusaServiceFactory = (_models: Record<string, unknown>): any => {
  return class BaseService {
    // Intentionally empty — tests replace every method with vi.fn()
  }
}

// Minimal stand-in for MedusaError: services throw it for validation and
// conflict cases, and tests assert on the message.
class MedusaErrorStub extends Error {
  type: string

  static Types = {
    INVALID_DATA: "invalid_data",
    DUPLICATE_ERROR: "duplicate_error",
    NOT_FOUND: "not_found",
    NOT_ALLOWED: "not_allowed",
    UNAUTHORIZED: "unauthorized",
    UNEXPECTED_STATE: "unexpected_state",
  }

  constructor(type: string, message: string) {
    super(message)
    this.name = "MedusaError"
    this.type = type
  }
}

module.exports = {
  MedusaService: MedusaServiceFactory,
  MedusaError: MedusaErrorStub,
  model: {
    define: chainable,
    id: chainable,
    text: chainable,
    number: chainable,
    bigNumber: chainable,
    boolean: chainable,
    json: chainable,
    dateTime: chainable,
    enum: chainable,
  },
}
