import type { Request, Response } from "express";
import { requireUserId } from "../../middleware/auth";
import { sendSuccess } from "../../shared/api-response";
import { parseBody } from "../../shared/validation";
import { loginRequestSchema, registerRequestSchema } from "./auth.schemas";
import * as authService from "./auth.service";

export const register = async (req: Request, res: Response) => {
  const body = parseBody(req, registerRequestSchema);
  return sendSuccess(res, await authService.register(body), { status: 201 });
};

export const login = async (req: Request, res: Response) => {
  const body = parseBody(req, loginRequestSchema);
  return sendSuccess(res, await authService.login(body));
};

export const me = async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  return sendSuccess(res, await authService.getCurrentUser(userId));
};
