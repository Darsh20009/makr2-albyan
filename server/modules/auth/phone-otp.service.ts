import { createHmac, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { db, usersCollection } from "../../db";
import { storage } from "../../storage";
import {
  isQiroxWhatsAppConfigured,
  normalizeSaudiMobile,
  sendQiroxLoginCode,
} from "../../qirox-project";

const challenges = db.collection("phone_login_challenges");
const CODE_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_CODES_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

export class PhoneOtpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "PhoneOtpError";
  }
}

function digestCode(challengeId: string, code: string): Buffer {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new PhoneOtpError("خدمة تسجيل الدخول غير مهيأة.", 503);
  }
  return createHmac("sha256", sessionSecret).update(`${challengeId}:${code}`).digest();
}

function codeMatches(expectedHex: string, challengeId: string, code: string): boolean {
  try {
    const expected = Buffer.from(expectedHex, "hex");
    const supplied = digestCode(challengeId, code);
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  } catch {
    return false;
  }
}

async function findUsersForPhone(phone: string): Promise<any[]> {
  const candidates = await usersCollection
    .find({
      $or: [
        { mobile: { $type: "string", $ne: "" } },
        { phone: { $type: "string", $ne: "" } },
      ],
    })
    .project({ _id: 1, mobile: 1, phone: 1, status: 1 })
    .toArray();

  const matches = new Map<string, any>();
  for (const candidate of candidates) {
    const matchesPhone = [candidate.mobile, candidate.phone].some(
      (value) => normalizeSaudiMobile(value) === phone,
    );
    if (matchesPhone) matches.set(String(candidate._id), candidate);
  }

  return Array.from(matches.values());
}

export async function requestPhoneLoginCode(
  rawPhone: unknown,
  rawName?: unknown,
): Promise<{ challengeId: string }> {
  const phone = normalizeSaudiMobile(rawPhone);
  if (!phone) throw new PhoneOtpError("أدخل رقم جوال سعودي صحيحاً.", 400);
  const registrationName =
    typeof rawName === "string" ? rawName.trim().replace(/\s+/g, " ") : "";
  if (rawName !== undefined && (registrationName.length < 2 || registrationName.length > 100)) {
    throw new PhoneOtpError("أدخل الاسم كاملاً (من حرفين إلى 100 حرف).", 400);
  }
  if (!isQiroxWhatsAppConfigured()) {
    throw new PhoneOtpError("تسجيل الدخول عبر واتساب غير مهيأ حالياً.", 503);
  }

  const now = new Date();
  const recentStart = new Date(now.getTime() - 60 * 60 * 1000);
  await challenges.deleteMany({ expiresAt: { $lte: new Date(now.getTime() - 60 * 60 * 1000) } });

  const recentCount = await challenges.countDocuments({
    phone,
    createdAt: { $gte: recentStart },
  });
  if (recentCount >= MAX_CODES_PER_HOUR) {
    throw new PhoneOtpError("تم تجاوز عدد الرموز المسموح به. حاول لاحقاً.", 429);
  }
  const mostRecent = await challenges.findOne({
    phone,
    createdAt: { $gte: new Date(now.getTime() - RESEND_COOLDOWN_MS) },
  });
  if (mostRecent) {
    throw new PhoneOtpError("انتظر دقيقة قبل طلب رمز جديد.", 429);
  }

  const challengeId = randomUUID();
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const matches = await findUsersForPhone(phone);
  const matchedRecord = matches.length === 1 ? matches[0] : null;
  const user =
    matchedRecord && (!matchedRecord.status || matchedRecord.status === "active")
      ? await storage.getUser(String(matchedRecord._id))
      : null;
  const challenge = {
    challengeId,
    phone,
    userId: user?.id ? String(user.id) : null,
    registrationName: registrationName || null,
    phoneConflict: matches.length > 1 || (matches.length === 1 && !user),
    codeHash: digestCode(challengeId, code).toString("hex"),
    createdAt: now,
    expiresAt: new Date(now.getTime() + CODE_TTL_MS),
    attempts: 0,
    usedAt: null,
  };

  await challenges.insertOne(challenge);
  if (user || (registrationName && matches.length === 0)) {
    try {
      await sendQiroxLoginCode({
        phone,
        name: user?.name || registrationName || "مستخدم",
        code,
        challengeId,
      })
      await challenges.updateOne({ challengeId }, { $set: { deliveryStatus: "sent" } });
    } catch {
      await challenges.updateOne(
        { challengeId },
        { $set: { deliveryStatus: "failed", expiresAt: new Date() } },
      );
      throw new PhoneOtpError("تعذر إرسال الرمز إلى واتساب حالياً. حاول لاحقاً.", 503);
    }
  }

  return { challengeId };
}

export async function verifyPhoneLoginCode(challengeId: unknown, rawCode: unknown): Promise<any | null> {
  if (
    typeof challengeId !== "string" ||
    challengeId.length > 64 ||
    typeof rawCode !== "string" ||
    !/^\d{6}$/.test(rawCode)
  ) {
    throw new PhoneOtpError("الرمز غير صالح أو انتهت صلاحيته.", 400);
  }

  const challenge = await challenges.findOne({ challengeId });
  const now = new Date();
  if (
    !challenge ||
    challenge.usedAt ||
    challenge.expiresAt <= now ||
    challenge.attempts >= MAX_VERIFY_ATTEMPTS
  ) {
    throw new PhoneOtpError("الرمز غير صالح أو انتهت صلاحيته.", 400);
  }

  if (!codeMatches(challenge.codeHash, challengeId, rawCode)) {
    await challenges.updateOne(
      {
        challengeId,
        usedAt: null,
        expiresAt: { $gt: now },
        attempts: { $lt: MAX_VERIFY_ATTEMPTS },
      },
      { $inc: { attempts: 1 } },
    );
    throw new PhoneOtpError("الرمز غير صالح أو انتهت صلاحيته.", 400);
  }

  const consumed = await challenges.updateOne(
    {
      challengeId,
      usedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: MAX_VERIFY_ATTEMPTS },
    },
    { $set: { usedAt: now } },
  );
  if (consumed.modifiedCount !== 1) {
    throw new PhoneOtpError("الرمز غير صالح أو انتهت صلاحيته.", 400);
  }

  if (challenge.phoneConflict) {
    throw new PhoneOtpError("تعذر ربط هذا الرقم بحساب واحد. تواصل مع إدارة الجمعية لتحديثه.", 409);
  }

  if (challenge.userId) {
    const user = await storage.getUser(String(challenge.userId));
    const currentPhones = [user?.mobile, user?.phone].map(normalizeSaudiMobile);
    if (
      !user ||
      (user.status && user.status !== "active") ||
      !currentPhones.includes(challenge.phone)
    ) {
      throw new PhoneOtpError("تعذر تسجيل الدخول بهذا الرقم.", 401);
    }
    return user;
  }

  if (!challenge.registrationName) {
    throw new PhoneOtpError("لم نعثر على حساب مرتبط بهذا الرقم. أنشئ حساباً جديداً أولاً.", 401);
  }

  const currentMatches = await findUsersForPhone(challenge.phone);
  if (currentMatches.length > 1) {
    throw new PhoneOtpError("تعذر ربط هذا الرقم بحساب واحد. تواصل مع إدارة الجمعية لتحديثه.", 409);
  }
  if (currentMatches.length === 1) {
    const existingUser = currentMatches[0];
    if (existingUser.status && existingUser.status !== "active") {
      throw new PhoneOtpError("هذا الحساب غير نشط. تواصل مع إدارة الجمعية.", 403);
    }
    return storage.getUser(String(existingUser._id));
  }

  const user = await storage.createUser({
    name: String(challenge.registrationName),
    mobile: challenge.phone.replace(/^\+966/, ""),
    role: "user",
    status: "active",
    isPublicDonor: true,
    verifiedFlag: true,
    totalDonations: 0,
    points: 0,
    donationCount: 0,
    level: "bronze",
    badges: [],
    webauthnCredentials: [],
  });
  return user;
}
