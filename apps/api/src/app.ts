import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { authRoutes } from "./modules/auth/auth.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { groupRoutes } from "./modules/groups/groups.routes";
import { practiceRoutes } from "./modules/practice/practice.routes";
import { searchHistoryRoutes } from "./modules/search-history/search-history.routes";
import { userRoutes } from "./modules/users/users.routes";
import { vocabularyRoutes } from "./modules/vocabulary/vocabulary.routes";
import { openApiDocument } from "./openapi/document";
import { sendSuccess } from "./shared/api-response";
import { AppError } from "./shared/errors";
import { env } from "./config/env";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => sendSuccess(res, { status: "ok" as const }));
  app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use("/auth", authRoutes);
  app.use("/users", authMiddleware, userRoutes);
  app.use("/vocabulary", authMiddleware, vocabularyRoutes);
  app.use("/groups", authMiddleware, groupRoutes);
  app.use("/practice", authMiddleware, practiceRoutes);
  app.use("/search-history", authMiddleware, searchHistoryRoutes);
  app.use("/dashboard", authMiddleware, dashboardRoutes);

  app.use((_req, _res, next) => next(new AppError(404, "NOT_FOUND", "Route not found.")));
  app.use(errorHandler);

  return app;
};

export const app = createApp();
