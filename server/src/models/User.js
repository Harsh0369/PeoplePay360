import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_LIST, ROLES } from './constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLE_LIST, default: ROLES.EMPLOYEE },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};
userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
userSchema.methods.toSafeJSON = function () {
  const { passwordHash, ...rest } = this.toObject();
  return rest;
};

export default mongoose.model('User', userSchema);
