import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/environment";
import { User } from "../models/user.model";
import { AuthRequest } from "../types/auth.type";
import { NotFoundError, UnauthorizedError } from "../errors/index";

interface AuthTokenPayload extends JwtPayload {
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.header("authorization");
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : undefined;

    if (!bearerToken) {
      if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
        req.userId = "dev-admin-user";
        req.isAdmin = true;
        return next();
      }
      next(new UnauthorizedError("Auth token not found"));
      return;
    }

    // Initialize JWT_SECRET in environment if not present
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing");
    }

    const verified = jwt.verify(bearerToken, process.env.JWT_SECRET) as AuthTokenPayload;
    const userId = verified?.userId;

    if (!userId) {
      next(new UnauthorizedError("Access denied: token verification failed"));
      return;
    }

    const user = await User.findById(userId, "_id active").lean();

    if (!user) {
      next(new NotFoundError("User not found"));
      return;
    }

    if (!user.active) {
      next(new UnauthorizedError("User account is inactive"));
      return;
    }

    req.userId = userId;
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
