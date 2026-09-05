import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";
import { roleDataScopeEnum } from "../constants/custom-data-type";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },
    permissions: {
      type: Object,
      default: {},
    },
    dataScope: {
      type: String,
      enum: roleDataScopeEnum,
      required: true,
      default: "self",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export type RoleModel = InferSchemaType<typeof roleSchema>;
export type RoleDocument = HydratedDocument<RoleModel>;

export const Role = mongoose.model<RoleDocument>("Role", roleSchema);
