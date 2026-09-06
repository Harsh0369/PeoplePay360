import { Role } from "../../models/role.model";
import { ConflictError, ForbiddenError } from "../../errors/index";

export const createRoleService = async (data: any, actorIsSuperAdmin = false) => {
  const { name, permissions, dataScope, isAdmin } = data;

  // Only the super admin may create admin (all-access) roles.
  if (isAdmin && !actorIsSuperAdmin) {
    throw new ForbiddenError("Only the super admin can create admin roles");
  }

  const existingRole = await Role.findOne({ name });
  if (existingRole) {
    throw new ConflictError("Role with this name already exists");
  }

  return await Role.create({
    name,
    permissions: permissions || {},
    dataScope: dataScope || "self",
    isAdmin: isAdmin || false,
  });
};
