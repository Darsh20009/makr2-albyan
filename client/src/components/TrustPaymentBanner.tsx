import { BadgeCheck, FileCheck2 } from "lucide-react";

export function TrustPaymentBanner() {
  return (
    <section className="rounded-2xl border border-primary/15 bg-primary/5 p-5" dir="rtl">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-right">
        <img
          src="/images/albayan-registration-qr.png"
          alt="رمز التحقق من قرار التسجيل"
          className="h-20 w-20 rounded-lg border bg-white p-1"
        />
        <div className="flex-1">
          <p className="flex items-center justify-center gap-2 font-bold text-primary sm:justify-start">
            <BadgeCheck className="h-5 w-5" />
            جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            رقم الترخيص: 1000863300 · المقر الرئيسي: الرياض
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            قنوات المساهمة غير مفعّلة حتى اعتماد بيانات الدفع الرسمية.
          </p>
        </div>
        <a
          href="/documents/albayan-registration-decision.pdf"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-bold hover:bg-muted"
        >
          <FileCheck2 className="h-4 w-4" />
          تحقق من التسجيل
        </a>
      </div>
    </section>
  );
}
