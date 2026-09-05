import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { Role } from "../../models/role.model";
import { config } from "../../config/environment";
import { ConflictError } from "../../errors/index";

export const registerInitialAdminService = async (email: string, password: string, name: string) => {
  const count = await User.countDocuments();
  if (count > 0) {
    throw new ConflictError("Initial setup already completed. Use regular user creation endpoints.");
  }

  let adminRole = await Role.findOne({ name: "Super Admin" });
  if (!adminRole) {
    adminRole = await Role.create({
      name: "Super Admin",
      isAdmin: true,
      dataScope: "all",
      isSystem: true,
      permissions: {},
    });
  }

  const user = await User.create({
    email,
    password,
    name,
    roleId: adminRole._id,
    active: true,
  });

  const token = jwt.sign(
    { userId: user._id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] }
  );

  return {
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: adminRole,
    },
    token,
  };
};
