import { FileText, MapPin, BadgeCheck } from "lucide-react";

const registrationDecision = "/documents/albayan-registration-decision.pdf";

export function AssociationVerification() {
  return (
    <section
      aria-labelledby="association-verification-title"
      dir="rtl"
      className="rounded-2xl border border-white/15 bg-white/5 p-4"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <a
          href={registrationDecision}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-xl bg-white p-2 transition hover:scale-[1.02]"
          aria-label="فتح قرار تسجيل الجمعية"
        >
          <img
            src="/images/albayan-registration-qr.png"
            alt="رمز التحقق الرسمي من قرار تسجيل الجمعية"
            className="h-24 w-24"
          />
        </a>
        <div className="min-w-0 text-center sm:text-right">
          <h4 id="association-verification-title" className="font-bold text-white">
            البيانات الرسمية للجمعية
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-white/75">
            جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية
          </p>
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-white/70">
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5" />
              رقم الترخيص: 1000863300
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              المقر الرئيسي: الرياض
            </span>
          </div>
          <a
            href={registrationDecision}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-200 hover:text-white"
          >
            <FileText className="h-4 w-4" />
            عرض قرار التسجيل ورقم الصادر ED048385
          </a>
          <p className="mt-1 text-[11px] text-white/50">
            امسح رمز QR للتحقق من الوثيقة لدى الجهة المصدرة.
          </p>
        </div>
      </div>
    </section>
  );
}
