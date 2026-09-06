import { Role } from "../../models/role.model";
import { NotFoundError, ConflictError, ForbiddenError } from "../../errors/index";

export const updateRoleService = async (id: string, data: any, actorIsSuperAdmin = false) => {
  const { name, permissions, dataScope, isAdmin } = data;

  const role = await Role.findById(id);
  if (!role) {
    throw new NotFoundError("Role not found");
  }

  // Editing an existing admin role, or promoting a role to admin, is super-admin-only.
  if ((role.isAdmin || isAdmin === true) && !actorIsSuperAdmin) {
    throw new ForbiddenError("Only the super admin can modify admin roles");
  }

  if (role.isSystem) {
    if (name && name !== role.name) {
      throw new ConflictError("Cannot rename system roles");
    }
    if (isAdmin !== undefined && isAdmin !== role.isAdmin) {
      throw new ConflictError("Cannot change admin status of system roles");
    }
  } else {
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        throw new ConflictError("Role with this name already exists");
      }
      role.name = name;
    }
    if (isAdmin !== undefined) role.isAdmin = isAdmin;
  }

  if (permissions !== undefined) role.permissions = permissions;
  if (dataScope !== undefined) role.dataScope = dataScope;

  await role.save();
  return role;
};
