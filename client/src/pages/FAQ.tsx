import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";
import { ArrowLeft, ChevronDown, CircleHelp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import "./DonationHome.css";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false);
  const answerId = `faq-answer-${faq.id}`;
  return (
    <article className={`ab-faq-item ${open ? "is-open" : ""}`}>
      <button type="button" aria-expanded={open} aria-controls={answerId} onClick={() => setOpen((value) => !value)}>
        <span className="ab-faq-number">0{index + 1}</span>
        <span className="ab-faq-question">{faq.question}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open && <div className="ab-faq-answer" id={answerId}>{faq.answer}</div>}
    </article>
  );
}

export default function FAQPage() {
  useSEO({
    title: "الأسئلة الشائعة | مقارئ البيان",
    description: "إجابات عن برامج تعلم القرآن الكريم والتلاوة والحفظ في مقارئ البيان",
  });

  const { data: faqs = [], isLoading, isError, refetch } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const response = await fetch("/api/faqs");
      if (!response.ok) throw new Error("تعذر تحميل الأسئلة الشائعة");
      const payload = await response.json();
      return Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
    },
    staleTime: 60_000,
  });

  return (
    <div className="ab-public" dir="rtl">
      <Navbar />
      <main>
        <section className="ab-page-hero ab-faq-hero">
          <div className="ab-wide">
            <div className="ab-breadcrumb"><Link href="/">الرئيسية</Link><span>/</span><span>الأسئلة الشائعة</span></div>
            <div className="ab-faq-hero-content">
              <span className="ab-faq-hero-icon"><CircleHelp aria-hidden="true" /></span>
              <p className="ab-eyebrow">إجابات من المعلومات المعتمدة</p>
              <h1>الأسئلة الشائعة</h1>
              <p className="ab-page-hero-copy">معلومات واضحة عن البرامج، التقارير، وحالة قنوات المساهمة.</p>
            </div>
          </div>
        </section>
        <section className="ab-content-section ab-faq-section">
          <div className="ab-faq-layout">
            <aside className="ab-faq-aside">
              <p className="ab-section-eyebrow">معلومة موثوقة</p>
              <h2>نجيب بوضوح، ونلتزم بما نعرف.</h2>
              <p>المعلومات المتعلقة بالتبرع أو أرقام الأثر لا تُعرض إلا وفق الحالة الفعلية ومصدرها.</p>
              <Link href="/donate" className="ab-text-link">حالة قنوات التبرع <ArrowLeft aria-hidden="true" /></Link>
            </aside>
            <div className="ab-faq-list" aria-live="polite">
              {isLoading ? (
                <div className="ab-faq-skeletons" aria-label="جارٍ تحميل الأسئلة">
                  {[1, 2, 3, 4].map((item) => <div className="ab-faq-skeleton" key={item} />)}
                </div>
              ) : isError ? (
                <div className="ab-empty-state ab-error-state">
                  <h3>تعذر تحميل الأسئلة الآن</h3>
                  <p>يرجى المحاولة مجدداً لاحقاً. لم نعرض إجابات غير موثقة.</p>
                  <button type="button" onClick={() => void refetch()}>إعادة المحاولة</button>
                </div>
              ) : faqs.length === 0 ? (
                <div className="ab-empty-state">
                  <span className="ab-empty-mark"><CircleHelp aria-hidden="true" /></span>
                  <h3>لا توجد أسئلة منشورة حالياً</h3>
                  <p>ستظهر هنا الإجابات المعتمدة عند توفرها.</p>
                </div>
              ) : (
                faqs.map((faq, index) => <FAQItem key={faq.id} faq={faq} index={index} />)
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
