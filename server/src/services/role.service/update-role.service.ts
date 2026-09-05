import { Role } from "../../models/role.model";
import { NotFoundError, ConflictError } from "../../errors/index";

export const updateRoleService = async (id: string, data: any) => {
  const { name, permissions, dataScope, isAdmin } = data;
  
  const role = await Role.findById(id);
  if (!role) {
    throw new NotFoundError("Role not found");
  }

  if (role.isSystem) {
    throw new ConflictError("Cannot modify system roles directly");
  }

  if (name && name !== role.name) {
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      throw new ConflictError("Role with this name already exists");
    }
    role.name = name;
  }

  if (permissions !== undefined) role.permissions = permissions;
  if (dataScope !== undefined) role.dataScope = dataScope;
  if (isAdmin !== undefined) role.isAdmin = isAdmin;

  await role.save();
  return role;
};
