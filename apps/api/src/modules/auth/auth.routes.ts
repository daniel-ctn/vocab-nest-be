import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../shared/async-handler";
import * as controller from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(controller.register));
authRoutes.post("/login", asyncHandler(controller.login));
authRoutes.get("/me", authMiddleware, asyncHandler(controller.me));
