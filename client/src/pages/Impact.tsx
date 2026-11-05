import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, GraduationCap, ShieldCheck, Users, UserRound } from "lucide-react";
import { albayanAssociation, attachedReportSnapshot } from "@/lib/albayan-donation-facts";
import "./DonationHome.css";

const PROGRAM_COUNTS = [
  { label: "مسار الحفظ", count: 1370, icon: BookOpen },
  { label: "إجازة حفص", count: 805, icon: GraduationCap },
  { label: "إجازة القراءات", count: 231, icon: BookOpen },
  { label: "تصحيح التلاوة", count: 881, icon: BookOpen },
];

export default function Impact() {
  useSEO({
    title: "أعداد المسجلين في برامج مقارئ البيان",
    description: "أرقام البرامج التعليمية كما وردت في التقرير المنشور لجمعية مقارئ البيان.",
    image: "/images/posters/enrollment-report.jpg",
  });

  return (
    <div className="ab-public" dir="rtl">
      <Navbar />
      <main>
        <section className="ab-page-hero ab-impact-hero">
          <div className="ab-wide">
            <div className="ab-breadcrumb"><Link href="/">الرئيسية</Link><span>/</span><span>التقرير التعليمي</span></div>
            <div className="ab-impact-heading">
              <p className="ab-eyebrow">ملخص التقرير المرفق</p>
              <h1>أثر التعليم<br /><em>في أرقام موثقة.</em></h1>
              <p className="ab-page-hero-copy">لقطة من التقرير التعليمي للجمعية، تُعرض بأمانة مع مصدرها وتاريخها؛ وليست إحصاءات مباشرة.</p>
              <div className="ab-report-meta"><ShieldCheck aria-hidden="true" /> رقم الترخيص <strong dir="ltr">{albayanAssociation.licenseNumber}</strong></div>
            </div>
          </div>
        </section>
        <section className="ab-content-section">
          <div className="ab-wide">
            <div className="ab-report-caveat" role="note">
              <ShieldCheck aria-hidden="true" />
              <p><strong>قراءة الأرقام:</strong> {attachedReportSnapshot.notLiveLabel}. لا تُمثل هذه الصفحة سجلاً مباشراً أو أعداداً محدثة لحظياً.</p>
            </div>
            <div className="ab-summary-grid">
              <article className="ab-summary-card ab-summary-total">
                <span className="ab-summary-icon"><Users aria-hidden="true" /></span>
                <p>إجمالي الدارسين المسجلين</p>
                <strong>{attachedReportSnapshot.registeredLearners.toLocaleString("ar-SA")}</strong>
                <small>بحسب التقرير المرفق</small>
              </article>
              <article className="ab-summary-card">
                <span className="ab-summary-icon"><UserRound aria-hidden="true" /></span>
                <p>الرجال</p>
                <strong>{attachedReportSnapshot.learnerBreakdown[1].value.toLocaleString("ar-SA")}</strong>
                <small>مسجلون في التقرير</small>
              </article>
              <article className="ab-summary-card">
                <span className="ab-summary-icon"><UserRound aria-hidden="true" /></span>
                <p>النساء</p>
                <strong>{attachedReportSnapshot.learnerBreakdown[0].value.toLocaleString("ar-SA")}</strong>
                <small>مسجلات في التقرير</small>
              </article>
            </div>

            <div className="ab-report-section-head">
              <div><p className="ab-section-eyebrow">تفصيل التقرير</p><h2>المسجلون حسب المسار</h2></div>
              <p>الأعداد التالية من التقرير نفسه، وليست أهدافاً مالية أو أعداداً لحظية.</p>
            </div>
            <div className="ab-count-list">
              {PROGRAM_COUNTS.map(({ label, count, icon: Icon }, index) => (
                <article className="ab-count-row" key={label}>
                  <span className="ab-count-index">0{index + 1}</span>
                  <span className="ab-count-icon"><Icon aria-hidden="true" /></span>
                  <h3>{label}</h3>
                  <strong>{count.toLocaleString("ar-SA")}</strong>
                  <span className="ab-count-caption">دارس / دارسة في التقرير</span>
                </article>
              ))}
            </div>

            <div className="ab-source-card">
              <div className="ab-source-copy"><span className="ab-source-seal"><ShieldCheck aria-hidden="true" /></span>
                <div><p className="ab-section-eyebrow">الشفافية والمصدر</p><h2>تقرير تسجيل الحلقات والبرامج القرآنية</h2>
                  <p>تعرف على المصدر المرفق، أو راجع بيانات التسجيل الرسمية للجمعية.</p>
                </div>
              </div>
              <div className="ab-source-actions">
                <a href="/images/posters/enrollment-report.jpg" target="_blank" rel="noreferrer" className="ab-button ab-button-outline">عرض صورة التقرير <ArrowLeft aria-hidden="true" /></a>
                <Link href="/governance/disclosure" className="ab-text-link">الإفصاح <ArrowLeft aria-hidden="true" /></Link>
              </div>
            </div>
            <div className="ab-impact-bottom">
              <p>التعليم هو رسالتنا؛ وتبقى الأرقام هنا مرتبطة بمصدرها.</p>
              <Link href="/campaigns" className="ab-text-link">تعرّف إلى البرامج <ArrowLeft aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
