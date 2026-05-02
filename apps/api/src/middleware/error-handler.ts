import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../shared/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  void next;
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: err.flatten(),
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  const details = env.NODE_ENV === "production" ? undefined : { message: err?.message };
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong.",
      ...(details ? { details } : {}),
    },
  });
};
