import { Role } from "../../models/role.model";
import { ConflictError } from "../../errors/index";

export const createRoleService = async (data: any) => {
  const { name, permissions, dataScope, isAdmin } = data;

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
