import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { unauthorized } from "../shared/errors";

type JwtPayload = {
  sub: string;
  email: string;
};

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
    issuer: "vocabnest-api",
    audience: "vocabnest",
  });

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    return next(unauthorized());
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "vocabnest-api",
      audience: "vocabnest",
    }) as JwtPayload;

    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch {
    return next(unauthorized("Invalid or expired access token."));
  }
};

export const requireUserId = (req: Request) => {
  if (!req.user?.id) {
    throw unauthorized();
  }
  return req.user.id;
};
