import type { Request, Response } from "express";
import { requireUserId } from "../../middleware/auth";
import { sendSuccess } from "../../shared/api-response";
import { parseBody, parseParams } from "../../shared/validation";
import { groupCreateRequestSchema, groupUpdateRequestSchema, idParamsSchema } from "./groups.schemas";
import * as service from "./groups.service";

export const create = async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const body = parseBody(req, groupCreateRequestSchema);
  return sendSuccess(res, await service.createGroup(userId, body), { status: 201 });
};

export const list = async (req: Request, res: Response) => {
  return sendSuccess(res, await service.listGroups(requireUserId(req)));
};

export const getById = async (req: Request, res: Response) => {
  const { id } = parseParams(req, idParamsSchema);
  return sendSuccess(res, await service.getGroup(requireUserId(req), id));
};

export const patch = async (req: Request, res: Response) => {
  const { id } = parseParams(req, idParamsSchema);
  const body = parseBody(req, groupUpdateRequestSchema);
  return sendSuccess(res, await service.updateGroup(requireUserId(req), id, body));
};

export const remove = async (req: Request, res: Response) => {
  const { id } = parseParams(req, idParamsSchema);
  return sendSuccess(res, await service.deleteGroup(requireUserId(req), id));
};

export const vocabulary = async (req: Request, res: Response) => {
  const { id } = parseParams(req, idParamsSchema);
  return sendSuccess(res, await service.listGroupVocabulary(requireUserId(req), id));
};
