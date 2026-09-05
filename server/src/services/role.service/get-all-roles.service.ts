import { Role } from "../../models/role.model";

export const getAllRolesService = async () => {
  return await Role.find().sort({ name: 1 });
};
