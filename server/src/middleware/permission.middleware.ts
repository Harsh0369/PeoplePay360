import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.type";
import {
  PermissionService,
  DataScope,
  ResolvedPermissionContext,
} from "../services/permission.service";
import { AppError, ForbiddenError, UnauthorizedError } from "../errors/index";

const attachPermissionContext = (
  req: AuthRequest,
  context: ResolvedPermissionContext,
) => {
  req.userPermissions = context.permissions;
  req.isAdmin = context.isAdmin;
  req.dataScope = context.dataScope;
  req.roleId = context.roleId;
  req.roleName = context.roleName;
};

const handlePermissionMiddlewareError = (
  error: unknown,
  next: NextFunction,
) => {
  if (error instanceof AppError) {
    return next(error);
  }
  return next(new UnauthorizedError("Permission resolution failed"));
};

export const requirePermission = (...requiredPermissions: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        throw new UnauthorizedError("User ID missing from request");
      }

      const context = await PermissionService.resolvePermissions(req.userId);
      attachPermissionContext(req, context);

      if (requiredPermissions.length === 0) {
        return next();
      }

      const missingPermissions = requiredPermissions.filter(
        (permission) =>
          !PermissionService.hasPermission(
            context.permissions,
            permission,
            context.isAdmin,
          ),
      );

      if (missingPermissions.length > 0) {
        return next(
          new ForbiddenError(
            `Missing permissions: ${missingPermissions.join(", ")}`,
          ),
        );
      }

      return next();
    } catch (error) {
      return handlePermissionMiddlewareError(error, next);
    }
  };
};

export const requireAnyPermission = (...requiredPermissions: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        throw new UnauthorizedError("User ID missing from request");
      }

      const context = await PermissionService.resolvePermissions(req.userId);
      attachPermissionContext(req, context);

      if (requiredPermissions.length === 0) {
        return next();
      }

      const hasAnyRequiredPermission = PermissionService.hasAnyPermission(
        context.permissions,
        requiredPermissions,
        context.isAdmin,
      );

      if (!hasAnyRequiredPermission) {
        return next(new ForbiddenError("Insufficient permissions"));
      }

      return next();
    } catch (error) {
      return handlePermissionMiddlewareError(error, next);
    }
  };
};
