import { User } from "../../models/user.model";
import { Role } from "../../models/role.model";
import { NotFoundError, ConflictError } from "../../errors/index";

export const updateUserRoleService = async (userId: string, roleId?: string, customPermissions?: any) => {
  const user = await User.findById(userId).populate("roleId");
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (roleId) {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    user.roleId = role._id;
  }

  if (customPermissions !== undefined) {
    const roleObj = user.roleId as any;
    if (roleObj && roleObj.isAdmin) {
      throw new ConflictError("Cannot set custom permissions on Admin users");
    }
    user.customPermissions = customPermissions;
  }

  await user.save();
  return user;
};
