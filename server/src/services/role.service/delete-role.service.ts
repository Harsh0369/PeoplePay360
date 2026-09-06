import { Role } from "../../models/role.model";
import { NotFoundError, ConflictError, ForbiddenError } from "../../errors/index";

export const deleteRoleService = async (id: string, actorIsSuperAdmin = false) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new NotFoundError("Role not found");
  }

  if (role.isAdmin && !actorIsSuperAdmin) {
    throw new ForbiddenError("Only the super admin can delete admin roles");
  }

  if (role.isSystem) {
    throw new ConflictError("Cannot delete system roles");
  }

  await role.deleteOne();
  return true;
};
