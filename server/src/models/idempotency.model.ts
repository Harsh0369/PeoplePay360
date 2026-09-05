import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const idempotencyRecordSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    requestPath: {
      type: String,
      required: true,
    },
    responseBody: {
      type: Schema.Types.Mixed,
    },
    statusCode: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "24h", // Automatically delete records after 24 hours
    },
  },
  {
    timestamps: false, // We only need createdAt for TTL
  }
);

export type IdempotencyRecordModel = InferSchemaType<typeof idempotencyRecordSchema>;
export type IdempotencyRecordDocument = HydratedDocument<IdempotencyRecordModel>;

export const IdempotencyRecord = mongoose.model<IdempotencyRecordDocument>(
  "IdempotencyRecord",
  idempotencyRecordSchema
);
