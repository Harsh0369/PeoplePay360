import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { config } from "../../config/environment";
import { UnauthorizedError } from "../../errors/index";

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password").populate("roleId");

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.active) {
    throw new UnauthorizedError("Account is inactive");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });

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
      role: user.roleId,
    },
    token,
  };
};
