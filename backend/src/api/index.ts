import { Router } from "express";

export default (rootDirectory: string): Router => {
  const router = Router();

  // Custom API routes will be added here
  // Example: router.use("/seller", sellerRoutes());

  return router;
};
