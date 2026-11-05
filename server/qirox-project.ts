const QIROX_PROJECT_ID = "6ae609c83c75b136420026a0";
const QIROX_PROJECT_API_BASE = `https://qiroxstudio.online/api/v1/projects/${QIROX_PROJECT_ID}`;

export class QiroxProjectError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "QiroxProjectError";
  }
}

export function isQiroxWhatsAppConfigured(): boolean {
  return Boolean(process.env.QIROX_PROJECT_WHATSAPP_KEY_PRODUCTION);
}

export function isQiroxProjectApiConfigured(): boolean {
  return Boolean(process.env.QIROX_PROJECT_API_KEY_PRODUCTION);
}

export function normalizeSaudiMobile(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00966")) digits = digits.slice(5);
  else if (digits.startsWith("966")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return /^5\d{8}$/.test(digits) ? `+966${digits}` : null;
}

export function normalizeWhatsAppPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("966")) return digits.length === 12 ? `+${digits}` : null;
  if (digits.length === 10 && digits.startsWith("05")) return `+966${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("5")) return `+966${digits}`;
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

async function postProjectMessage(
  endpoint: "whatsapp" | "api",
  apiKey: string | undefined,
  idempotencyKey: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (!apiKey) {
    throw new QiroxProjectError("QIROX messaging is not configured.", 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${QIROX_PROJECT_API_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new QiroxProjectError(`QIROX request failed (${response.status}).`, 502);
    }

    const result = await response.json().catch(() => ({}));
    return result && typeof result === "object" ? result as Record<string, unknown> : {};
  } catch (error) {
    if (error instanceof QiroxProjectError) throw error;
    throw new QiroxProjectError("QIROX messaging is temporarily unavailable.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendQiroxLoginCode(input: {
  phone: string;
  name: string;
  code: string;
  challengeId: string;
}): Promise<void> {
  const phone = normalizeSaudiMobile(input.phone);
  if (!phone) throw new QiroxProjectError("Invalid Saudi mobile number.", 400);

  await postProjectMessage(
    "whatsapp",
    process.env.QIROX_PROJECT_WHATSAPP_KEY_PRODUCTION,
    `login-${input.challengeId}`,
    {
      recipient: { phone, name: input.name || "مستخدم" },
      platformName: "مقارئ البيان",
      clientName: "تسجيل الدخول",
      code: input.code,
      message: `رمز الدخول إلى جمعية مقارئ البيان هو ${input.code}. صالح لمدة 5 دقائق ولا تشاركه مع أحد.`,
    },
  );
}

export async function sendQiroxInvoiceSummary(input: {
  phone: string;
  name: string;
  invoiceNumber: string;
  amount: number;
  type?: string;
  idempotencyKey: string;
}): Promise<void> {
  const phone = normalizeWhatsAppPhone(input.phone);
  if (!phone) throw new QiroxProjectError("Invalid recipient phone number.", 400);

  const typeLabels: Record<string, string> = {
    general: "مساهمة عامة",
    zakat: "زكاة",
    waqf: "وقف",
    water: "سقيا الماء",
    food: "إطعام",
    iftar: "إفطار صائم",
    "ramadan-basket": "سلة رمضانية",
    "special-cases": "حالات خاصة",
  };
  const typeLabel = typeLabels[input.type || ""] || "مساهمة";
  const amount = Number(input.amount).toLocaleString("ar-SA");
  const message = [
    "تم تأكيد مساهمتك لدى جمعية مقارئ البيان لتعليم القرآن الكريم.",
    `رقم الفاتورة: ${input.invoiceNumber}`,
    `المبلغ: ${amount} ريال سعودي`,
    `البرنامج: ${typeLabel}`,
    "ملخص الفاتورة محفوظ في حسابك على الموقع.",
  ].join("\n");

  await postProjectMessage(
    "api",
    process.env.QIROX_PROJECT_API_KEY_PRODUCTION,
    input.idempotencyKey,
    {
      channel: "whatsapp",
      recipient: { phone, name: input.name || "مساهم كريم" },
      message,
    },
  );
}
