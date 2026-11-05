import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  CircleAlert,
  CircleDollarSign,
  Globe2,
  GraduationCap,
  Heart,
  Play,
  ShieldCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";
import { useDonations } from "@/hooks/use-donations";
import { albayanAssociation, attachedReportSnapshot } from "@/lib/albayan-donation-facts";
import "./DonationHome.css";

type CampaignRecord = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  goalAmount?: number;
  currentAmount?: number;
  status?: string;
};

type PaymentMethod = "rajhi" | "bank_transfer";

type PublicDonationSettings = {
  donationChannelsApproved: boolean;
  enableRajhiPayment: boolean;
  enableBankTransfer: boolean;
};

const faqItems = [
  {
    title: "ما رسالة مقارئ البيان؟",
    answer: "تعليم القرآن الكريم للناطقين بغير العربية، عبر برامج تشمل التلاوة والحفظ وتصحيح القراءة وإعداد المعلمين والمعلمات.",
  },
  {
    title: "هل يمكن التبرع عبر الموقع الآن؟",
    answer: "قنوات التبرع قيد الاعتماد. لا تُقبل المدفوعات حالياً، ولن نطلب إرسال مبلغ قبل الإعلان عن القنوات الرسمية المعتمدة باسم الجمعية.",
  },
  {
    title: "هل أرقام الدارسين والمعلمين مباشرة؟",
    answer: "لا. الأرقام المعروضة من التقرير المرفق، وهي تاريخية وليست إحصاءات مباشرة أو محدثة لحظياً.",
  },
  {
    title: "كيف أعرف أن الحملة رسمية؟",
    answer: "ستعرض هذه الصفحة الحملات النشطة المنشورة من بيانات الجمعية فقط. عند عدم وجود حملة منشورة، نوضح ذلك بدلاً من عرض حملات أو مبالغ غير موثقة.",
  },
];

const programs = [
  {
    number: "01",
    title: "حلقات التلاوة والحفظ",
    description: "تعليم التلاوة والتحفيظ للفئات الاجتماعية ضمن رسالة الجمعية.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "تصحيح التلاوة",
    description: "مرافقة الدارسين في القراءة الصحيحة للقرآن الكريم.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "إعداد المعلمين والمعلمات",
    description: "تأهيل الكفاءات للعمل في حلقات القرآن الكريم.",
    icon: GraduationCap,
  },
];

function formatSar(value: number) {
  return `${value.toLocaleString("en-US")} ريال`;
}

export default function DonationHome() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [quickDonateOpen, setQuickDonateOpen] = useState(false);
  const [amount, setAmount] = useState("100");
  const [campaignId, setCampaignId] = useState("general");
  const [anonymous, setAnonymous] = useState(false);
  const [ongoingSadaqa, setOngoingSadaqa] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [donationDetailsOpen, setDonationDetailsOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [impactVideoStarted, setImpactVideoStarted] = useState(false);
  const [impactVideoPlaying, setImpactVideoPlaying] = useState(false);
  const [impactVideoError, setImpactVideoError] = useState(false);
  const { donate, isDonating } = useDonations();
  const heroRef = useRef<HTMLElement>(null);
  const impactVideoRef = useRef<HTMLVideoElement>(null);
  const quickPanelRef = useRef<HTMLElement>(null);
  const quickCloseRef = useRef<HTMLButtonElement>(null);
  const heroDonateTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  const playImpactVideo = async () => {
    setImpactVideoStarted(true);
    try {
      await impactVideoRef.current?.play();
      setImpactVideoError(false);
    } catch {
      setImpactVideoError(true);
    }
  };

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => {
      setHeroVisible(entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const campaignsQuery = useQuery<CampaignRecord[]>({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) throw new Error("تعذر تحميل الحملات المنشورة");
      const payload = await response.json();
      const records = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      return records
        .filter((record: any) => record?.status === "active")
        .map((record: any) => ({
          id: String(record.id || record._id || ""),
          title: String(record.titleAr || record.title || ""),
          description: record.descriptionAr || record.description || "",
          image: record.image || "",
          goalAmount: typeof record.goalAmount === "number" ? record.goalAmount : undefined,
          currentAmount: typeof record.currentAmount === "number" ? record.currentAmount : undefined,
          status: record.status,
        }))
        .filter((record: CampaignRecord) => record.id && record.title);
    },
    staleTime: 60_000,
  });

  const settingsQuery = useQuery<PublicDonationSettings>({
    queryKey: ["/api/settings", "donationPaymentSettings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        return {
          donationChannelsApproved: false,
          enableRajhiPayment: false,
          enableBankTransfer: false,
        };
      }
      const payload = await response.json();
      const settings = payload?.settings || payload?.data || payload;
      return {
        donationChannelsApproved: settings?.donationChannelsApproved === true,
        enableRajhiPayment: settings?.enableRajhiPayment === true,
        enableBankTransfer: settings?.enableBankTransfer === true,
      };
    },
    staleTime: 60_000,
    retry: false,
  });

  useSEO({
    title: `${albayanAssociation.brandName} | تعليم القرآن لكل لسان`,
    description: "جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية. تعرّف على البرامج والحملات المنشورة وبيانات الجمعية.",
    image: "/images/albayan-quran-learning.jpg",
  });

  const activeCampaigns = campaignsQuery.data || [];
  const amountValue = Number(amount);
  const validAmount = Number.isFinite(amountValue) && Number.isInteger(amountValue) && amountValue > 0;
  const validSelection = campaignId === "general" || activeCampaigns.some((campaign) => campaign.id === campaignId);
  const donationApproved = settingsQuery.data?.donationChannelsApproved === true;
  const availablePaymentMethods: PaymentMethod[] = [
    ...(settingsQuery.data?.enableRajhiPayment ? ["rajhi" as const] : []),
    ...(settingsQuery.data?.enableBankTransfer ? ["bank_transfer" as const] : []),
  ];
  useEffect(() => {
    if (donationApproved) setDonationDetailsOpen(true);
  }, [donationApproved]);
  const canContinue =
    donationApproved &&
    validAmount &&
    validSelection &&
    availablePaymentMethods.includes(paymentMethod as PaymentMethod);
  const stats = [
    { value: albayanAssociation.licenseNumber, label: "رقم الترخيص", icon: ShieldCheck },
    { value: `+${attachedReportSnapshot.countriesMoreThan}`, label: "دولة حول العالم", icon: Globe2 },
    { value: String(attachedReportSnapshot.volunteerTeachers), label: "معلماً ومعلّمة متطوعين", icon: Users },
    {
      value: attachedReportSnapshot.registeredLearners.toLocaleString("en-US"),
      label: "دارساً مسجلاً في التقرير",
      icon: BookOpen,
    },
  ];

  useEffect(() => {
    if (!quickDonateOpen) return;
    quickCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuickDonateOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = quickPanelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href]',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [quickDonateOpen]);

  const closeQuickDonation = () => {
    setQuickDonateOpen(false);
    window.setTimeout(() => {
      const isMobile = window.matchMedia("(max-width: 900px)").matches;
      const trigger = heroVisible
        ? heroDonateTriggerRef.current
        : (isMobile ? mobileTriggerRef : desktopTriggerRef).current;
      trigger?.focus();
    }, 0);
  };

  return (
    <div className="ab-home" dir="rtl">
      <Navbar />
      <main>
        <section ref={heroRef} className="ab-home-hero" id="home" aria-labelledby="home-title">
          <img
            className="ab-home-hero-photo"
            src="/images/albayan-hero-quran.webp"
            alt="طالب يتلو القرآن الكريم في المسجد"
            loading="eager"
          />
          <div className="ab-hero-inner">
            <div className="ab-hero-copy">
              <p className="ab-home-eyebrow">{albayanAssociation.brandName} · {albayanAssociation.city}</p>
              <h1 id="home-title">معًا لنشر القرآن<br /><em>وبناء جيل قرآني</em></h1>
              <p className="ab-hero-lead">
                بدعمكم نستثمر في تعليم كتاب الله وحفظه وتصحيح التلاوة، وتمكين آلاف الطلاب في مختلف المناطق.
              </p>
              <div className="ab-hero-actions">
                <button
                  ref={heroDonateTriggerRef}
                  className="ab-home-button ab-home-button-gold"
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={quickDonateOpen}
                  aria-controls="ab-donation-panel"
                  onClick={() => setQuickDonateOpen(true)}
                >
                  <Heart aria-hidden="true" /> تبرع الآن
                </button>
                <Link className="ab-home-button ab-home-button-glass" href="/impact"><Play aria-hidden="true" /> شاهد أثر تبرعك</Link>
              </div>
              <div className="ab-hero-trust">
                <ShieldCheck aria-hidden="true" />
                <span><strong>قنوات التبرع قيد الاعتماد.</strong> لا تُقبل المدفوعات قبل اعتمادها رسمياً باسم الجمعية.</span>
              </div>
            </div>
          </div>
          <section className="ab-proof" aria-label="أرقام تاريخية من التقرير التعليمي المرفق">
            <div className="ab-wide ab-proof-inner">
              {stats.map(({ value, label, icon: StatIcon }) => (
                <div className="ab-proof-item" key={label}>
                  <StatIcon aria-hidden="true" />
                  <strong dir="ltr">{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p className="ab-wide ab-proof-note"><ShieldCheck aria-hidden="true" /> {attachedReportSnapshot.notLiveLabel}.</p>
          </section>
        </section>

        <section className="ab-section ab-section-paper" id="campaigns" aria-labelledby="campaigns-title">
          <div className="ab-wide">
            <div className="ab-section-head">
              <div>
                <span className="ab-section-index">01 / فرص العطاء</span>
                <h2 id="campaigns-title">مشاريعنا الحالية،<br />وفرص دعم القرآن.</h2>
              </div>
              <div>
                <p>تعرّف على المشاريع المنشورة وميزانياتها. لا نعرض مبالغ محصّلة أو نسب إنجاز قبل توثيقها.</p>
                <Link className="ab-section-link" href="/campaigns">كل الحملات <ArrowLeft aria-hidden="true" /></Link>
              </div>
            </div>
            {campaignsQuery.isLoading ? (
              <div className="ab-campaign-skeletons" aria-label="جارٍ تحميل الحملات">
                {[1, 2, 3].map((item) => <div className="ab-campaign-skeleton" key={item} />)}
              </div>
            ) : campaignsQuery.isError ? (
              <div className="ab-home-empty ab-home-error" role="alert">
                <div className="ab-empty-mark"><CircleAlert aria-hidden="true" /></div>
                <div>
                  <h3>تعذر تحميل الحملات</h3>
                  <p>لم نعرض حملات بديلة أو مبالغ غير موثقة.</p>
                  <button type="button" onClick={() => void campaignsQuery.refetch()}>إعادة المحاولة</button>
                </div>
              </div>
            ) : activeCampaigns.length > 0 ? (
              <div className={`ab-home-campaign-grid${activeCampaigns.length === 1 ? " is-single" : activeCampaigns.length === 2 ? " is-double" : ""}`}>
                {activeCampaigns.slice(0, 3).map((campaign) => {
                  const isSirajaProject = campaign.image === "/images/siraja-logo.png";
                  const hasTarget = typeof campaign.goalAmount === "number" && campaign.goalAmount > 0;
                  const hasCollected = typeof campaign.currentAmount === "number" && campaign.currentAmount > 0;
                  const progress = hasTarget && hasCollected
                    ? Math.min(100, (campaign.currentAmount! / campaign.goalAmount!) * 100)
                    : 0;
                  return (
                    <article
                      className="ab-home-campaign"
                      key={campaign.id}
                    >
                      {campaign.image ? (
                        <img
                          className={`ab-home-campaign-image${isSirajaProject ? " ab-home-campaign-image-logo" : ""}`}
                          src={campaign.image}
                          alt={campaign.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="ab-campaign-image-empty" aria-hidden="true"><BookOpen /></div>
                      )}
                      <div className="ab-home-campaign-body">
                        <p className="ab-home-campaign-tag">مشروع منشور</p>
                        <h3>{campaign.title}</h3>
                        {campaign.description && <p className="ab-home-campaign-desc">{campaign.description}</p>}
                        {hasTarget ? (
                          <div className="ab-campaign-funding">
                            <div className="ab-campaign-funding-row">
                              <span>{isSirajaProject ? "ميزانية المشروع" : "الهدف"}</span>
                              <strong>{formatSar(campaign.goalAmount!)}</strong>
                            </div>
                            {hasCollected && (
                              <>
                                <div className="ab-campaign-funding-row" style={{ marginTop: 7 }}>
                                  <span>المبلغ المحصّل</span><strong>{formatSar(campaign.currentAmount!)}</strong>
                                </div>
                                <div
                                  className="ab-campaign-meter"
                                  role="progressbar"
                                  aria-label={`نسبة إنجاز ${campaign.title}`}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-valuenow={Math.round(progress)}
                                >
                                  <span style={{ width: `${progress}%` }} />
                                </div>
                                <p className="ab-campaign-remaining">المتبقي {formatSar(Math.max(0, campaign.goalAmount! - campaign.currentAmount!))}</p>
                              </>
                            )}
                            {!hasCollected && isSirajaProject && (
                              <p className="ab-campaign-not-announced">
                                قنوات التبرع قيد الاعتماد؛ سيظهر التقدم المالي بعد توثيق المساهمات.
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="ab-campaign-not-announced">لم يُعلن عن هدف مالي لهذه الحملة.</p>
                        )}
                        <div className="ab-home-campaign-actions">
                          <Link className="ab-campaign-detail-link" href={`/campaigns/${campaign.id}`}>
                            <span>تفاصيل المشروع</span><ArrowLeft aria-hidden="true" />
                          </Link>
                          <button
                            className="ab-campaign-donate-button"
                            type="button"
                            aria-haspopup="dialog"
                            aria-expanded={quickDonateOpen}
                            aria-controls="ab-donation-panel"
                            onClick={() => {
                              setCampaignId(campaign.id);
                              setQuickDonateOpen(true);
                            }}
                          >
                            <Heart aria-hidden="true" /> تبرع للمشروع
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="ab-home-empty">
                <div className="ab-empty-mark"><BookOpen aria-hidden="true" /></div>
                <div>
                  <h3>لا توجد حملات نشطة منشورة حالياً</h3>
                  <p>ستظهر هنا تفاصيل الحملة ومبالغها عند نشرها. لا نعرض حملات قديمة أو أهدافاً وتحصيلات غير موثقة.</p>
                </div>
                <Link className="ab-section-link" href="/about">عن مقارئ البيان <ArrowLeft aria-hidden="true" /></Link>
              </div>
            )}
          </div>
        </section>

        <section className="ab-section ab-impact-section" aria-labelledby="impact-stories-title">
          <div className="ab-wide">
            <div className="ab-impact-feature">
              <div className="ab-impact-main">
                <div className="ab-impact-copy">
                  <span className="ab-section-index">أثر عطائك</span>
                  <h2 id="impact-stories-title">رسالةٌ من حلقات القرآن.</h2>
                  <p>
                    تعرّف على رسالة مقارئ البيان في تعليم القرآن الكريم، وبرامج التلاوة والحفظ وتصحيح القراءة للناطقين بغير العربية.
                  </p>
                  <div className="ab-impact-actions">
                    <button className="ab-home-button ab-home-button-outline" type="button" onClick={() => void playImpactVideo()}>
                      شاهد الرسالة <Play aria-hidden="true" />
                    </button>
                    <Link className="ab-section-link" href="/impact">
                      التقرير التعليمي <ArrowLeft aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <figure className="ab-impact-media">
                  <video
                    ref={impactVideoRef}
                    controls={impactVideoStarted}
                    playsInline
                    preload="none"
                    poster="/images/albayan-learning-impact.jpg"
                    aria-label="رسالة مرئية من جمعية مقارئ البيان"
                    onPlay={() => { setImpactVideoStarted(true); setImpactVideoPlaying(true); setImpactVideoError(false); }}
                    onPause={() => setImpactVideoPlaying(false)}
                    onEnded={() => setImpactVideoPlaying(false)}
                    onError={() => {
                      setImpactVideoPlaying(false);
                      if (impactVideoStarted) setImpactVideoError(true);
                    }}
                  >
                    <source src="/videos/albayan-donation-appeal.mp4" type="video/mp4" />
                  </video>
                  {!impactVideoPlaying && (
                    <button
                      className="ab-impact-play"
                      type="button"
                      aria-label="تشغيل رسالة مقارئ البيان"
                      onClick={() => void playImpactVideo()}
                    >
                      <Play aria-hidden="true" fill="currentColor" />
                    </button>
                  )}
                  {impactVideoError && (
                    <p className="ab-impact-video-error" role="status">
                      تعذّر تشغيل الفيديو. يمكنك الاطلاع على التقرير التعليمي بدلاً من ذلك.
                    </p>
                  )}
                </figure>
              </div>
              <div className="ab-impact-highlights" aria-label="بيانات الجمعية وأثر برامجها">
                <div className="ab-impact-highlight">
                  <ShieldCheck aria-hidden="true" />
                  <strong>جمعية مرخّصة</strong>
                  <span>رقم الترخيص {albayanAssociation.licenseNumber}</span>
                </div>
                <div className="ab-impact-highlight">
                  <BookOpen aria-hidden="true" />
                  <strong>توثيق واضح</strong>
                  <span>كل رقم مرتبط بمصدره</span>
                </div>
                <div className="ab-impact-highlight">
                  <Users aria-hidden="true" />
                  <strong>أثر تعليمي</strong>
                  <span>{attachedReportSnapshot.registeredLearners.toLocaleString("en-US")} دارسًا في التقرير</span>
                </div>
                <div className="ab-impact-highlight">
                  <GraduationCap aria-hidden="true" />
                  <strong>تعليم مستمر</strong>
                  <span>تلاوة وحفظ وتصحيح</span>
                </div>
              </div>
              <p className="ab-impact-note">
                <ShieldCheck aria-hidden="true" />
                {attachedReportSnapshot.notLiveLabel}.
              </p>
            </div>
          </div>
        </section>

        <section className="ab-quick-section" aria-labelledby="quick-section-title">
          <div className="ab-wide ab-quick-card">
            <div className="ab-quick-card-copy">
              <span className="ab-quick-card-symbol"><Heart aria-hidden="true" /></span>
              <div>
                <small>المساهمة عبر القنوات الرسمية</small>
                <h2 id="quick-section-title">نافذة تبرع واضحة، بلا استعجال.</h2>
                <p>يمكنك تجهيز اختيارك، لكن الدفع يظل متوقفاً حتى اعتماد القنوات الرسمية. لا تُقبل المدفوعات حالياً.</p>
              </div>
            </div>
            <button className="ab-home-button ab-home-button-gold" type="button" onClick={() => setQuickDonateOpen(true)}>
              فتح التبرع السريع <ArrowLeft aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="ab-section ab-programs" id="programs" aria-labelledby="programs-title">
          <div className="ab-wide">
            <div className="ab-section-head">
              <div>
                <span className="ab-section-index">04 / مجالات التعليم</span>
                <h2 id="programs-title">تعليمٌ يرسخ،<br />ومعرفةٌ تمتد.</h2>
              </div>
              <p>أهداف تعليمية واردة في بيانات الجمعية؛ ليست حملات جمع مالي أو مبالغ تمويل منشورة.</p>
            </div>
            <div className="ab-program-grid">
              {programs.map(({ number, title, description, icon: Icon }) => (
                <article className="ab-program-card" key={number}>
                  <div className="ab-program-card-top"><span>{number}</span><Icon aria-hidden="true" /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <Link href="/about">تعرّف على رسالة الجمعية <ArrowLeft aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
            <div className="ab-program-footnote"><ShieldCheck aria-hidden="true" /> المجالات التعريفية لا تعني وجود حملة مالية نشطة أو هدف تمويل منشور.</div>
          </div>
        </section>

        <section className="ab-section ab-faq-section" aria-labelledby="faq-title">
          <div className="ab-wide ab-faq-layout">
            <div className="ab-faq-heading">
              <span className="ab-section-index">05 / إجابات واضحة</span>
              <h2 id="faq-title">أسئلة قبل<br />المساهمة.</h2>
              <p>معلومات موجزة عن رسالة الجمعية، الأرقام، وحالة قنوات التبرع.</p>
              <Link className="ab-section-link" href="/faq">مركز الأسئلة الشائعة <ArrowLeft aria-hidden="true" /></Link>
            </div>
            <div className="ab-faq-list">
              {faqItems.map((item, index) => {
                const isOpen = openQuestion === index;
                return (
                  <div className={`ab-faq-item ${isOpen ? "is-open" : ""}`} key={item.title}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`home-faq-answer-${index}`}
                      onClick={() => setOpenQuestion(isOpen ? null : index)}
                    >
                      <small>0{index + 1}</small>
                      <strong>{item.title}</strong>
                      <ChevronDown aria-hidden="true" />
                    </button>
                    {isOpen && <p className="ab-faq-answer" id={`home-faq-answer-${index}`}>{item.answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ab-news-section" aria-labelledby="updates-title">
          <div className="ab-wide ab-news-inner">
            <div className="ab-news-copy">
              <span className="ab-section-index">06 / آخر المستجدات</span>
              <h2 id="updates-title">تابع ما يُنشر من برامج وحملات.</h2>
              <p>لا يوجد اشتراك بريدي حالياً. عند نشر حملة أو تحديث رسمي، ستجده في صفحات مقارئ البيان المعتمدة.</p>
            </div>
            <div className="ab-news-actions">
              <Link className="ab-home-button ab-home-button-gold" href="/campaigns">صفحة الحملات <ArrowLeft aria-hidden="true" /></Link>
              <Link className="ab-home-button ab-home-button-outline" href="/about">عن الجمعية</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {!quickDonateOpen && !heroVisible && (
        <>
          <div className="ab-dock">
            <button
              ref={desktopTriggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={quickDonateOpen}
              aria-controls="ab-donation-panel"
              onClick={() => setQuickDonateOpen(true)}
            >
              <Heart aria-hidden="true" /> تبرع سريع
            </button>
          </div>
          <button
            className="ab-mobile-donate"
            ref={mobileTriggerRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={quickDonateOpen}
            aria-controls="ab-donation-panel"
            onClick={() => setQuickDonateOpen(true)}
          >
            <Heart aria-hidden="true" /> تبرع سريع
          </button>
        </>
      )}

      {quickDonateOpen && (
        <div
          className="ab-donation-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeQuickDonation();
          }}
        >
          <section
            className="ab-donation-panel"
            ref={quickPanelRef}
            id="ab-donation-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ab-donation-title"
            aria-describedby="ab-donation-description"
          >
            <header className="ab-donation-header">
              <div className="ab-donation-heading">
                <span className="ab-donation-zap"><Zap aria-hidden="true" /></span>
                <div>
                  <p className="ab-section-index">مساهمة آمنة وواضحة</p>
                  <h2 id="ab-donation-title">التبرع السريع</h2>
                </div>
              </div>
              <button className="ab-donation-close" ref={quickCloseRef} type="button" onClick={closeQuickDonation} aria-label="إغلاق التبرع السريع">
                <X aria-hidden="true" />
              </button>
            </header>
            <p className="ab-donation-intro" id="ab-donation-description">
              اختر مبلغ التبرع الآن، وحدّد وجهته عند تفعيل القنوات الرسمية.
            </p>
            <p className="ab-donation-label">اختر مبلغ التبرع الآن</p>
            <div className="ab-amount-options" role="group" aria-label="مبالغ مقترحة بالريال السعودي">
              {[500, 300, 200, 100, 50].map((preset) => (
                <button key={preset} type="button" aria-pressed={amount === String(preset)} onClick={() => setAmount(String(preset))}>
                  {preset}
                </button>
              ))}
            </div>
            <label className="ab-custom-amount-label" htmlFor="ab-custom-amount">مبلغ آخر</label>
            <div className="ab-amount-input-wrap">
              <CircleDollarSign aria-hidden="true" />
              <input
                id="ab-custom-amount"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={amount.length > 0 && !validAmount}
              />
              <span>ر.س</span>
            </div>
            <label className="ab-sadaqa-option">
              <input type="checkbox" checked={ongoingSadaqa} onChange={(event) => setOngoingSadaqa(event.target.checked)} />
              <Heart aria-hidden="true" />
              <span>صدقة جارية</span>
            </label>
            <details
              className="ab-donation-details"
              open={donationDetailsOpen}
              onToggle={(event) => setDonationDetailsOpen(event.currentTarget.open)}
            >
              <summary>المشروع وبيانات المساهمة</summary>
              <div className="ab-donation-details-content">
                <label htmlFor="ab-campaign-choice">وجهة المساهمة</label>
                <select className="ab-campaign-select" id="ab-campaign-choice" value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>
                  <option value="general">تبرع عام للجمعية</option>
                  {activeCampaigns.map((campaign) => (
                    <option value={campaign.id} key={campaign.id}>{campaign.title}</option>
                  ))}
                </select>
                {campaignsQuery.isError && <p className="ab-donation-foot">تعذر تحميل الحملات. يمكنك اختيار التبرع العام.</p>}
                <fieldset className="ab-payment-methods" disabled={!donationApproved}>
                  <legend>وسيلة التبرع</legend>
                  {availablePaymentMethods.length > 0 ? (
                    <div className="ab-payment-method-options">
                      {availablePaymentMethods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          aria-pressed={paymentMethod === method}
                          onClick={() => setPaymentMethod(method)}
                        >
                          {method === "rajhi" ? "الدفع الإلكتروني" : "التحويل البنكي"}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p>
                      {donationApproved
                        ? "لا توجد وسيلة دفع متاحة الآن."
                        : "ستظهر وسائل الدفع هنا بعد اعتمادها رسمياً."}
                    </p>
                  )}
                </fieldset>
                <label className="ab-anonymous-option">
                  <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
                  <span>إخفاء الاسم عند عرض المساهمة علناً</span>
                </label>
                {!anonymous && (
                  <div className="ab-donor-name-field">
                    <label htmlFor="ab-donor-name">الاسم الظاهر (اختياري)</label>
                    <input
                      id="ab-donor-name"
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      value={donorName}
                      onChange={(event) => setDonorName(event.target.value)}
                    />
                  </div>
                )}
              </div>
            </details>
            <div className="ab-donation-status" role="status">
              <CircleAlert aria-hidden="true" />
              <span>
                {settingsQuery.isLoading
                  ? "جارٍ التحقق من حالة قنوات التبرع…"
                  : !donationApproved
                    ? "قنوات التبرع غير معتمدة حالياً؛ لا يمكن بدء الدفع."
                    : availablePaymentMethods.length === 0
                      ? "القنوات معتمدة، لكن لا توجد وسيلة دفع مفعّلة حالياً."
                      : "قنوات التبرع معتمدة. اختر وسيلة الدفع للمتابعة."}
              </span>
            </div>
            <button
              className="ab-home-button ab-home-button-gold"
              type="button"
              disabled={!canContinue || isDonating}
              onClick={() => {
                if (!canContinue) return;
                void donate({
                  amount: amountValue,
                  currency: "SAR",
                  gateway: paymentMethod === "rajhi" ? "rajhi" : "bank_transfer",
                  paymentMethod: paymentMethod === "rajhi" ? "online" : "bank_transfer",
                  type: ongoingSadaqa ? "waqf" : "general",
                  status: "pending",
                  paymentStatus: "pending",
                  isDeleted: false,
                  pointsEarned: 0,
                  ...(campaignId !== "general" ? { campaignId } : {}),
                  ...(anonymous
                    ? { donorName: "فاعل خير" }
                    : donorName.trim()
                      ? { donorName: donorName.trim() }
                      : {}),
                });
              }}
            >
              {settingsQuery.isLoading ? "جارٍ التحقق من الحالة" : isDonating ? "جارٍ تجهيز المساهمة" : "تبرع الآن"}
              <ArrowLeft aria-hidden="true" />
            </button>
            <p className="ab-donation-foot">
              لا تُقبل المدفوعات قبل اعتماد وسائل التبرع الرسمية باسم الجمعية.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
