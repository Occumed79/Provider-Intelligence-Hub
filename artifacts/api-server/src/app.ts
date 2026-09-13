import path from "node:path";
import express, { type Express } from "express";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { resolveFrontendDist } from "./lib/frontend";

const app: Express = express();
const frontendDist = resolveFrontendDist();

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

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "network-development-hub",
    awake: true,
  });
});

app.head("/api/health", (_req, res) => {
  res.status(200).end();
});

app.use("/api", router);

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested Network Development Hub API route does not exist.",
  });
});

app.use(express.static(frontendDist));

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }

  res.sendFile(path.join(frontendDist, "index.html"));
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested Network Development Hub route does not exist.",
  });
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error({ err }, "Unhandled API error");
    res.status(500).json({
      error: "Internal server error",
      message: "Network Development Hub encountered an unexpected error.",
    });
  },
);

export default app;
