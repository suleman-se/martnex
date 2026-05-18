import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        ".medusa/",
        "**/*.spec.ts",
        "**/*.test.ts",
      ],
    },
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["node_modules", "dist", ".medusa"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Medusa server packages cannot be loaded by Vite in test mode.
      // We stub them so unit tests that mock the service layer still run.
      "@medusajs/utils": path.resolve(__dirname, "src/__mocks__/medusajs-utils.ts"),
      "@medusajs/framework": path.resolve(__dirname, "src/__mocks__/medusajs-framework.ts"),
    },
  },
})
