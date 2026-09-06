import { Types } from "mongoose";
import { roleDataScopeEnum } from "../../constants/custom-data-type";
import { PermissionKey } from "../../constants/custom-data-type";
import { ForbiddenError, NotFoundError } from "../../errors/index";
import { Role } from "../../models/role.model";
import { User } from "../../models/user.model";
import {
  expandGroupedPermissionMap,
  flattenObject,
} from "../../utils/permission-grouping.util";

export type DataScope = (typeof roleDataScopeEnum)[number];

type PermissionMapLike =
  | Map<string, boolean>
  | Record<string, boolean>
  | null
  | undefined;

type ResolvedRole = {
  _id?: unknown;
  name: string;
  permissions?: PermissionMapLike;
  dataScope?: DataScope;
  isAdmin?: boolean;
};

export type ResolvedPermissionContext = {
  permissions: Set<string>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  dataScope: DataScope;
  roleId: string | null;
  roleName: string | null;
};

export class PermissionService {
  static async resolvePermissions(
    userId: string
  ): Promise<ResolvedPermissionContext> {
    const user = await User.findById(userId).populate("roleId");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.active) {
      throw new ForbiddenError("Account is not active");
    }

    const roleObj = user.roleId as any; // Populated role

    if (!roleObj) {
        throw new ForbiddenError("No role assigned");
    }

    const role = this.toResolvedRole(roleObj);

    const userCustomPermissions = (user as any).customPermissions as PermissionMapLike;
    
    // Flatten both to simple key-value records
    const flatRolePermissions = flattenObject(role?.permissions || {});
    const flatUserPermissions = flattenObject(userCustomPermissions || {});
    
    // Merge them, allowing user's custom permissions to override role's permissions
    const mergedPermissions = {
      ...flatRolePermissions,
      ...flatUserPermissions
    };

    const permissions = new Set<string>(
      this.extractEnabledPermissions(mergedPermissions)
    );

    // The super admin flag lives on the user, independent of role, and implies admin.
    const isSuperAdmin = Boolean((user as any).isSuperAdmin);
    const isAdmin = Boolean(role?.isAdmin) || isSuperAdmin;
    const dataScope: DataScope = isAdmin ? "all" : (role?.dataScope ?? "self");

    return {
      permissions,
      isAdmin,
      isSuperAdmin,
      dataScope,
      roleId: this.toStringId(role?._id),
      roleName: role?.name ?? null,
    };
  }

  static hasPermission(
    permissions: Set<string>,
    required: PermissionKey | string,
    isAdmin: boolean
  ): boolean {
    if (isAdmin) return true;
    if (permissions.has(required)) return true;

    if (required.endsWith(".Read")) {
      const writeVersion = required.replace(".Read", ".Write");
      if (permissions.has(writeVersion)) return true;
    }

    if (required.endsWith(".Approve")) {
      const writeVersion = required.replace(".Approve", ".Write");
      if (permissions.has(writeVersion)) return true;
    }

    return false;
  }

  static hasAnyPermission(
    permissions: Set<string>,
    requiredPermissions: Array<PermissionKey | string>,
    isAdmin: boolean
  ): boolean {
    return requiredPermissions.some((permission) =>
      this.hasPermission(permissions, permission, isAdmin)
    );
  }

  private static extractEnabledPermissions(
    source: PermissionMapLike
  ): string[] {
    if (!source) {
      return [];
    }

    const permissionRecord =
      source instanceof Map
        ? Array.from(source.entries()).reduce<Record<string, boolean>>(
            (acc, [permissionKey, isEnabled]) => {
              acc[permissionKey] = Boolean(isEnabled);
              return acc;
            },
            {}
          )
        : flattenObject(source);

    const expandedPermissions = expandGroupedPermissionMap(permissionRecord) ?? {};

    return Object.entries(expandedPermissions)
      .filter(([, isEnabled]) => Boolean(isEnabled))
      .map(([permission]) => permission);
  }

  private static toResolvedRole(role: any): ResolvedRole {
    return {
      _id: role._id,
      name: typeof role.name === "string" ? role.name : "",
      permissions: role.permissions as PermissionMapLike,
      dataScope: this.toDataScope(role.dataScope),
      isAdmin: Boolean(role.isAdmin),
    };
  }

  private static toDataScope(value: unknown): DataScope {
    const allowedScopes = roleDataScopeEnum as readonly string[];
    if (typeof value === "string" && allowedScopes.includes(value as any)) {
      return value as DataScope;
    }
    return "self";
  }

  private static toStringId(value: unknown): string | null {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (value instanceof Types.ObjectId) return value.toString();
    if (typeof value === "object" && "toString" in value) {
      const idValue = (value as any).toString();
      return idValue === "[object Object]" ? null : idValue;
    }
    return null;
  }
}
