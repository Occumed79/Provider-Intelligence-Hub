import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();
const startedAt = new Date();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/status", async (_req, res) => {
  const status = {
    app: "Provider Intelligence Hub API",
    status: "ok",
    environment: process.env.NODE_ENV ?? "development",
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
    database: "unknown",
    timestamp: new Date().toISOString(),
  };

  try {
    await pool.query("select 1 as ok");
    status.database = "connected";
    res.json(status);
  } catch (error) {
    status.status = "degraded";
    status.database = "error";
    res.status(503).json({
      ...status,
      message: "API is running, but the database connection failed.",
    });
  }
});

export default router;
