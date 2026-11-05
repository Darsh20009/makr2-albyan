import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  CreditCard,
  Heart,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useSEO } from "@/hooks/use-seo";
import { useDonations } from "@/hooks/use-donations";
import { albayanAssociation } from "@/lib/albayan-donation-facts";
import "./DonationHome.css";
import "./DonationFlow.css";

type PaymentMethod = "rajhi" | "bank_transfer";
type DonationCampaign = {
  id?: string;
  _id?: string;
  title?: string;
  titleAr?: string;
  descriptionAr?: string;
  image?: string;
  goalAmount?: number;
  currentAmount?: number;
  status?: string;
  isActive?: boolean;
  isPublic?: boolean;
};
type DonationSettings = {
  donationChannelsApproved?: boolean;
  enableRajhiPayment?: boolean;
  enableBankTransfer?: boolean;
};

const STEPS = ["المبلغ", "البيانات", "الدفع", "التأكيد"];
const PRESET_AMOUNTS = [500, 300, 200, 100, 50];
const DONATION_TYPES: Record<string, string> = {
  general: "صدقة عامة",
  zakat: "زكاة",
  waqf: "صدقة جارية",
  water: "سقيا الماء",
  "ramadan-basket": "سلة رمضانية",
  iftar: "إفطار صائم",
  food: "إطعام",
  "special-cases": "حالات خاصة",
};

function readSearchParams() {
  return new URLSearchParams(window.location.search);
}

export default function Donate() {
  const [location, setLocation] = useLocation();
  const searchParams = useMemo(() => readSearchParams(), [location]);
  const campaignId = searchParams.get("campaignId") || "";
  const rawType = searchParams.get("type") || "general";
  const initialAmount = Number(searchParams.get("amount"));
  const baseType = rawType === "waqf" ? "general" : (DONATION_TYPES[rawType] ? rawType : "general");
  const [step, setStep] = useState(1);
  const [amountText, setAmountText] = useState(() =>
    Number.isFinite(initialAmount) && initialAmount > 0 && initialAmount <= 1_000_000
      ? String(Math.round(initialAmount))
      : "100",
  );
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [ongoingSadaqa, setOngoingSadaqa] = useState(rawType === "waqf");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("");
  const [formError, setFormError] = useState("");
  const { donate, isDonating } = useDonations();

  useSEO({
    title: "خطوات التبرع | مقارئ البيان",
    description: "اختر مبلغ مساهمتك واتبع خطوات التبرع لبرامج جمعية مقارئ البيان.",
    image: "/images/albayan-official-logo.png",
  });

  const { data: campaigns = [], isLoading: campaignsLoading, isError: campaignsError } = useQuery<DonationCampaign[]>({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) throw new Error("تعذر تحميل البرامج");
      const body = await response.json();
      return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
    },
    retry: false,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<DonationSettings>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("تعذر التحقق من قنوات الدفع");
      return response.json();
    },
    retry: false,
  });

  const campaign = campaignId
    ? campaigns.find((item) => String(item.id || item._id || "") === campaignId)
    : undefined;
  const campaignUnavailable = Boolean(campaignId && !campaignsLoading && (campaignsError || !campaign));
  const amount = Number(amountText);
  const amountValid = Number.isFinite(amount) && amount > 0 && amount <= 1_000_000;
  const donationApproved = settings?.donationChannelsApproved === true;
  const availableMethods = useMemo<PaymentMethod[]>(() => {
    if (!donationApproved) return [];
    return [
      ...(settings?.enableRajhiPayment ? ["rajhi" as const] : []),
      ...(settings?.enableBankTransfer ? ["bank_transfer" as const] : []),
    ];
  }, [donationApproved, settings?.enableRajhiPayment, settings?.enableBankTransfer]);
  const donationReady = !settingsLoading && availableMethods.length > 0;
  const effectiveMethod = availableMethods.includes(selectedMethod as PaymentMethod)
    ? selectedMethod as PaymentMethod
    : availableMethods[0] || "";
  const donationType = ongoingSadaqa ? "waqf" : baseType;
  const campaignName = campaign?.titleAr || campaign?.title || "مساهمة عامة";
  const campaignSummary = campaign?.descriptionAr || "ساهم في دعم تعليم القرآن الكريم ونشره.";
  const campaignImage = campaign?.image || "/images/albayan-mark.svg";
  const campaignDonationId = campaign?.id || campaign?._id;

  useEffect(() => {
    if (effectiveMethod && selectedMethod !== effectiveMethod) {
      setSelectedMethod(effectiveMethod);
    }
  }, [effectiveMethod, selectedMethod]);

  const goToDetails = () => {
    setFormError("");
    if (!amountValid) {
      setFormError("أدخل مبلغاً صحيحاً لا يتجاوز مليون ريال.");
      return;
    }
    if (campaignUnavailable) {
      setFormError("هذا المشروع غير متاح للتبرع حالياً.");
      return;
    }
    setStep(2);
  };

  const goToPayment = () => {
    setFormError("");
    if (!anonymous && donorName.trim().length < 2) {
      setFormError("أدخل اسم المتبرع أو اختر التبرع دون إظهار الاسم.");
      return;
    }
    setStep(3);
  };

  const submitDonation = async () => {
    if (!donationReady || !effectiveMethod || !amountValid) {
      setStep(3);
      return;
    }
    setFormError("");
    try {
      const result = await donate({
        amount,
        currency: "SAR",
        status: "pending",
        paymentStatus: "pending",
        isDeleted: false,
        pointsEarned: 0,
        type: donationType,
        paymentMethod: effectiveMethod,
        gateway: effectiveMethod,
        donorName: anonymous ? "فاعل خير" : donorName.trim(),
        donorEmail: donorEmail.trim() || undefined,
        donorPhone: donorPhone.trim() || undefined,
        ...(campaignDonationId ? { campaignId: String(campaignDonationId) } : {}),
      });
      if (result?.redirectUrl) return;
      if (result?.donationId) {
        setLocation(`/payment-result?id=${encodeURIComponent(String(result.donationId))}`);
        return;
      }
      setFormError("لم يصل رقم للعملية. لم نعرض التبرع على أنه مكتمل.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "تعذر بدء التبرع، حاول لاحقاً.");
    }
  };

  const paymentUnavailableMessage = settingsLoading
    ? "جارٍ التحقق من حالة قنوات الدفع."
    : settings?.donationChannelsApproved !== true
      ? "قنوات الدفع بانتظار الاعتماد الرسمي. لن نطلب منك دفعاً أو نرسل بياناتك قبل تفعيلها."
      : "لم تُفعّل وسيلة دفع معتمدة حتى الآن.";

  return (
    <div className="ab-public ab-flow-public" dir="rtl">
      <Navbar />
      <main className="ab-flow-page">
        <div className="ab-flow-wrap">
          <div className="ab-flow-breadcrumb">
            <Link href="/">الرئيسية</Link>
            <span aria-hidden="true">/</span>
            {campaign ? <Link href="/campaigns">المشاريع</Link> : <span>التبرع</span>}
            {campaign && <><span aria-hidden="true">/</span><span>{campaignName}</span></>}
          </div>

          <header className="ab-flow-heading">
            <p className="ab-flow-eyebrow">مساهمة آمنة وواضحة</p>
            <h1>صفحة التبرع والدفع</h1>
            <p>أكمل الخطوات، وستظهر حالة العملية بعد التحقق منها.</p>
          </header>

          <section className="ab-flow-card" aria-label="خطوات التبرع">
            <ol className="ab-flow-steps">
              {STEPS.map((label, index) => {
                const itemStep = index + 1;
                const completed = itemStep < step;
                return (
                  <li
                    key={label}
                    className={itemStep === step ? "is-active" : completed ? "is-complete" : ""}
                    aria-current={itemStep === step ? "step" : undefined}
                  >
                    <span className="ab-flow-step-number">
                      {completed ? <Check aria-hidden="true" /> : itemStep}
                    </span>
                    <span className="ab-flow-step-label">{label}</span>
                  </li>
                );
              })}
            </ol>

            <div className="ab-flow-layout">
              <section className="ab-flow-form" aria-live="polite">
                {step === 1 && (
                  <>
                    <div className="ab-flow-form-heading">
                      <span className="ab-flow-count">الخطوة ١ من ٤</span>
                      <h2>اختر مبلغ التبرع</h2>
                      <p>اختر مبلغاً مناسباً، ويمكنك تعديله قبل الدفع.</p>
                    </div>
                    <div className="ab-flow-amount-grid" aria-label="المبالغ المقترحة">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={amountText === String(preset) ? "is-selected" : ""}
                          onClick={() => setAmountText(String(preset))}
                          aria-pressed={amountText === String(preset)}
                        >
                          <strong>{preset.toLocaleString("ar-SA")}</strong>
                          <span>ريال</span>
                        </button>
                      ))}
                    </div>
                    <label className="ab-flow-field">
                      <span>أو أدخل مبلغاً آخر</span>
                      <span className="ab-flow-input-unit">
                        <input
                          type="number"
                          min="1"
                          max="1000000"
                          step="1"
                          inputMode="numeric"
                          value={amountText}
                          onChange={(event) => setAmountText(event.target.value)}
                          aria-label="مبلغ التبرع بالريال السعودي"
                        />
                        <span>ر.س</span>
                      </span>
                    </label>
                    <label className="ab-flow-check">
                      <input
                        type="checkbox"
                        checked={ongoingSadaqa}
                        onChange={(event) => setOngoingSadaqa(event.target.checked)}
                      />
                      <Heart aria-hidden="true" />
                      <span>اجعلها صدقة جارية</span>
                    </label>
                    {campaignUnavailable && (
                      <div className="ab-flow-alert" role="alert">
                        <CircleAlert aria-hidden="true" />
                        <span>المشروع غير متاح حالياً. اختر مشروعاً منشوراً من قائمة المشاريع.</span>
                      </div>
                    )}
                    {formError && <p className="ab-flow-error" role="alert">{formError}</p>}
                    <div className="ab-flow-actions">
                      <button
                        type="button"
                        className="ab-flow-primary"
                        onClick={goToDetails}
                        disabled={!amountValid || campaignUnavailable || Boolean(campaignId && campaignsLoading)}
                      >
                        التالي <ArrowLeft aria-hidden="true" />
                      </button>
                    </div>
                    {!donationReady && (
                      <p className="ab-flow-quiet-status">
                        <ShieldCheck aria-hidden="true" />
                        لا يبدأ الدفع إلا بعد اعتماد القنوات رسمياً.
                      </p>
                    )}
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="ab-flow-form-heading">
                      <span className="ab-flow-count">الخطوة ٢ من ٤</span>
                      <h2>بيانات المتبرع</h2>
                      <p>أدخل بيانات الإيصال، أو اختر عدم إظهار اسمك.</p>
                    </div>
                    {!donationReady && (
                      <div className="ab-flow-inline-note" role="status">
                        <ShieldCheck aria-hidden="true" />
                        <span>ستبقى البيانات في هذه الصفحة ولن تُرسل قبل تفعيل وسيلة دفع معتمدة.</span>
                      </div>
                    )}
                    {!anonymous && (
                      <label className="ab-flow-field">
                        <span>اسم المتبرع</span>
                        <input
                          type="text"
                          autoComplete="name"
                          value={donorName}
                          onChange={(event) => setDonorName(event.target.value)}
                          placeholder="الاسم"
                        />
                      </label>
                    )}
                    <div className="ab-flow-contact-fields">
                      <label className="ab-flow-field">
                        <span>رقم الجوال <small>اختياري</small></span>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          dir="ltr"
                          value={donorPhone}
                          onChange={(event) => setDonorPhone(event.target.value)}
                          placeholder="+966 5X XXX XXXX"
                        />
                      </label>
                      <label className="ab-flow-field">
                        <span>البريد الإلكتروني <small>اختياري</small></span>
                        <input
                          type="email"
                          autoComplete="email"
                          dir="ltr"
                          value={donorEmail}
                          onChange={(event) => setDonorEmail(event.target.value)}
                          placeholder="name@example.com"
                        />
                      </label>
                    </div>
                    <label className="ab-flow-check">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(event) => setAnonymous(event.target.checked)}
                      />
                      <span>التبرع دون إظهار الاسم</span>
                    </label>
                    {formError && <p className="ab-flow-error" role="alert">{formError}</p>}
                    <div className="ab-flow-actions ab-flow-actions-split">
                      <button type="button" className="ab-flow-back" onClick={() => setStep(1)}>
                        <ArrowRight aria-hidden="true" /> السابق
                      </button>
                      <button type="button" className="ab-flow-primary" onClick={goToPayment}>
                        التالي <ArrowLeft aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="ab-flow-form-heading">
                      <span className="ab-flow-count">الخطوة ٣ من ٤</span>
                      <h2>اختر طريقة الدفع</h2>
                      <p>تظهر هنا القنوات المعتمدة والمتاحة فقط.</p>
                    </div>
                    {donationReady ? (
                      <div className="ab-flow-method-list">
                        {availableMethods.map((method) => (
                          <label key={method} className={`ab-flow-method ${effectiveMethod === method ? "is-selected" : ""}`}>
                            <input
                              type="radio"
                              name="donation-payment-method"
                              value={method}
                              checked={effectiveMethod === method}
                              onChange={() => setSelectedMethod(method)}
                            />
                            {method === "rajhi" ? <CreditCard aria-hidden="true" /> : <Landmark aria-hidden="true" />}
                            <span>
                              <strong>{method === "rajhi" ? "دفع إلكتروني" : "تحويل بنكي"}</strong>
                              <small>{method === "rajhi" ? "عبر بوابة الدفع المعتمدة للجمعية" : "يُراجع الطلب قبل تأكيده"}</small>
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="ab-flow-unavailable" role="status">
                        <span className="ab-flow-unavailable-icon"><CircleAlert aria-hidden="true" /></span>
                        <h3>{settingsLoading ? "جارٍ التحقق من القنوات" : "الدفع غير متاح حالياً"}</h3>
                        <p>{paymentUnavailableMessage}</p>
                        <div className="ab-flow-verified-facts">
                          <span>رقم الترخيص</span>
                          <strong dir="ltr">{albayanAssociation.licenseNumber}</strong>
                        </div>
                      </div>
                    )}
                    {formError && <p className="ab-flow-error" role="alert">{formError}</p>}
                    <div className="ab-flow-actions ab-flow-actions-split">
                      <button type="button" className="ab-flow-back" onClick={() => setStep(2)}>
                        <ArrowRight aria-hidden="true" /> السابق
                      </button>
                      {donationReady && (
                        <button type="button" className="ab-flow-primary" onClick={() => setStep(4)} disabled={!effectiveMethod}>
                          متابعة للمراجعة <ArrowLeft aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="ab-flow-form-heading">
                      <span className="ab-flow-count">الخطوة ٤ من ٤</span>
                      <h2>راجع تفاصيل مساهمتك</h2>
                      <p>لن يُسجّل التبرع كمؤكد إلا بعد التحقق من الدفع.</p>
                    </div>
                    <dl className="ab-flow-review">
                      <div><dt>المشروع</dt><dd>{campaignName}</dd></div>
                      <div><dt>نوع التبرع</dt><dd>{DONATION_TYPES[donationType] || donationType}</dd></div>
                      <div><dt>المبلغ</dt><dd>{amount.toLocaleString("ar-SA")} ر.س</dd></div>
                      <div><dt>طريقة الدفع</dt><dd>{effectiveMethod === "rajhi" ? "دفع إلكتروني" : effectiveMethod === "bank_transfer" ? "تحويل بنكي" : "—"}</dd></div>
                      <div><dt>اسم المتبرع</dt><dd>{anonymous ? "فاعل خير" : donorName || "فاعل خير"}</dd></div>
                    </dl>
                    {effectiveMethod === "bank_transfer" && (
                      <div className="ab-flow-inline-note">
                        <ShieldCheck aria-hidden="true" />
                        <span>سيبقى الطلب قيد المراجعة إلى أن يتم التحقق من التحويل.</span>
                      </div>
                    )}
                    {formError && <p className="ab-flow-error" role="alert">{formError}</p>}
                    <div className="ab-flow-actions ab-flow-actions-split">
                      <button type="button" className="ab-flow-back" onClick={() => setStep(3)} disabled={isDonating}>
                        <ArrowRight aria-hidden="true" /> السابق
                      </button>
                      <button
                        type="button"
                        className="ab-flow-primary"
                        onClick={() => void submitDonation()}
                        disabled={!donationReady || !effectiveMethod || isDonating}
                      >
                        {isDonating ? <LoaderCircle className="is-spinning" aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
                        {isDonating ? "جارٍ بدء العملية…" : "ابدأ الدفع الآمن"}
                      </button>
                    </div>
                  </>
                )}
              </section>

              <aside className="ab-flow-summary" aria-label="ملخص التبرع">
                <div className="ab-flow-summary-title">
                  <div className="ab-flow-summary-image">
                    {campaign?.image ? (
                      <img src={campaignImage} alt="" />
                    ) : (
                      <img src={campaignImage} alt="" />
                    )}
                  </div>
                  <div>
                    <span>{campaign ? "المشروع المختار" : "مساهمة للجمعية"}</span>
                    <h2>{campaignLoadingText(campaignId, campaignsLoading, campaignUnavailable, campaignName)}</h2>
                    <p>{campaign ? "مشروع معلن للجمعية" : "جمعية مقارئ البيان"}</p>
                  </div>
                </div>
                <div className="ab-flow-summary-divider" />
                <div className="ab-flow-summary-amount">
                  <span>المبلغ المختار</span>
                  <strong>{amountValid ? amount.toLocaleString("ar-SA") : "—"} <small>ريال</small></strong>
                </div>
                <p className="ab-flow-summary-description">
                  {campaign ? campaignSummary : "ساهم في تعليم القرآن الكريم للناطقين بغير العربية."}
                </p>
                <div className="ab-flow-summary-note">
                  <ShieldCheck aria-hidden="true" />
                  <span>{donationReady ? "قنوات الدفع المعتمدة فقط تظهر في الخطوة التالية." : "لن يتم طلب الدفع قبل اعتماد القنوات رسمياً."}</span>
                </div>
                <Link href="/campaigns" className="ab-flow-summary-link">
                  استكشف المشاريع <ArrowLeft aria-hidden="true" />
                </Link>
              </aside>
            </div>
          </section>

          <p className="ab-flow-footnote">
            {albayanAssociation.legalName} · رقم الترخيص {albayanAssociation.licenseNumber}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function campaignLoadingText(
  campaignId: string,
  loading: boolean,
  unavailable: boolean,
  campaignName: string,
) {
  if (!campaignId) return "تبرع عام";
  if (loading) return "جارٍ تحميل المشروع";
  if (unavailable) return "المشروع غير متاح";
  return campaignName;
}
