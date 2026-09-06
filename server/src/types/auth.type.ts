import { Request } from "express";
import { DataScope } from "../services/permission.service";

export interface AuthRequest extends Request {
  userId?: string;
  userPermissions?: Set<string>;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  dataScope?: DataScope;
  roleId?: string | null;
  roleName?: string | null;
}
