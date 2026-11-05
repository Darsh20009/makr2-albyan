import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  goalAmount: number;
  currentAmount: number;
  startDate?: Date;
  endDate?: Date;
  status: "active" | "completed" | "draft" | "paused";
  image?: string;
  subtitle?: string;
  color?: string;
  badge?: string;
  badgeColor?: string;
  sortOrder?: number;
  isActive?: boolean;
  isPublic?: boolean;
  associationName?: string;
  licenseNumber?: string;
  tiers?: { label: string; amount: string }[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true },
    titleAr: { type: String },
    description: { type: String },
    descriptionAr: { type: String },
    goalAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "completed", "draft", "paused"],
      default: "draft",
    },
    image: { type: String },
    subtitle: { type: String },
    color: { type: String },
    badge: { type: String },
    badgeColor: { type: String },
    sortOrder: { type: Number },
    isActive: { type: Boolean },
    isPublic: { type: Boolean, default: false },
    associationName: { type: String },
    licenseNumber: { type: String },
    tiers: { type: [{ label: String, amount: String }] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CampaignSchema.index({ status: 1 });
CampaignSchema.index({ createdAt: -1 });

export const CampaignModel = mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
