import type { Request } from "express";
import type { z } from "zod";

export const parseBody = <TSchema extends z.ZodTypeAny>(req: Request, schema: TSchema) =>
  schema.parse(req.body) as z.infer<TSchema>;

export const parseQuery = <TSchema extends z.ZodTypeAny>(req: Request, schema: TSchema) =>
  schema.parse(req.query) as z.infer<TSchema>;

export const parseParams = <TSchema extends z.ZodTypeAny>(req: Request, schema: TSchema) =>
  schema.parse(req.params) as z.infer<TSchema>;
