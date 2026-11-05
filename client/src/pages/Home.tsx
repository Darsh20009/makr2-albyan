import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Globe2,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";
import { albayanAssociation, associationObjectives, attachedReportSnapshot } from "@/lib/albayan-donation-facts";

const stories = [
  {
    src: "/videos/albayan-donation-story-1.mp4",
    poster: "/images/posters/education-impact.png",
    title: "كل تبرع.. أثر دائم",
  },
  {
    src: "/videos/albayan-donation-story-2.mp4",
    poster: "/images/posters/knowledge-impact.png",
    title: "صدقة جارية في كل آية تعلّم",
  },
];

function StoryVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  return (
    <div className="story-video relative overflow-hidden rounded-[1.4rem] bg-[#173c35]">
      <video
        className="aspect-video w-full object-cover"
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={title}
      >
        <source src={src} type="video/mp4" />
      </video>
      <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#f5f1e6]/90 px-3 py-1.5 text-xs font-bold text-[#173c35]">
        <Video className="h-3.5 w-3.5" /> مقطع توعوي
      </span>
    </div>
  );
}

function ReportFigures() {
  const women = attachedReportSnapshot.learnerBreakdown[0];
  const men = attachedReportSnapshot.learnerBreakdown[1];
  const womenPercent = Math.round((women.value / attachedReportSnapshot.registeredLearners) * 100);
  return (
    <section className="relative overflow-hidden bg-[#173c35] px-5 py-20 text-[#f5f1e6] sm:px-8 md:py-28" aria-labelledby="report-heading">
      <div className="islamic-pattern pointer-events-none absolute inset-0 opacity-25" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-black tracking-[.2em] text-[#d5b66f]">أثرٌ موثّق في تقرير مرفق</p>
          <h2 id="report-heading" className="max-w-xl text-3xl font-black leading-[1.5] sm:text-4xl">
            وراء كل رقم، قارئٌ يتعلّم.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-8 text-white/70 sm:text-base">
            هذه الأرقام من ملخص التقرير المرفق، وليست إحصاءات مباشرة أو مؤشرات لحظية.
            نعرضها كما وردت، لتبقى الثقة واضحة مثل الغاية.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70">
            <ShieldCheck className="h-4 w-4 text-[#d5b66f]" /> {attachedReportSnapshot.notLiveLabel}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.6rem] border border-white/15 bg-white/[.06] p-6 sm:col-span-2 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-white/65">دارس مسجل في التقرير</p>
                <p className="mt-2 text-5xl font-black tracking-tight sm:text-6xl" dir="ltr">
                  {attachedReportSnapshot.registeredLearners.toLocaleString("en-US")}
                </p>
              </div>
              <BookOpen className="mb-2 h-10 w-10 text-[#d5b66f]" strokeWidth={1.4} />
            </div>
            <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/15" role="img" aria-label={`توزيع الدارسين في التقرير: النساء ${women.value.toLocaleString("en-US")} والرجال ${men.value.toLocaleString("en-US")}`}>
              <div className="h-full rounded-full bg-[#d5b66f]" style={{ width: `${womenPercent}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs text-white/70">
              <span>{women.label}: {women.value.toLocaleString("en-US")}</span>
              <span>{men.label}: {men.value.toLocaleString("en-US")}</span>
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-white/15 bg-white/[.06] p-6 sm:p-8">
            <Users className="h-6 w-6 text-[#d5b66f]" strokeWidth={1.6} />
            <p className="mt-5 text-4xl font-black" dir="ltr">{attachedReportSnapshot.volunteerTeachers}</p>
            <p className="mt-1 text-sm text-white/70">معلمًا ومعلمة متطوعين</p>
          </div>
          <div className="rounded-[1.6rem] border border-white/15 bg-white/[.06] p-6 sm:p-8">
            <Globe2 className="h-6 w-6 text-[#d5b66f]" strokeWidth={1.6} />
            <p className="mt-5 text-4xl font-black" dir="ltr">&gt;{attachedReportSnapshot.countriesMoreThan}</p>
            <p className="mt-1 text-sm text-white/70">دولة حول العالم</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useSEO({
    title: `${albayanAssociation.brandName} | المساهمة في تعليم القرآن`,
    description: "تعرّف على جمعية مقارئ البيان وأثرها الموثق، وتابع حالة قنوات المساهمة الرسمية.",
    image: "/images/albayan-official-logo.png",
  });

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#f5f1e6] text-[#193c36]" dir="rtl">
      <Navbar />
      <main>
        <section className="relative px-5 pb-20 pt-10 sm:px-8 md:pb-28 md:pt-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.04fr_.96fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .7, ease: [.2, .7, .2, 1] }}
              className="relative z-10"
            >
      <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#a66e3c]/20 bg-[#efe5d2] px-4 py-2 text-xs font-bold text-[#7e542f]">
                <span className="h-2 w-2 rounded-full bg-[#b17740]" />
                جمعية أهلية مسجلة في الرياض
              </div>
              <p className="mb-4 text-sm font-bold tracking-wide text-[#997042]">بابٌ للعلم، مفتوحٌ لكل لسان</p>
              <h1 className="max-w-3xl text-[2.8rem] font-black leading-[1.34] tracking-tight text-[#173c35] sm:text-6xl lg:text-[4.4rem]">
                ساهم في أن
                <span className="relative mt-1 block text-[#0b7660]">
                  يصل القرآن أبعد.
                  <svg className="absolute -bottom-2 right-0 h-3 w-48 text-[#c79b4b]" viewBox="0 0 192 12" fill="none" aria-hidden="true">
                    <path d="M2 9C49 2 125 1 190 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-[#536c64] sm:text-lg">
                {albayanAssociation.legalName}، جمعية مقرها الرياض، تعلّم التلاوة والحفظ للناطقين بغير العربية.
                مساهمتك تنتظر القنوات الرسمية؛ لا نقبل الدفع قبل اعتمادها.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/donate" className="group inline-flex min-h-14 items-center gap-4 rounded-full bg-[#0b7660] px-7 text-sm font-black text-[#fffaf0] shadow-[0_12px_30px_rgba(11,118,96,.2)] transition-transform duration-300 hover:-translate-y-1 hover:bg-[#075d4e]">
                  حالة المساهمة
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:-translate-x-1">
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                </Link>
              </div>
              <div className="mt-9 flex items-center gap-3 border-t border-[#173c35]/10 pt-5 text-xs leading-6 text-[#668077]">
                <img src="/images/albayan-mark.svg" alt="" className="h-10 w-10 rounded-xl" />
                <span>تعليمٌ قرآني للناطقين بغير العربية<br />مقر الجمعية: {albayanAssociation.city}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: .96, x: -14 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: .8, delay: .1, ease: [.2, .7, .2, 1] }}
              className="relative mx-auto w-full max-w-[620px]"
            >
              <div className="hero-orbit absolute -left-6 -top-8 hidden h-44 w-44 rounded-full border border-[#c79b4b]/45 md:block" />
              <div className="hero-art relative min-h-[360px] overflow-hidden rounded-[2rem] bg-[#0b7660] px-7 py-10 shadow-[0_26px_70px_rgba(25,60,54,.18)] sm:min-h-[470px] sm:px-12">
                <div className="absolute inset-0 opacity-25" aria-hidden="true">
                  <div className="islamic-pattern absolute inset-0" />
                </div>
                <div className="absolute -left-16 bottom-[-100px] h-72 w-72 rounded-full border border-[#d5b66f]/30" />
                <div className="absolute -left-6 bottom-[-58px] h-52 w-52 rounded-full border border-[#d5b66f]/25" />
                <div className="relative flex h-full min-h-[280px] flex-col justify-between sm:min-h-[390px]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] font-bold tracking-[.12em] text-white/75">مقارئ البيان · الرياض</span>
                    <img src="/images/albayan-mark.svg" alt="علامة مقارئ البيان" className="h-14 w-14 rounded-2xl shadow-lg" />
                  </div>
                  <div className="py-10 text-center">
                    <p className="font-serif text-6xl leading-none text-[#f0d391] sm:text-8xl" aria-hidden="true">اقرأ</p>
                    <div className="mx-auto mt-5 h-px w-20 bg-[#d5b66f]/75" />
                    <p className="mt-5 text-sm font-semibold tracking-wide text-white/85 sm:text-base">تعليم القرآن الكريم بلغةٍ تصل إليك</p>
                  </div>
                  <div className="flex items-end justify-between gap-3 border-t border-white/20 pt-5">
                    <p className="max-w-[220px] text-xs leading-6 text-white/65">علمٌ يُتعلّم بهدوء، وأثرٌ يمتد عبر اللغات.</p>
                    <BookOpen className="h-8 w-8 shrink-0 text-[#f0d391]" strokeWidth={1.4} />
                  </div>
                </div>
              </div>
              <div className="relative mt-4 flex items-center gap-3 rounded-2xl border border-[#e3dccb] bg-[#fbf8ef] px-4 py-3 text-xs text-[#557068] sm:absolute sm:-bottom-5 sm:right-[-1rem] sm:mt-0 sm:max-w-[260px] sm:shadow-[0_12px_32px_rgba(25,60,54,.1)]">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#0b7660]" />
                <span>قنوات التبرع غير مفعّلة حاليًا، بانتظار اعتمادها رسميًا.</span>
              </div>
            </motion.div>
          </div>
        </section>

        <ReportFigures />

        <section className="bg-[#ede4d1] px-5 py-16 sm:px-8 md:py-20" aria-labelledby="mission-heading">
          <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-black tracking-[.18em] text-[#997042]">الغاية الخيرية</p>
              <h2 id="mission-heading" className="max-w-xl text-3xl font-black leading-[1.45] text-[#193c36] sm:text-4xl">
                تعليم القرآن الكريم للناطقين بغير العربية.
              </h2>
            </div>
            <div className="rounded-[1.6rem] border border-[#c8b995]/60 bg-[#f5f1e6]/75 p-6 sm:p-8">
              <p className="text-sm leading-8 text-[#536c64] sm:text-base">
                تتمثل غاية الجمعية في {associationObjectives[2]}، و{associationObjectives[3]}، وإعداد المعلمين للعمل في حلقات القرآن الكريم.
              </p>
              <Link href="/donate" className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-[#173c35] px-5 text-sm font-bold text-[#fffaf0] transition-transform hover:-translate-y-1">
                حالة قنوات المساهمة <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="donation-videos" className="relative overflow-hidden bg-[#ede4d1] px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-black tracking-[.18em] text-[#997042]">من مقارئ البيان</p>
              <h2 className="max-w-xl text-3xl font-black leading-[1.5] text-[#193c36] sm:text-4xl">رسالةٌ تُروى، لا تُختصر في رقم.</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#536c64]">
                مقاطع توعوية من مواد الجمعية، ورسالتها في تعليم القرآن الكريم للناطقين بغير العربية.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {stories.map((story) => (
                <StoryVideo
                  key={story.src}
                  src={story.src}
                  poster={story.poster}
                  title={story.title}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-[#0b7660] shadow-[0_24px_65px_rgba(11,118,96,.16)] lg:grid-cols-[1fr_.9fr]">
            <div className="relative p-7 sm:p-12 lg:p-14">
              <span className="absolute -left-16 -top-20 h-60 w-60 rounded-full border border-white/15" />
              <span className="absolute -left-4 -top-8 h-36 w-36 rounded-full border border-[#d5b66f]/35" />
              <div className="relative">
                <p className="mb-4 text-xs font-black tracking-[.18em] text-[#f0d391]">المساهمة في التعليم</p>
                <h2 className="max-w-xl text-3xl font-black leading-[1.5] text-[#fffaf0] sm:text-4xl">نفتح باب المساهمة حين تكتمل القنوات الرسمية.</h2>
                <p className="mt-5 max-w-lg text-sm leading-7 text-white/75">
                  قنوات المساهمة قيد الإعداد واعتماد البيانات. لا تُرسل أي مبلغ ولا تستخدم بيانات دفع سابقة.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 bg-[#173c35] p-7 sm:p-12 lg:p-14">
              <div className="flex items-start gap-3 text-sm leading-7 text-white/75">
                <Check className="mt-1 h-5 w-5 shrink-0 text-[#d5b66f]" />
                <span>لن نعرض وسيلة دفع حتى اعتمادها رسميًا.</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/donate" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#d5b66f] px-6 text-sm font-black text-[#173c35] transition-transform hover:-translate-y-1">
                  تفاصيل حالة التبرع <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
