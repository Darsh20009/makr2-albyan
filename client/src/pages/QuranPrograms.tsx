import { Link, useParams } from "wouter";
import { ArrowLeft, BookOpen, ChevronLeft, CircleAlert, GraduationCap, HeartHandshake } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";
import { quranPrograms } from "@shared/quran-programs";
import "./QuranPrograms.css";

export default function QuranPrograms() {
  const { slug } = useParams<{ slug?: string }>();
  const program = slug ? quranPrograms.find((item) => item.slug === slug) : undefined;
  const learningPrograms = quranPrograms.filter((item) => item.slug !== "support-quran");
  const supportProgram = quranPrograms.find((item) => item.slug === "support-quran");
  const notFound = Boolean(slug && !program);

  useSEO({
    title: notFound ? "الصفحة غير موجودة" : program?.title ?? "برامج تعليم القرآن الكريم",
    description: program?.description ?? "تعرف على مجالات حفظ القرآن الكريم وتصحيح التلاوة لدى جمعية مقارئ البيان، واقرأ المعلومات التعريفية وشروط متابعة إعلانات التسجيل.",
    url: program ? `/programs/${program.slug}` : slug ? `/programs/${encodeURIComponent(slug)}` : "/programs",
  });

  return (
    <div className="qp-page" dir="rtl" lang="ar">
      <Navbar />
      <main id="main-content">
        <nav className="qp-container qp-breadcrumb" aria-label="مسار التصفح">
          <Link href="/">الرئيسية</Link>
          <ChevronLeft aria-hidden="true" />
          {slug ? (
            <>
              <Link href="/programs">برامج تعليم القرآن</Link>
              <ChevronLeft aria-hidden="true" />
              <span aria-current="page">{program?.title ?? "الصفحة غير موجودة"}</span>
            </>
          ) : <span aria-current="page">برامج تعليم القرآن</span>}
        </nav>

        {notFound ? (
          <div className="qp-container qp-content">
            <section className="qp-not-found">
              <BookOpen aria-hidden="true" />
              <h1>هذه الصفحة غير موجودة</h1>
              <p>يمكنك العودة إلى دليل البرامج للاطلاع على المعلومات التعريفية المتاحة.</p>
              <Link href="/programs" className="qp-button">العودة إلى البرامج <ArrowLeft aria-hidden="true" /></Link>
            </section>
          </div>
        ) : (
          <>
            <header className="qp-hero">
              <div className="qp-container qp-hero-inner">
                <div className="qp-hero-copy">
                  <p className="qp-eyebrow">{program?.slug === "support-quran" ? "دليل المساهمة" : "دليل البرامج التعليمية"}</p>
                  <h1>{program?.title ?? "برامج تعليم القرآن الكريم"}</h1>
                  <p>{program?.description ?? "تعرف على مجالات تعليم القرآن الكريم لدى جمعية مقارئ البيان للناطقين بغير العربية، واقرأ المعلومات التعريفية قبل متابعة إعلانات التسجيل."}</p>
                </div>
                <aside className="qp-hero-note" aria-label="تنبيه حول طبيعة الصفحة">
                  <CircleAlert aria-hidden="true" />
                  <strong>{program?.slug === "support-quran" ? "تحقق قبل المساهمة" : "للتعريف، وليس للتسجيل"}</strong>
                  <p>{program?.slug === "support-quran"
                    ? "وجود مشروع منشور لا يعني فتح استقبال التبرعات. راجع حالة القنوات الرسمية قبل إرسال أي مبلغ."
                    : "هذه الصفحات لا تعلن فتح التسجيل ولا تضمن مقعدًا دراسيًا. تُراجع المواعيد والشروط في إعلانات البرامج الرسمية."}</p>
                </aside>
              </div>
            </header>

            <div className="qp-container qp-content">
              {program ? (
                <>
                  <div className="qp-detail-layout">
                    <article aria-label={program.title}>
                      {program.sections.map((section, index) => (
                        <section className="qp-detail-section" key={section.title} id={`program-section-${index}`}>
                          <h2>{section.title}</h2>
                          <p>{section.text}</p>
                        </section>
                      ))}
                      <Link href="/programs" className="qp-text-link">جميع البرامج والأدلة <ArrowLeft aria-hidden="true" /></Link>
                    </article>
                    <nav className="qp-sidebar" aria-label="في هذه الصفحة">
                      <h2>في هذه الصفحة</h2>
                      {program.sections.map((section, index) => (
                        <a key={section.title} href={`#program-section-${index}`}>{section.title}</a>
                      ))}
                    </nav>
                  </div>
                  <section className="qp-related" aria-labelledby="qp-related-title">
                    <h2 className="qp-heading" id="qp-related-title">اقرأ أيضًا</h2>
                    <div className="qp-actions">
                      {quranPrograms.filter((item) => item.slug !== program.slug).map((item) => (
                        <Link href={`/programs/${item.slug}`} className="qp-button qp-button-secondary" key={item.slug}>
                          {item.title}<ArrowLeft aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section aria-labelledby="qp-learning-title">
                    <h2 className="qp-heading" id="qp-learning-title">مجالات تعليم القرآن</h2>
                    <div className="qp-program-list">
                      {learningPrograms.map((item) => (
                        <article className="qp-program" key={item.slug}>
                          <span className="qp-program-icon" aria-hidden="true">{item.slug === "hifz" ? <BookOpen /> : <GraduationCap />}</span>
                          <div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                          </div>
                          <Link className="qp-text-link" href={`/programs/${item.slug}`} aria-label={`التعرف على ${item.title}`}>
                            تعرف على المجال <ArrowLeft aria-hidden="true" />
                          </Link>
                        </article>
                      ))}
                    </div>
                  </section>
                  {supportProgram && (
                    <section className="qp-support" aria-labelledby="qp-support-title">
                      <div>
                        <p className="qp-label">لمن يرغب في المساهمة</p>
                        <h2 id="qp-support-title">{supportProgram.title}</h2>
                        <p>{supportProgram.description}</p>
                        <p>دليل المساهمة منفصل عن المعلومات التعليمية والتسجيل في البرامج.</p>
                      </div>
                      <Link href={`/programs/${supportProgram.slug}`} className="qp-button qp-button-secondary">
                        <HeartHandshake aria-hidden="true" /> اقرأ دليل الدعم
                      </Link>
                    </section>
                  )}
                </>
              )}

              <section className="qp-support" aria-labelledby="qp-next-title">
                <div>
                  <p className="qp-label">خطوتك التالية</p>
                  <h2 id="qp-next-title">تعرف على الجمعية، ثم اختر وجهتك</h2>
                  <p>للمعلومات التعليمية، راجع التعريف بالجمعية. وللمساهمة المالية، اقرأ المشاريع المنشورة وتحقق من حالة قنوات التبرع الرسمية؛ لا ترسل مبلغًا قبل اعتمادها.</p>
                  <div className="qp-actions">
                    <Link href="/about" className="qp-button">عن الجمعية <ArrowLeft aria-hidden="true" /></Link>
                    <Link href="/campaigns" className="qp-button qp-button-secondary">المشاريع المنشورة</Link>
                    <Link href="/donate" className="qp-button qp-button-secondary">حالة قنوات التبرع</Link>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
