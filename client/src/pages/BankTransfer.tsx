import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useSEO } from "@/hooks/use-seo";

export default function BankTransfer() {
  useSEO({
    title: "بيانات التحويل البنكي",
    description: "بيانات التحويل البنكي لمقارئ البيان قيد الإعداد.",
    image: "/images/albayan-official-logo.png",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <Navbar />
      <main className="flex-1 container mx-auto flex items-center justify-center px-4 py-20">
        <section className="w-full max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-primary">بيانات التحويل البنكي قيد الإعداد</h1>
          <p className="mt-4 text-muted-foreground">
            لا تحوّل إلى الحسابات السابقة. ستُعرض بيانات مقارئ البيان بعد اعتمادها رسمياً.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
