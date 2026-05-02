import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler";
import * as controller from "./dashboard.controller";

export const dashboardRoutes = Router();

dashboardRoutes.get("/summary", asyncHandler(controller.summary));
