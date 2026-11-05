import { Link } from "wouter";
import { ArrowLeft, BookOpen, CircleAlert, FileText, MapPin, ShieldCheck } from "lucide-react";
import { albayanAssociation } from "@/lib/albayan-donation-facts";
import "./Footer.css";

const registrationDecision = "/documents/albayan-registration-decision.pdf";

export function Footer() {
  return (
    <footer className="ab-site-footer" dir="rtl">
      <div className="ab-footer-inner">
        <div className="ab-footer-grid">
          <section className="ab-footer-column">
            <h2>تواصل معنا</h2>
            <p className="ab-footer-info-row">
              <MapPin aria-hidden="true" />
              <span>المقر الرئيسي: {albayanAssociation.city}، المملكة العربية السعودية</span>
            </p>
            <Link className="ab-footer-link" href="/faq">
              الأسئلة الشائعة <ArrowLeft aria-hidden="true" />
            </Link>
            <Link className="ab-footer-link" href="/about">
              معلومات الجمعية <ArrowLeft aria-hidden="true" />
            </Link>
          </section>

          <nav className="ab-footer-column" aria-label="طرق التبرع">
            <h2>طرق التبرع</h2>
            <div className="ab-footer-link-list">
              <Link className="ab-footer-link" href="/donate">التبرع السريع</Link>
              <Link className="ab-footer-link" href="/campaigns">فرص التبرع المنشورة</Link>
              <Link className="ab-footer-link" href="/impact">أثر التعليم</Link>
            </div>
            <p className="ab-footer-status">
              <CircleAlert aria-hidden="true" />
              قنوات التبرع قيد الاعتماد
            </p>
          </nav>

          <nav className="ab-footer-column" aria-label="روابط مهمة">
            <h2>روابط مهمة</h2>
            <div className="ab-footer-link-list">
              <Link className="ab-footer-link" href="/about">عن الجمعية</Link>
              <Link className="ab-footer-link" href="/campaigns">المشاريع الحالية</Link>
              <Link className="ab-footer-link" href="/impact">التقرير التعليمي</Link>
              <Link className="ab-footer-link" href="/bylaws">الأهداف النظامية</Link>
              <Link className="ab-footer-link" href="/faq">الأسئلة الشائعة</Link>
            </div>
          </nav>

          <section className="ab-footer-column ab-footer-brand">
            <Link href="/" aria-label="الصفحة الرئيسية لمقارئ البيان">
              <img
                src="/images/albayan-official-logo.png"
                alt={albayanAssociation.legalName}
                className="ab-footer-logo"
              />
            </Link>
            <h2>{albayanAssociation.brandName}</h2>
            <p className="ab-footer-brand-copy">
              {albayanAssociation.legalName}
            </p>
            <p className="ab-footer-mission">
              <BookOpen aria-hidden="true" />
              تعليم القرآن الكريم للناطقين بغير العربية
            </p>
            <div className="ab-footer-registration">
              <ShieldCheck aria-hidden="true" />
              <span>
                ترخيص <b dir="ltr">{albayanAssociation.licenseNumber}</b>
                <span className="ab-footer-registration-decision">
                  قرار التسجيل <b dir="ltr">{albayanAssociation.registrationDecision}</b>
                </span>
              </span>
            </div>
            <a className="ab-footer-document-link" href={registrationDecision} target="_blank" rel="noreferrer">
              <FileText aria-hidden="true" />
              عرض وثيقة التسجيل
              <ArrowLeft aria-hidden="true" />
            </a>
          </section>
        </div>

        <div className="ab-footer-bottom">
          <span>© {new Date().getFullYear()} {albayanAssociation.brandName} · جميع الحقوق محفوظة</span>
          <Link href="/donate">حالة قنوات التبرع</Link>
        </div>
      </div>
    </footer>
  );
}
