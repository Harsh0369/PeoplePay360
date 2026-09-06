import { Role } from "../../models/role.model";
import { NotFoundError, ConflictError } from "../../errors/index";

export const updateRoleService = async (id: string, data: any) => {
  const { name, permissions, dataScope, isAdmin } = data;
  
  const role = await Role.findById(id);
  if (!role) {
    throw new NotFoundError("Role not found");
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
