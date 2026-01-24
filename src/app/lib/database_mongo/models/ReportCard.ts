import mongoose, { Schema, Document } from "mongoose";

export interface IReportCard extends Document {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  idType: string;
  idDescription: string;
  fileDescription?: string;
  status: "lost" | "found";
  createdAt: Date;
  updatedAt: Date;
}

const ReportCardSchema: Schema = new Schema(
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
      enum: ["lost", "found"],
      default: "lost",
    },
  },
  {
    timestamps: true,
  },
);

// Create index for efficient queries by userId
ReportCardSchema.index({ userId: 1, createdAt: -1 });

export const ReportCard =
  mongoose.models.ReportCard ||
  mongoose.model<IReportCard>("ReportCard", ReportCardSchema);
