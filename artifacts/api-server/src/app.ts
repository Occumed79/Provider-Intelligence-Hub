import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN;

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: frontendOrigin ? [frontendOrigin] : true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/", (_req, res) => {
  res.json({
    app: "Provider Intelligence Hub API",
    status: "ok",
    health: "/api/healthz",
    keepAwake: "/api/health",
    statusCheck: "/api/status",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "provider-intelligence-hub", awake: true });
});

app.head("/api/health", (_req, res) => {
  res.status(200).end();
});

app.use("/api", router);

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested Provider Intelligence Hub API route does not exist.",
  });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "Unhandled API error");
  res.status(500).json({
    error: "Internal server error",
    message: "Provider Intelligence Hub API encountered an unexpected error.",
  });
});

export default app;
