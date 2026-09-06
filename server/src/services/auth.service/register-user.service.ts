import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { config } from "../../config/environment";
import { ConflictError } from "../../errors/index";

export const registerUserService = async (email: string, password: string, name: string) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ConflictError("User already exists with this email");
  }

  // Create a user without a roleId and without an employeeId.
  // This user will appear in the "Join Requests" list for admins to approve and assign a role/employee record.
  const user = await User.create({
    email,
    password,
    name,
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
      role: null,
    },
    token,
  };
};
