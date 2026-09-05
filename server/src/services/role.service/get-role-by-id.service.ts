import { Role } from "../../models/role.model";
import { NotFoundError } from "../../errors/index";

export const getRoleByIdService = async (id: string) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new NotFoundError("Role not found");
  }
  return role;
};
