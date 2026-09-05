import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const businessLogSchema = new Schema(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // The user performing the action (e.g. HR Admin)
      index: true,
    },
    affectedEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: false, // The employee whose record was altered (if applicable)
      index: true,
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "OVERRIDE", "APPROVE", "REJECT"],
      required: true,
    },
    entity: {
      type: String,
      enum: ["ATTENDANCE", "EMPLOYEE", "LEAVE", "CONTRACT", "PAYROLL"],
      required: true,
    },
    content: {
      type: String,
      required: true, // A human-readable description of what happened
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false, // Useful for storing { oldValues: {}, newValues: {} } for audit diffs
    }
  },
  {
    timestamps: true, // createdAt will act as the exact timestamp of the event
  }
);

// Indexes for fast auditing searches
businessLogSchema.index({ affectedEmployeeId: 1, entity: 1, createdAt: -1 });

export type BusinessLogModel = InferSchemaType<typeof businessLogSchema>;
export type BusinessLogDocument = HydratedDocument<BusinessLogModel>;

export const BusinessLog = mongoose.model<BusinessLogDocument>(
  "BusinessLog",
  businessLogSchema
);
