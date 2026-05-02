import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler";
import * as controller from "./groups.controller";

export const groupRoutes = Router();

groupRoutes.post("/", asyncHandler(controller.create));
groupRoutes.get("/", asyncHandler(controller.list));
groupRoutes.get("/:id", asyncHandler(controller.getById));
groupRoutes.patch("/:id", asyncHandler(controller.patch));
groupRoutes.delete("/:id", asyncHandler(controller.remove));
groupRoutes.get("/:id/vocabulary", asyncHandler(controller.vocabulary));
