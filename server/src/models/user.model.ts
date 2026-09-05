import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String, required: true, select: false },
    name: { type: String, trim: true, required: true },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    customPermissions: {
      type: Object,
      default: {},
    },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export type UserModel = InferSchemaType<typeof userSchema>;

export interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<UserModel, UserMethods>;

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const user = this as UserDocument & { password?: string };
  if (!user.password) return false;
  return await bcrypt.compare(candidatePassword, user.password);
};

export const User = mongoose.model<UserDocument>("User", userSchema);
