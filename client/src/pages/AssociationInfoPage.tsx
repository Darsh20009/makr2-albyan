import { ArrowLeft, BookOpen, Building2, FileText, Landmark, ShieldCheck, Users } from "lucide-react";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { albayanAssociation, associationObjectives } from "@/lib/albayan-donation-facts";
import { useSEO } from "@/hooks/use-seo";

export type AssociationPageKey =
  | "overview"
  | "history"
  | "vision"
  | "goals"
  | "founders"
  | "board"
  | "financials"
  | "policies"
  | "committees"
  | "ethics"
  | "disclosure"
  | "satisfaction"
  | "executive";

type Fact = { label: string; value: string };
type PageContent = {
  title: string;
  intro: string;
  facts?: Fact[];
  sections?: { title: string; body: string }[];
  note?: string;
  document?: { href: string; label: string };
};

const aboutLinks = [
  { href: "/about/history", label: "نشأة الجمعية", icon: Building2 },
  { href: "/about/vision", label: "الرؤية والرسالة", icon: BookOpen },
  { href: "/about/goals", label: "الأهداف", icon: ShieldCheck },
  { href: "/about/founders", label: "المؤسسون", icon: Users },
  { href: "/about/board", label: "مجلس الإدارة", icon: Landmark },
  { href: "/programs", label: "البرامج", icon: BookOpen },
];

const content: Record<Exclude<AssociationPageKey, "overview">, PageContent> = {
  history: {
    title: "نشأة الجمعية",
    intro: "جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية جمعية أهلية مسجلة في منطقة الرياض، ومقرها الرئيسي مدينة الرياض.",
    facts: [
      { label: "تاريخ التسجيل", value: "31 مارس 2026" },
      { label: "رقم الترخيص", value: albayanAssociation.licenseNumber },
      { label: "رقم قرار التسجيل", value: albayanAssociation.registrationDecision },
      { label: "المقر الرئيسي", value: "مدينة الرياض" },
    ],
    sections: [
      { title: "مجال العمل", body: "تتمحور رسالة الجمعية حول تعليم القرآن الكريم، ودعم برامج التلاوة والحفظ وتصحيح القراءة للناطقين بغير العربية." },
    ],
    document: { href: "/documents/albayan-registration-decision.pdf", label: "عرض قرار التسجيل الرسمي" },
  },
  vision: {
    title: "الرؤية والرسالة",
    intro: "توجّه الجمعية برامجها لخدمة تعليم القرآن الكريم، مع عناية بالقيم القرآنية واستمرار التعلم.",
    sections: [
      { title: "الرؤية", body: "استثمار الوقت في عمل نافع ومثمر طيلة العام." },
      { title: "الرسالة", body: "غرس القيم والأخلاق القرآنية، وتنمية الأخلاق الحميدة المستمدة من القرآن الكريم." },
    ],
  },
  goals: {
    title: "الأهداف",
    intro: "الأهداف التالية من اللائحة الأساسية لجمعية مقارئ البيان، وتوضح إطار عملها التعليمي.",
    sections: associationObjectives.map((body, index) => ({ title: `الهدف ${index + 1}`, body })),
    note: "هذا ملخص للأهداف الواردة في اللائحة الأساسية، وليس تقريراً عن نسب الإنجاز.",
  },
  founders: {
    title: "المؤسسون",
    intro: "قام تأسيس الجمعية على خدمة تعليم القرآن الكريم للناطقين بغير العربية، ثم صدر قرار تسجيلها في منطقة الرياض.",
    facts: [
      { label: "الاسم النظامي", value: albayanAssociation.legalName },
      { label: "قرار التسجيل", value: albayanAssociation.registrationDecision },
      { label: "رقم الترخيص", value: albayanAssociation.licenseNumber },
    ],
    note: "لا ننشر أسماء الأفراد أو أرقام هوياتهم في هذه الصفحة. يمكن التحقق من تسجيل الجمعية من خلال الوثيقة الرسمية.",
    document: { href: "/documents/albayan-registration-decision.pdf", label: "عرض قرار التسجيل الرسمي" },
  },
  board: {
    title: "مجلس الإدارة",
    intro: "وافق المركز الوطني لتنمية القطاع غير الربحي على تشكيل مجلس الإدارة في دورته الأولى.",
    facts: [
      { label: "عدد أعضاء الدورة الأولى", value: "خمسة أعضاء" },
      { label: "مدة الدورة", value: "أربع سنوات" },
      { label: "مرجع خطاب التشكيل", value: "PTEB048384" },
      { label: "تاريخ الخطاب", value: "12 شوال 1447هـ" },
    ],
    note: "حفاظاً على الخصوصية، لا تُعرض الأسماء أو أرقام الهويات الشخصية في الموقع.",
  },
  financials: {
    title: "القوائم المالية",
    intro: "توضح اللائحة الأساسية مسؤولية الجمعية عن إعداد التقارير المالية ومراجعتها ورفع الحساب الختامي بعد اعتماده.",
    sections: [
      { title: "النشر المالي", body: "لا توجد في الملفات المتاحة حالياً قوائم مالية معتمدة للنشر العام. لذلك لا نعرض أرقاماً تقديرية على أنها نتائج مالية رسمية." },
      { title: "التحديث", body: "ستُضاف القوائم والتقارير إلى هذه الصفحة عند توفر نسخة منشورة ومعتمدة." },
    ],
  },
  policies: {
    title: "السياسات واللوائح",
    intro: "تعمل الجمعية وفق لائحتها الأساسية والأنظمة المنظمة للجمعيات الأهلية في المملكة العربية السعودية.",
    sections: [
      { title: "ملخص تنظيمي", body: "تحدد اللائحة أجهزة الجمعية واختصاصات الجمعية العمومية ومجلس الإدارة، كما تنظم العضوية واللجان والتقارير الدورية." },
      { title: "الوثائق المعتمدة", body: "لا نعرض نسخة كاملة من اللائحة أو سياسات داخلية هنا. تُنشر الوثائق العامة بعد التحقق من اعتمادها وخلوها من البيانات الشخصية." },
    ],
  },
  committees: {
    title: "اللجان",
    intro: "تجيز اللائحة الأساسية تشكيل لجان دائمة أو مؤقتة، ويحدد قرار تشكيل كل لجنة اختصاصها ومهامها.",
    sections: [
      { title: "الاختصاصات", body: "تعمل اللجان ضمن المهام التي يعتمدها مجلس الإدارة أو الجمعية العمومية، وترفع ما يلزم من توصيات وتقارير." },
      { title: "التشكيلات الحالية", body: "لم تتوفر ضمن الملفات العامة المعتمدة أسماء أو قرارات تشكيل لجان حالية للنشر في هذه الصفحة." },
    ],
  },
  ethics: {
    title: "الميثاق الأخلاقي",
    intro: "تلتزم الجمعية بمبادئ النزاهة والشفافية واحترام المستفيدين وحماية بياناتهم والالتزام بالأنظمة ذات العلاقة.",
    sections: [
      { title: "التعامل المسؤول", body: "تُقدّم خدمات الجمعية باحترام ووضوح، مع مراعاة خصوصية المتبرعين والدارسين والمستفيدين." },
      { title: "الوثيقة المعتمدة", body: "هذا عرض تعريفي للمبادئ العامة، وليس بديلاً عن نسخة ميثاق أخلاقي معتمدة. ستُنشر النسخة الرسمية عند توفرها." },
    ],
  },
  disclosure: {
    title: "الإفصاح والشفافية",
    intro: "نحرص على عرض بيانات التسجيل الرسمية بوضوح، ونفصل بين المعلومات الموثقة والأرقام التاريخية الواردة في التقارير.",
    facts: [
      { label: "الاسم النظامي", value: albayanAssociation.legalName },
      { label: "رقم الترخيص", value: albayanAssociation.licenseNumber },
      { label: "رقم قرار التسجيل", value: albayanAssociation.registrationDecision },
      { label: "المقر", value: "مدينة الرياض، المملكة العربية السعودية" },
    ],
    note: "رمز QR في قرار التسجيل مخصص للتحقق من قرار التسجيل، ولا يثبت إحصاءات البرامج أو التبرعات.",
    document: { href: "/documents/albayan-registration-decision.pdf", label: "تحقق من قرار التسجيل" },
  },
  satisfaction: {
    title: "قياس الرضا",
    intro: "تساعد آراء الدارسين والمتبرعين والشركاء على تحسين تجربة التعلم والتواصل والخدمات.",
    sections: [
      { title: "المشاركة", body: "نموذج قياس الرضا الإلكتروني غير متاح حالياً. سنضيفه بعد اعتماد أسئلته وآلية التعامل مع الردود." },
      { title: "الخصوصية", body: "لا تُعرض ردود الأفراد أو معلوماتهم الشخصية في تقارير الموقع العامة." },
    ],
  },
  executive: {
    title: "المسؤول التنفيذي",
    intro: "تنص اللائحة الأساسية على تعيين المسؤول التنفيذي بقرار من مجلس الإدارة، مع تحديد المهام والصلاحيات والمسؤوليات.",
    sections: [
      { title: "المعلومات المنشورة", body: "لم يتوفر ضمن الوثائق العامة المرفقة اسم معتمد أو قرار تعيين للنشر، لذلك لا نعرض اسماً غير موثق." },
    ],
  },
};

export default function AssociationInfoPage({ pageKey }: { pageKey: AssociationPageKey }) {
  const isOverview = pageKey === "overview";
  const page = isOverview ? null : content[pageKey];
  const title = isOverview ? "عن الجمعية" : page!.title;
  const description = isOverview
    ? `تعرف على ${albayanAssociation.legalName} ورؤيتها وأهدافها وحوكمتها.`
    : page!.intro;
  useSEO({ title: `${title} | مقارئ البيان`, description, image: "/images/albayan-official-logo.png" });

  return (
    <div className="min-h-screen bg-[#f8f6ef] text-[#173c35]" dir="rtl">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-[#103f35] px-5 py-14 text-white sm:py-20">
          <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full border border-white/10 shadow-[0_0_0_30px_rgba(255,255,255,.025),0_0_0_60px_rgba(255,255,255,.02)]" />
          <div className="relative mx-auto max-w-6xl">
            <p className="mb-3 text-xs font-bold text-[#e5d19a]">مقارئ البيان · الرياض</p>
            <h1 className="font-[Cairo] text-3xl font-black leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/80 sm:text-base">{isOverview
              ? "معلومات الجمعية وبرامجها وبياناتها النظامية في مكان واحد."
              : page!.intro}</p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <nav aria-label="مسار الصفحة" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-[#718078]">
            <Link href="/" className="hover:text-[#0d644c]">الرئيسية</Link>
            <span aria-hidden="true">/</span>
            <Link href="/about" className="hover:text-[#0d644c]">عن الجمعية</Link>
            {!isOverview && <><span aria-hidden="true">/</span><span aria-current="page" className="font-bold text-[#173c35]">{title}</span></>}
          </nav>

          {isOverview ? (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {aboutLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="group flex min-h-32 items-center gap-4 rounded-xl border border-[#e2e2d8] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b4c8bb] hover:shadow-md">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#eef3ec] text-[#24664f]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="flex-1 font-extrabold">{label}</span>
                    <ArrowLeft className="h-4 w-4 text-[#9b8650] transition group-hover:-translate-x-1" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <Link href="/governance/disclosure" className="group mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-[#dce3d8] bg-[#eef3ec] p-5 transition hover:border-[#b4c8bb] hover:bg-[#e8efe5] sm:p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white text-[#24664f]"><FileText className="h-5 w-5" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">الحوكمة والشفافية</span>
                  <span className="mt-1 block text-xs leading-6 text-[#637268]">القوائم المالية، السياسات، الإفصاح وبيانات الجمعية الرسمية.</span>
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-extrabold text-[#155a45]">عرض صفحات الحوكمة<ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" aria-hidden="true" /></span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <article className="rounded-xl border border-[#e2e2d8] bg-white p-5 shadow-sm sm:p-8">
                {page!.facts && (
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {page!.facts.map((fact) => (
                      <div key={fact.label} className="rounded-lg bg-[#f6f7f2] p-4">
                        <dt className="text-xs font-bold text-[#738178]">{fact.label}</dt>
                        <dd className="mt-2 text-sm font-extrabold leading-7 text-[#173c35]">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {page!.sections?.length ? (
                  <div className={page!.facts ? "mt-7 space-y-4" : "space-y-4"}>
                    {page!.sections.map((section) => (
                      <section key={section.title} className="rounded-lg border-r-2 border-[#c9ac68] bg-[#fbfaf6] px-4 py-4">
                        <h2 className="font-[Cairo] text-base font-black">{section.title}</h2>
                        <p className="mt-2 text-sm leading-8 text-[#56665c]">{section.body}</p>
                      </section>
                    ))}
                  </div>
                ) : null}
                {page!.document && (
                  <a href={page!.document.href} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#155a45] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#104735]">
                    <FileText className="h-4 w-4" aria-hidden="true" />{page!.document.label}<ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {page!.note && (
                  <aside className="mt-6 flex items-start gap-3 rounded-lg border border-[#e9dfc2] bg-[#fbf7ea] p-4 text-xs leading-7 text-[#6d6247]">
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#9b7c38]" aria-hidden="true" />
                    <p>{page!.note}</p>
                  </aside>
                )}
              </article>

              <aside className="h-fit rounded-xl border border-[#e2e2d8] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#ecebe4] pb-3 font-[Cairo] text-sm font-black">
                  <ShieldCheck className="h-4 w-4 text-[#247255]" aria-hidden="true" />بيانات موثقة
                </div>
                <p className="mt-4 text-xs leading-7 text-[#637268]">جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية.</p>
                <p className="mt-3 text-xs font-bold text-[#43594d]">رقم الترخيص</p>
                <bdi className="mt-1 block text-lg font-black text-[#155a45]">{albayanAssociation.licenseNumber}</bdi>
                <Link href="/governance/disclosure" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#155a45] hover:underline">
                  تفاصيل الإفصاح<ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </aside>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#eaf0e7] p-5 sm:p-6">
            <p className="text-sm font-bold leading-7 text-[#40564a]">ساهم في استمرار تعليم القرآن الكريم ودعم البرامج المنشورة.</p>
            <Link href="/campaigns" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#155a45] px-4 text-sm font-bold text-white hover:bg-[#104735]">
              فرص التبرع<ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
