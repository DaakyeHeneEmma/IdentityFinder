import mongoose, { Schema, Document } from "mongoose";

export interface IChatMatch extends Document {
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  matchedUserId: string;
  matchedUserName: string;
  matchedUserEmail: string;
  reportId: string;
  reportType: "lost" | "found";
  idType: string;
  description: string;
  status: "pending" | "contacted" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ChatMatchSchema: Schema = new Schema(
  {
    reporterId: {
      type: String,
      required: true,
      index: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    matchedUserId: {
      type: String,
      required: true,
    },
    matchedUserName: {
      type: String,
      required: true,
    },
    matchedUserEmail: {
      type: String,
      required: true,
    },
    reportId: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    idType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

ChatMatchSchema.index({ reporterId: 1, status: 1 });
ChatMatchSchema.index({ matchedUserId: 1, status: 1 });
ChatMatchSchema.index({ idType: 1, reportType: 1 });

export const ChatMatch = mongoose.models.ChatMatch || mongoose.model<IChatMatch>("ChatMatch", ChatMatchSchema);
