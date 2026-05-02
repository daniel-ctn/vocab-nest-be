import type { Request, Response } from "express";
import { requireUserId } from "../../middleware/auth";
import { sendSuccess } from "../../shared/api-response";
import { getUserProfile } from "./users.service";

export const me = async (req: Request, res: Response) => {
  return sendSuccess(res, await getUserProfile(requireUserId(req)));
};
