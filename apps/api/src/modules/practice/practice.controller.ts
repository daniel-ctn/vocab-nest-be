import type { Request, Response } from "express";
import { requireUserId } from "../../middleware/auth";
import { sendSuccess } from "../../shared/api-response";
import { parseBody, parseParams } from "../../shared/validation";
import { idParamsSchema, reviewParamsSchema, reviewPracticeItemRequestSchema } from "./practice.schemas";
import * as service from "./practice.service";

export const today = async (req: Request, res: Response) => {
  return sendSuccess(res, await service.getOrCreateTodayPractice(requireUserId(req)));
};

export const reviewItem = async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { id, itemId } = parseParams(req, reviewParamsSchema);
  const body = parseBody(req, reviewPracticeItemRequestSchema);
  return sendSuccess(res, await service.reviewPracticeItem(userId, id, itemId, body.rating));
};

export const complete = async (req: Request, res: Response) => {
  const { id } = parseParams(req, idParamsSchema);
  return sendSuccess(res, await service.completePractice(requireUserId(req), id));
};
