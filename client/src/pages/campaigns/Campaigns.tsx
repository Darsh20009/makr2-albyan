import { Link } from "wouter";
import { ArrowLeft, BookOpen, CircleAlert, ShieldCheck } from "lucide-react";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";
import "../DonationHome.css";

function formatSar(value: number) {
  return `${value.toLocaleString("en-US")} ريال`;
}

export default function Campaigns() {
  const { campaigns, isLoading, error } = useCampaigns();
  const activeCampaigns = campaigns?.filter((campaign) => campaign.status === "active") || [];

  useSEO({
    title: "حملات مقارئ البيان",
    description: "الحملات النشطة المنشورة من جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية.",
    image: "/images/albayan-quran-learning.jpg",
  });

  return (
    <div className="ab-campaigns-page" dir="rtl">
      <Navbar />
      <main>
        <section className="ab-campaigns-hero">
          <div className="ab-wide">
            <p className="ab-section-index">مقارئ البيان · فرص العطاء</p>
            <h1>حملات منشورة،<br /><em>بأرقامها الحقيقية.</em></h1>
            <p>تُعرض هنا الحملات النشطة وبيانات التمويل كما وردت من سجل الحملة. لا نضيف أهدافاً أو مبالغ تقديرية.</p>
            <div className="ab-campaigns-trust"><ShieldCheck aria-hidden="true" /> قنوات التبرع قيد الاعتماد. لا تُقبل المدفوعات حالياً.</div>
          </div>
        </section>
        <section className="ab-campaigns-content">
          <div className="ab-wide">
            <div className="ab-campaigns-title-row">
              <div>
                <span className="ab-section-index">الحملات النشطة</span>
                <h2>تفاصيل التمويل</h2>
              </div>
              <Link className="ab-campaigns-text-link" href="/">العودة للرئيسية <ArrowLeft aria-hidden="true" /></Link>
            </div>
            {isLoading ? (
              <div className="ab-campaigns-grid" aria-label="جارٍ تحميل الحملات">
                {[1, 2, 3].map((item) => <div className="ab-campaigns-skeleton" key={item} />)}
              </div>
            ) : error ? (
              <div className="ab-campaigns-empty" role="alert">
                <CircleAlert aria-hidden="true" />
                <div>
                  <h3>تعذر تحميل الحملات</h3>
                  <p>لم نعرض بيانات بديلة. يرجى المحاولة لاحقاً أو زيارة الصفحة الرئيسية للتعرّف على برامج الجمعية.</p>
                  <Link className="ab-campaigns-text-link" href="/">الرئيسية <ArrowLeft aria-hidden="true" /></Link>
                </div>
              </div>
            ) : activeCampaigns.length ? (
              <div className="ab-campaigns-grid">
                {activeCampaigns.map((campaign) => {
                  const hasTarget = typeof campaign.goalAmount === "number" && campaign.goalAmount > 0;
                  const hasCollected = typeof campaign.currentAmount === "number" && campaign.currentAmount >= 0;
                  const progress = hasTarget && hasCollected
                    ? Math.min(100, (campaign.currentAmount / campaign.goalAmount) * 100)
                    : 0;
                  const id = campaign._id || campaign.id || "";
                  const title = campaign.titleAr || campaign.title;
                  const description = campaign.descriptionAr || campaign.description;
                  return (
                    <article className="ab-campaign-list-card" key={id}>
                      {campaign.image ? (
                        <img className="ab-campaign-list-image" src={campaign.image} alt={title} loading="lazy" />
                      ) : (
                        <div className="ab-campaign-list-image ab-campaign-list-placeholder" aria-hidden="true"><BookOpen /></div>
                      )}
                      <div className="ab-campaign-list-body">
                        <span className="ab-campaign-list-label">حملة نشطة منشورة</span>
                        <h3>{title}</h3>
                        {description && <p className="ab-campaign-list-description">{description}</p>}
                        {hasTarget ? (
                          <div className="ab-campaign-list-funding">
                            <div><span>الهدف</span><strong>{formatSar(campaign.goalAmount)}</strong></div>
                            {hasCollected ? (
                              <>
                                <div><span>المبلغ المحصّل</span><strong>{formatSar(campaign.currentAmount)}</strong></div>
                                <div
                                  className="ab-campaign-meter"
                                  role="progressbar"
                                  aria-label={`نسبة إنجاز ${title}`}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-valuenow={Math.round(progress)}
                                >
                                  <span style={{ width: `${progress}%` }} />
                                </div>
                                <p>المتبقي {formatSar(Math.max(0, campaign.goalAmount - campaign.currentAmount))}</p>
                              </>
                            ) : (
                              <p>لا تتوفر قيمة التحصيل في بيانات الحملة حالياً.</p>
                            )}
                          </div>
                        ) : (
                          <p className="ab-campaign-list-unannounced">لم يُعلن عن هدف مالي لهذه الحملة.</p>
                        )}
                        <Link className="ab-campaign-detail-link" href={`/campaigns/${id}`}>
                          <span>عرض تفاصيل الحملة</span><ArrowLeft aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="ab-campaigns-empty">
                <div className="ab-campaigns-empty-icon"><BookOpen aria-hidden="true" /></div>
                <div>
                  <span className="ab-section-index">الحالة الحالية</span>
                  <h3>لا توجد حملات نشطة منشورة حالياً</h3>
                  <p>ستظهر الحملات هنا بعد نشرها رسمياً. لا نعرض حملات قديمة أو مبالغ تمويل غير موثقة.</p>
                  <Link className="ab-campaign-detail-link" href="/about">
                    <span>تعرّف على رسالة الجمعية</span><ArrowLeft aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
