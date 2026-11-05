import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useSEO } from "@/hooks/use-seo";
import { Link } from "wouter";

export default function ServiceDetail() {
  useSEO({
    title: "برامج مقارئ البيان لتعليم القرآن الكريم",
    description: "تفاصيل البرامج ومواعيد الالتحاق ستعلن بعد اعتمادها.",
    image: "/images/albayan-official-logo.png",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Navbar />
      <main className="flex-1 container mx-auto flex items-center justify-center px-4 py-20">
        <section className="w-full max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-primary">تفاصيل البرامج قريباً</h1>
          <p className="mt-4 text-muted-foreground">
            يجري إعداد تفاصيل برامج مقارئ البيان ومواعيد الالتحاق. تواصل معنا للاستفسار.
          </p>
          <Link href="/contact" className="inline-flex mt-6 rounded-lg bg-primary px-5 py-3 font-bold text-white">
            تواصل معنا
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
