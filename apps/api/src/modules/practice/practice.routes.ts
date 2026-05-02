import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler";
import * as controller from "./practice.controller";

export const practiceRoutes = Router();

practiceRoutes.get("/today", asyncHandler(controller.today));
practiceRoutes.post("/:id/items/:itemId/review", asyncHandler(controller.reviewItem));
practiceRoutes.post("/:id/complete", asyncHandler(controller.complete));
