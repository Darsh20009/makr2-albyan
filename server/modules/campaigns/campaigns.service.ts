import { CampaignModel, ICampaign } from "./campaigns.model";
import { InsertCampaign } from "@shared/schema";
import { NotFoundError } from "../../core/errors";

const ALBAYAN_CAMPAIGN_FILTER = {
  associationName: "جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية",
  licenseNumber: "1000863300",
  isPublic: true,
  $or: [
    { isActive: true, status: { $exists: false } },
    { isActive: true, status: "active" },
    { isActive: { $exists: false }, status: "active" },
  ],
};

export class CampaignsService {
  async getCampaigns(filter: any = {}): Promise<ICampaign[]> {
    return await CampaignModel.find({ ...filter, ...ALBAYAN_CAMPAIGN_FILTER }).sort({ createdAt: -1 });
  }

  async getActiveCampaigns(): Promise<ICampaign[]> {
    return await CampaignModel.find(ALBAYAN_CAMPAIGN_FILTER).sort({ createdAt: -1 });
  }

  async getCampaignById(id: string): Promise<ICampaign> {
    const campaign = await CampaignModel.findOne({ _id: id, ...ALBAYAN_CAMPAIGN_FILTER });
    if (!campaign) {
      throw new NotFoundError("الحملة");
    }
    return campaign;
  }

  async createCampaign(data: InsertCampaign, userId: string): Promise<ICampaign> {
    const campaign = new CampaignModel({
      ...data,
      associationName: ALBAYAN_CAMPAIGN_FILTER.associationName,
      licenseNumber: ALBAYAN_CAMPAIGN_FILTER.licenseNumber,
      isPublic: data.isPublic === true,
      createdBy: userId,
    });
    return await campaign.save();
  }

  async updateCampaign(id: string, data: Partial<InsertCampaign>): Promise<ICampaign> {
    const campaign = await CampaignModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!campaign) {
      throw new NotFoundError("الحملة");
    }
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    const result = await CampaignModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError("الحملة");
    }
  }

  async updateProgress(id: string, amount: number): Promise<ICampaign> {
    const campaign = await CampaignModel.findByIdAndUpdate(
      id,
      { $inc: { currentAmount: amount } },
      { new: true }
    );
    if (!campaign) {
      throw new NotFoundError("الحملة");
    }
    
    // Check if goal reached
    if (campaign.currentAmount >= campaign.goalAmount && campaign.status === "active") {
      campaign.status = "completed";
      await campaign.save();
    }
    
    return campaign;
  }
}

export const campaignsService = new CampaignsService();

export async function ensureSirajaCampaign(): Promise<void> {
  const associationName = "جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية";
  const licenseNumber = "1000863300";
  const titleAr = "تطبيق سراجا لتحفيظ القرآن";

  const result = await CampaignModel.updateOne(
    { titleAr, associationName, licenseNumber },
    {
      $setOnInsert: {
        title: titleAr,
        titleAr,
        description: "تطوير تطبيق سراجا لتحفيظ القرآن الكريم.",
        descriptionAr: "مشروع لتطوير تطبيق سراجا لتحفيظ القرآن الكريم.",
        goalAmount: 250000,
        currentAmount: 0,
        status: "active",
        image: "/images/siraja-logo.png",
        sortOrder: 1,
        isActive: true,
        isPublic: true,
        associationName,
        licenseNumber,
      },
    },
    { upsert: true },
  );

  if (result.upsertedCount > 0) {
    console.info("[Campaigns] Published the Al-Bayan Siraja Quran memorization project.");
  }
}
