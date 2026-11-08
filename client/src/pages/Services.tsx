import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BookOpen, GraduationCap, Users, ArrowLeft, Target,
  CheckCircle2, Star, Heart,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const SERVICES_DATA = [
  {
    slug: "recitation",
    title: "برنامج القراءات",
    icon: BookOpen,
    gradient: "from-emerald-600 to-green-500",
    bgGradient: "bg-gradient-to-br from-emerald-500 to-green-400",
    color: "bg-emerald-500",
    poster: "/images/albayan-learning.svg",
    description: "مسارات تعليمية للقراءات والتلاوة الصحيحة.",
    summary: "برنامج قرآني للتعلم والممارسة",
    stats: { beneficiaries: 0, projects: 0 },
    amounts: [],
  },
  {
    slug: "hifz",
    title: "برنامج الحفظ",
    icon: BookOpen,
    gradient: "from-sky-600 to-blue-500",
    bgGradient: "bg-gradient-to-br from-sky-500 to-blue-400",
    color: "bg-sky-500",
    poster: "/images/albayan-learning.svg",
    description: "تعليم وتحفيظ القرآن الكريم ومتابعة الدارسين.",
    summary: "مسار للحفظ والمراجعة",
    stats: { beneficiaries: 0, projects: 0 },
    amounts: [],
  },
  {
    slug: "tajweed",
    title: "تصحيح الفاتحة",
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-400",
    bgGradient: "bg-gradient-to-br from-amber-500 to-orange-400",
    color: "bg-amber-500",
    poster: "/images/albayan-learning.svg",
    description: "تعلم قراءة الفاتحة قراءة صحيحة.",
    summary: "برنامج لتصحيح القراءة",
    stats: { beneficiaries: 0, projects: 0 },
    amounts: [],
  },
  {
    slug: "revision",
    title: "إعداد المعلمين والمشرفين",
    icon: GraduationCap,
    gradient: "from-violet-600 to-purple-500",
    bgGradient: "bg-gradient-to-br from-violet-500 to-purple-400",
    color: "bg-violet-500",
    poster: "/images/albayan-learning.svg",
    description: "إعداد المعلمين والمعلمات وتأهيل المشرفين والمشرفات على حلقات القرآن الكريم.",
    summary: "تأهيل للعمل في الحلقات",
    stats: { beneficiaries: 0, projects: 0 },
    amounts: [],
  },
];

function ServiceCard({ service, index }: { service: typeof SERVICES_DATA[0], index: number }) {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/services/${service.slug}`}>
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-2xl cursor-pointer hover:-translate-y-1">
          <div className="relative h-52 overflow-hidden">
            {/* Poster image as background */}
            <img
              src={service.poster}
              alt={`بوستر ${service.title}`}
              className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t ${service.bgGradient.replace("bg-gradient-to-br", "")} opacity-0 group-hover:opacity-70 transition-opacity duration-500`} />
            {/* Always-present bottom gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Icon badge */}
            <div className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-5 h-5" style={{ color: service.color.replace("bg-", "").includes("emerald") ? "#059669" : service.color.includes("sky") ? "#0284c7" : service.color.includes("amber") ? "#d97706" : "#7c3aed" }} />
            </div>
            {/* Title overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4">
              <p className="font-black text-xl font-heading text-white drop-shadow-lg">{service.title}</p>
            </div>
          </div>

          <CardContent className="p-5">
            <div className="flex items-start gap-2 mb-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
              <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">{service.summary}</p>
            </div>

            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{service.description}</p>

            {service.stats.beneficiaries > 0 && <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{service.stats.beneficiaries.toLocaleString()} مستفيد</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{service.stats.projects} مشروع</span>
              </div>
            </div>}

            <Button className={`w-full bg-gradient-to-l ${service.gradient} hover:opacity-90 text-white font-bold`}>
              تفاصيل البرنامج
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Services() {
  useSEO({
    title: "برامج مقارئ البيان لتعليم القرآن الكريم",
    description: "استكشف برامج القراءات والحفظ وتصحيح الفاتحة وإعداد معلمي حلقات القرآن الكريم.",
    image: "/images/albayan-official-logo.png",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="relative bg-gradient-to-bl from-primary via-teal-600 to-emerald-700 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-sm font-bold px-4 py-2 rounded-full border border-white/25 mb-5">
                <Heart className="w-4 h-4 fill-white/80" />
                تعلم القرآن الكريم
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">برامج مقارئ البيان</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                اختر المسار التعليمي الذي يناسبك، وتواصل معنا لمعرفة تفاصيل الالتحاق.
              </p>
            </motion.div>
          </div>
        </div>

        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICES_DATA.map((service, index) => (
                <ServiceCard key={service.slug} service={service} index={index} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(152 42% 24%) 0%, hsl(152 42% 34%) 100%)" }}
            >
              <div className="flex flex-col md:flex-row items-center gap-6 p-8 md:p-10" dir="rtl">
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/25">
                      <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                      مسارات تعليمية
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black font-heading text-white mb-3">
                    ابدأ رحلة التعلم
                  </h2>
                  <p className="text-white/80 text-base mb-5 max-w-lg">
                    تعرّف على مسارات التلاوة والحفظ والتجويد والمراجعة، واستفسر عن مواعيد الالتحاق.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { Icon: BookOpen, label: "القراءات" },
                      { Icon: BookOpen, label: "الحفظ" },
                      { Icon: GraduationCap, label: "تصحيح الفاتحة" },
                      { Icon: Users, label: "إعداد المعلمين" },
                    ].map(({ Icon, label }) => (
                      <span key={label} className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </span>
                    ))}
                  </div>
                  <Link href="/contact">
                    <button
                      data-testid="button-program-contact"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-700 font-black font-heading rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-base"
                    >
                      استفسر عن البرامج
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
                <div className="flex md:flex-col gap-4 shrink-0 text-white/90 text-sm">
                  <span>تعليم التلاوة</span>
                  <span>حفظ ومراجعة</span>
                  <span>أحكام التجويد</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-heading text-gradient mb-4">مسارات التعلم</h2>
              <p className="text-muted-foreground">برامج تعليم القرآن الكريم في مقارئ البيان</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: "التلاوة", label: "تصحيح التلاوة", icon: Users },
                { value: "الحفظ", label: "حفظ القرآن", icon: CheckCircle2 },
                { value: "التجويد", label: "أحكام التجويد", icon: Heart },
                { value: "المراجعة", label: "مراجعة المحفوظ", icon: Target },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-3xl font-bold font-heading text-gradient">{stat.value}</h4>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-l from-primary to-teal-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-heading mb-3">ابدأ رحلتك مع القرآن الكريم</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              تواصل مع مقارئ البيان لمعرفة تفاصيل البرامج التعليمية المتاحة.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8">
                  استفسر الآن
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-lg px-8">
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
