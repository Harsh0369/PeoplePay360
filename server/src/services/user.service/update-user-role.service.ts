import { User } from "../../models/user.model";
import { Role } from "../../models/role.model";
import { NotFoundError, ConflictError, ForbiddenError } from "../../errors/index";

export const updateUserRoleService = async (
  userId: string,
  roleId?: string,
  customPermissions?: any,
  actorIsSuperAdmin = false,
) => {
  const user = await User.findById(userId).populate("roleId");
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const currentRole = user.roleId as any; // populated role before any reassignment

  // The super admin account is off-limits to everyone but the super admin.
  if ((user as any).isSuperAdmin && !actorIsSuperAdmin) {
    throw new ForbiddenError("Only the super admin can modify the super admin account");
  }

  if (roleId) {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    // Promoting a user into an admin role, or demoting an existing admin to a
    // non-admin role, is reserved for the super admin — admins cannot do this
    // amongst themselves.
    const promotingToAdmin = !!role.isAdmin;
    const demotingFromAdmin = !!(currentRole && currentRole.isAdmin) && !role.isAdmin;
    if ((promotingToAdmin || demotingFromAdmin) && !actorIsSuperAdmin) {
      throw new ForbiddenError(
        promotingToAdmin
          ? "Only the super admin can promote a user to an admin role"
          : "Only the super admin can change an admin's role",
      );
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
