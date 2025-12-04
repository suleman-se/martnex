import { loadEnv, defineConfig } from "@medusajs/utils"
import { isMultiVendorMode } from "./src/config/store-mode"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      connection: {
        ssl: false,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:7001,http://localhost:9001",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    // Redis event bus (required for Medusa v2)
    {
      resolve: "@medusajs/event-bus-redis",
      key: "event_bus_redis",
      options: {
        redisUrl: process.env.REDIS_URL
      }
    },

    // Redis cache (required for Medusa v2)
    {
      resolve: "@medusajs/cache-redis",
      key: "cache_redis",
      options: {
        redisUrl: process.env.REDIS_URL
      }
    },

    // Custom modules (conditionally loaded based on STORE_MODE)
    // Only loads if STORE_MODE=MULTI_VENDOR_MARKETPLACE
    ...(isMultiVendorMode() ? [
      // Seller module
      {
        resolve: "./src/modules/seller",
      },

      // Commission module
      {
        resolve: "./src/modules/commission",
      },

      // Payout module
      {
        resolve: "./src/modules/payout",
      },
    ] : []),
  ],
})
