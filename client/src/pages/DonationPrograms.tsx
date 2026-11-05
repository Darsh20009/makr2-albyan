import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, ChevronLeft, Megaphone, ShieldCheck, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";
import { albayanAssociation } from "@/lib/albayan-donation-facts";
import "./DonationHome.css";

type PublicCampaign = {
  id: string;
  title: string;
  titleAr?: string;
  subtitle?: string;
  image?: string;
  isActive: boolean;
  isPublic: boolean;
  tiers?: { label: string; amount: string }[];
};

const programs = [
  {
    id: "reading",
    title: "حلقات التلاوة والحفظ",
    description: "تعليم التلاوة والتحفيظ للفئات الاجتماعية، وهو من أهداف الجمعية التعليمية الموثقة.",
    icon: BookOpen,
  },
  {
    id: "recitation",
    title: "تصحيح التلاوة",
    description: "تعليم القراءة الصحيحة للقرآن الكريم ضمن برامج الجمعية.",
    icon: BookOpen,
  },
  {
    id: "teachers",
    title: "إعداد المعلمين والمعلمات",
    description: "إعداد الكفاءات التعليمية للعمل في حلقات القرآن الكريم.",
    icon: Users,
  },
];

export default function DonationPrograms() {
  const { id } = useParams<{ id?: string }>();
  const campaignQuery = useQuery<PublicCampaign[]>({
    queryKey: ["/api/campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) throw new Error("تعذر تحميل الحملات المنشورة");
      const data = await response.json();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      return rows.map((campaign: any) => ({
        ...campaign,
        id: String(campaign.id || campaign._id || ""),
        title: campaign.titleAr || campaign.title,
      }));
    },
    staleTime: 60_000,
  });
  const campaigns = campaignQuery.data || [];
  const selectedCampaign = id ? campaigns.find((campaign) => campaign.id === id) : null;
  const selected = id ? programs.find((program) => program.id === id) : null;

  useSEO({
    title: `${selectedCampaign?.title || selected?.title || "حملات التبرع"} | مقارئ البيان`,
    description: "حملات ومجالات دعم تعليم القرآن الكريم لدى جمعية مقارئ البيان.",
    image: "/images/albayan-official-logo.png",
  });

  return (
      <div className="ab-public" dir="rtl">
      <Navbar />
      <main>
        <section className="ab-page-hero">
          <div className="ab-wide">
            <div className="ab-breadcrumb">
              <Link href="/">الرئيسية</Link><ChevronLeft aria-hidden="true" /><span>البرامج والحملات</span>
            </div>
            <div className="ab-page-hero-row">
              <div>
                <p className="ab-eyebrow">جمعية مسجلة في {albayanAssociation.city}</p>
                <h1>
                  {selectedCampaign?.title || selected?.title || "حملات التبرع"}
                </h1>
                <p className="ab-page-hero-copy">
                  {selectedCampaign?.subtitle || selected?.description || "نتعرّف إلى مجالات تعليم القرآن الكريم، ونعرض الحملات المنشورة والمعتمدة باسم الجمعية فقط."}
                </p>
              </div>
              <div className="ab-license-chip">
                <ShieldCheck aria-hidden="true" /><span>رقم الترخيص</span>
                <strong dir="ltr">{albayanAssociation.licenseNumber}</strong>
              </div>
            </div>
          </div>
        </section>

        {selectedCampaign ? (
          <section className="ab-content-section">
            <div className="ab-wide ab-detail-grid">
              <article className="ab-paper-card ab-campaign-detail">
                {selectedCampaign.image && (
                  <img src={selectedCampaign.image} alt={selectedCampaign.title} />
                )}
                <div className="ab-card-body">
                  <p className="ab-card-kicker"><span className="ab-status-dot" />حملة منشورة باسم الجمعية</p>
                  <h2>{selectedCampaign.title}</h2>
                  {selectedCampaign.subtitle && <p className="ab-detail-description">{selectedCampaign.subtitle}</p>}
                  <p className="ab-small-note">قنوات الدفع غير متاحة حالياً؛ لا تُقبل المساهمات ولا يوجد نموذج دفع.</p>
                  <Link href="/campaigns" className="ab-text-link">
                    العودة إلى الحملات <ArrowLeft aria-hidden="true" />
                  </Link>
                </div>
              </article>
              <aside className="ab-status-panel">
                <span className="ab-panel-icon"><ShieldCheck aria-hidden="true" /></span>
                <p className="ab-panel-kicker">توضيح مهم</p>
                <h3>قنوات المساهمة بانتظار الاعتماد</h3>
                <p>
                  استقبال المبالغ متوقف حتى اعتماد بيانات الدفع الرسمية للجمعية. لن نعرض وسيلة دفع غير معتمدة.
                </p>
                <Link href="/donate" className="ab-button ab-button-ivory">
                  تفاصيل الحالة <ArrowLeft aria-hidden="true" />
                </Link>
              </aside>
            </div>
          </section>
        ) : selected ? (
          <section className="ab-content-section">
            <div className="ab-wide ab-detail-grid">
              <article className="ab-paper-card ab-program-detail">
                <p className="ab-card-kicker">مجال تعليمي من أهداف الجمعية</p>
                <h2>{selected.title}</h2>
                <p className="ab-detail-description">{selected.description}</p>
                <p className="ab-detail-description">
                  هذا المسار مستند إلى أهداف جمعية مقارئ البيان. لا نعرض تكلفة أو أرقام احتياج غير معتمدة.
                </p>
                <Link href="/campaigns" className="ab-text-link">
                  العودة إلى البرامج <ArrowLeft aria-hidden="true" />
                </Link>
              </article>
              <aside className="ab-status-panel">
                <span className="ab-panel-icon"><ShieldCheck aria-hidden="true" /></span>
                <p className="ab-panel-kicker">توضيح مهم</p>
                <h3>قنوات المساهمة بانتظار الاعتماد</h3>
                <p>
                  القنوات قيد الاعتماد. لا ترسل مبلغاً أو تستخدم بيانات دفع سابقة حتى يصدر الإعلان الرسمي.
                </p>
                <Link href="/donate" className="ab-button ab-button-ivory">
                  تفاصيل الحالة <ArrowLeft aria-hidden="true" />
                </Link>
              </aside>
            </div>
          </section>
        ) : (
          <section className="ab-content-section">
            <div className="ab-wide">
              <div className="ab-section-intro">
                <div>
                  <p className="ab-section-eyebrow">ما نعلنه وما لا نعلنه</p>
                  <h2>برامج تعليمية، وحملات موثقة</h2>
                </div>
                <p>لا تظهر هنا إلا الحملات المنشورة باسم الجمعية. البرامج التعريفية لا تمثل طلبات تمويل.</p>
              </div>
              <div className="ab-campaigns-block">
                <div className="ab-list-heading">
                  <div>
                    <p className="ab-section-eyebrow">الحملات المعتمدة للنشر</p>
                    <h2>الحملات المنشورة</h2>
                  </div>
                  <Megaphone aria-hidden="true" />
                </div>
                {campaignQuery.isLoading ? (
                  <div className="ab-loading" aria-label="جارٍ تحميل الحملات"><span /><span /><span /></div>
                ) : campaignQuery.isError ? (
                  <div className="ab-empty-state ab-error-state">
                    <p>تعذر تحميل الحملات المنشورة. لم نعرض حملات بديلة أو بيانات غير موثقة.</p>
                    <button type="button" onClick={() => void campaignQuery.refetch()}>
                      إعادة المحاولة
                    </button>
                  </div>
                ) : campaigns.length ? (
                  <div className="ab-campaign-grid">
                    {campaigns.map((campaign) => (
                      <Link
                        key={campaign.id}
                        href={`/campaigns/${campaign.id}`}
                        className="ab-campaign-card"
                      >
                        {campaign.image ? (
                          <img src={campaign.image} alt={campaign.title} loading="lazy" />
                        ) : (
                          <div className="ab-campaign-placeholder">
                            <Megaphone aria-hidden="true" />
                          </div>
                        )}
                        <div className="ab-campaign-card-body">
                          <p className="ab-card-kicker"><span className="ab-status-dot" />حملة منشورة</p>
                          <h3>{campaign.title}</h3>
                          {campaign.subtitle && <p>{campaign.subtitle}</p>}
                          <span className="ab-text-link">
                            تفاصيل الحملة <ArrowLeft aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="ab-empty-state">
                    <span className="ab-empty-mark"><Megaphone aria-hidden="true" /></span>
                    <h3>لا توجد حملات منشورة حالياً</h3>
                    <p>
                      نعرض الحملات بعد اعتمادها ونشرها باسم الجمعية. لا نستبدلها بحملات قديمة أو مبالغ غير موثقة.
                    </p>
                  </div>
                )}
              </div>

              <div className="ab-list-heading ab-programs-heading">
                <div>
                  <p className="ab-section-eyebrow">أهداف الجمعية التعليمية</p>
                  <h2>مجالات التعليم</h2>
                </div>
                <p>معلومات تعريفية عن رسالة الجمعية، لا تمثل حملات جمع مالي أو أهداف تمويل.</p>
              </div>
              <div className="ab-program-list">
                {programs.map((program, index) => {
                  const Icon = program.icon;
                  return (
                    <Link
                      key={program.id}
                      href={`/campaigns/${program.id}`}
                      className="ab-program-card"
                    >
                      <span className="ab-program-card-top">
                        <span className="ab-program-icon"><Icon aria-hidden="true" /></span>
                        <span>0{index + 1}</span>
                      </span>
                      <span className="ab-card-kicker">برنامج تعليمي</span>
                      <span className="ab-program-card-title">{program.title}</span>
                      <span className="ab-program-card-copy">{program.description}</span>
                      <span className="ab-text-link">
                        تفاصيل البرنامج <ArrowLeft aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="ab-bottom-notice">
                <div>
                  <ShieldCheck aria-hidden="true" />
                  <p>لا تُقبل المساهمات حالياً. ستُعلن قنوات الدفع بعد اكتمال اعتمادها الرسمي.</p>
                </div>
                <Link href="/donate" className="ab-button ab-button-green">
                  حالة قنوات التبرع <ArrowLeft aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
