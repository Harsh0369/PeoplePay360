import { User } from "../../models/user.model";
import { Role } from "../../models/role.model";
import { NotFoundError } from "../../errors/index";

export const updateUserRoleService = async (userId: string, roleId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const role = await Role.findById(roleId);
  if (!role) {
    throw new NotFoundError("Role not found");
  }

  user.roleId = role._id;
  await user.save();

  return user;
};
