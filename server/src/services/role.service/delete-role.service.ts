import { Role } from "../../models/role.model";
import { NotFoundError, ConflictError } from "../../errors/index";

export const deleteRoleService = async (id: string) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new NotFoundError("Role not found");
  }
  
  if (role.isSystem) {
    throw new ConflictError("Cannot delete system roles");
  }

  await role.deleteOne();
  return true;
};
