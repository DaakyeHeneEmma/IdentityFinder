import mongoose, { Schema, Document } from "mongoose";

export interface IFoundCard extends Document {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  idType: string;
  idDescription: string;
  fileDescription?: string;
  status: "found" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const FoundCardSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    idType: {
      type: String,
      required: true,
      trim: true,
    },
    idDescription: {
      type: String,
      required: true,
      trim: true,
    },
    fileDescription: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["found", "resolved"],
      default: "found",
    },
  },
  {
    timestamps: true,
  },
);

FoundCardSchema.index({ userId: 1, createdAt: -1 });

export const FoundCard =
  mongoose.models.FoundCard ||
  mongoose.model<IFoundCard>("FoundCard", FoundCardSchema);
