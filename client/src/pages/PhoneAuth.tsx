import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";

export default function PhoneAuth({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const {
    requestPhoneLoginCode,
    loginWithPhoneCode,
    loginAdminWithPassword,
    isPhoneOtpPending,
    isAdminLoginPending,
  } = useAuth();

  const digits = mobile.replace(/\D/g, "").slice(-9);
  const isAdminPhone = mode === "login" && digits === "500000000";
  const isAuthPending = isPhoneOtpPending || isAdminLoginPending;
  const redirectAfterAuth = (role?: string) => {
    if (["admin", "manager"].includes(role || "")) setLocation("/admin");
    else if (role === "delivery") setLocation("/delivery");
    else if (["employee", "accountant", "programmer", "sales"].includes(role || "")) setLocation("/employee");
    else setLocation("/");
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setName("");
    setMobile("");
    setPassword("");
    setCode("");
    setChallengeId(null);
    if (next === "register" && location !== "/register") setLocation("/register");
    if (next === "login" && location !== "/login") setLocation("/login");
  };

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isAdminPhone) {
      try {
        const user = await loginAdminWithPassword({ mobile: `+966${digits}`, password });
        redirectAfterAuth(user.role);
      } catch {
        // The shared auth hook presents the server's safe error message.
      }
      return;
    }

    try {
      const result = await requestPhoneLoginCode({
        mobile: `+966${digits}`,
        ...(mode === "register" ? { name: name.trim() } : {}),
      });
      setChallengeId(result.challengeId);
      setCode("");
    } catch {
      // The shared auth hook presents the server's safe error message.
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!challengeId || code.length !== 6) return;
    try {
      const user = await loginWithPhoneCode({ challengeId, code });
      redirectAfterAuth(user.role);
    } catch {
      // The shared auth hook presents the server's safe error message.
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#1f2a37]" dir="rtl">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-[#008d74] p-8 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,.16),transparent_28%),linear-gradient(145deg,#008d74,#14573a)]" />
          <div className="islamic-pattern pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative z-10 flex items-center gap-3">
            <img src="/images/albayan-mark.svg" alt="" className="h-12 w-12 rounded-2xl bg-white p-1" />
            <div>
              <p className="text-sm font-black">مقارئ البيان</p>
              <p className="mt-1 text-xs text-white/65">لتعليم القرآن الكريم</p>
            </div>
          </div>

          <div className="relative z-10 mx-auto my-10 w-full max-w-[480px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 p-3 shadow-[0_35px_100px_rgba(0,0,0,.25)]">
              <img
                src="/images/albayan-quran-learning.jpg"
                alt="دارس يتلو القرآن في أجواء تعليمية"
                className="aspect-[4/5] w-full rounded-[1.5rem] object-cover"
              />
              <div className="absolute inset-x-3 bottom-3 rounded-b-[1.5rem] bg-gradient-to-t from-[#102f2a]/95 via-[#102f2a]/70 to-transparent px-6 pb-6 pt-20">
                <p className="text-xs font-bold text-[#c6f1dd]">طريقُ العلم يبدأ بخطوة</p>
                <p className="mt-2 text-xl font-black leading-relaxed">حساب واحد لمتابعة مساهماتك وإيصالاتك.</p>
              </div>
            </div>
            <div className="absolute -left-5 -top-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/45 bg-white text-[#14573a] shadow-xl">
              <BookOpen className="h-7 w-7" strokeWidth={1.6} />
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/65">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#c6f1dd]" /> دخول برمز لمرة واحدة</span>
            <span>رقم الترخيص 1000863300</span>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col bg-white">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 text-slate-900 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/albayan-mark.svg" alt="" className="h-9 w-9 rounded-xl bg-white p-1" />
              <span className="font-black">مقارئ البيان</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
              الرئيسية <ChevronLeft className="h-4 w-4" />
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
            <div className="w-full max-w-[450px]">
              <div className="mb-9 hidden items-center justify-between lg:flex">
                <Link href="/" className="text-xs font-bold text-slate-500 transition-colors hover:text-[#1b8354]">
                  <ArrowLeft className="ml-1 inline h-4 w-4" /> العودة للموقع
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600">
                  <LockKeyhole className="h-3.5 w-3.5 text-[#1b8354]" /> تسجيل آمن
                </span>
              </div>

              <div className="mb-7">
                <p className="mb-3 text-xs font-black text-[#1b8354]">أهلاً بك في مقارئ البيان</p>
                <h1 className="text-3xl font-black leading-[1.4] text-[#14573a] sm:text-4xl">
                  {challengeId ? "تحقّق من رقمك" : mode === "register" ? "أنشئ حسابك بخطوة" : "أكمل طريق عطائك"}
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {challengeId
                    ? "أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه عبر واتساب."
                    : mode === "register"
                      ? "اكتب اسمك ورقم جوالك. بعد التحقق من الرقم، يُنشأ حسابك تلقائياً."
                      : isAdminPhone
                        ? "أدخل كلمة مرور الإدارة للمتابعة إلى لوحة التحكم."
                        : "ادخل برمز جوالك لمراجعة مساهماتك وإيصالاتك."}
                </p>
              </div>

              <div className="mb-7 grid grid-cols-2 rounded-sm border border-[#d5e9dd] bg-[#f3fcf6] p-1">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`min-h-11 rounded-sm text-sm font-black transition ${mode === "login" ? "bg-white text-[#14573a] shadow-sm" : "text-slate-500 hover:text-[#14573a]"}`}
                  data-testid="tab-login"
                >
                  دخول
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`min-h-11 rounded-sm text-sm font-black transition ${mode === "register" ? "bg-white text-[#14573a] shadow-sm" : "text-slate-500 hover:text-[#14573a]"}`}
                  data-testid="tab-register"
                >
                  حساب جديد
                </button>
              </div>

              <AnimatePresence mode="wait">
                {challengeId ? (
                  <motion.form
                    key="verify"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onSubmit={verifyCode}
                    className="space-y-5"
                  >
                    <div className="rounded-2xl border border-[#d9e6dc] bg-[#eef5ef] p-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-[#315b4c]">
                        <MessageCircle className="h-4 w-4 text-[#0b7660]" />
                        رمز التحقق أُرسل إلى
                      </p>
                      <p className="mt-2 text-left font-bold tracking-wider" dir="ltr">+966 {digits}</p>
                    </div>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-[#31584e]">رمز التحقق</span>
                      <Input
                        value={code}
                        onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        dir="ltr"
                        placeholder="••••••"
                        className="h-14 rounded-2xl border-[#d8ded5] bg-white text-center text-2xl font-black tracking-[.55em] text-[#173c35]"
                        required
                        autoFocus
                        data-testid="input-phone-otp"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isPhoneOtpPending || code.length !== 6}
                      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b7660] px-5 text-sm font-black text-white shadow-[0_12px_25px_rgba(11,118,96,.18)] transition hover:-translate-y-0.5 hover:bg-[#075d4e] disabled:cursor-not-allowed disabled:opacity-60"
                      data-testid="button-verify-phone-otp"
                    >
                      {isPhoneOtpPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      تأكيد ومتابعة
                    </button>
                    <button
                      type="button"
                      onClick={() => { setChallengeId(null); setCode(""); }}
                      className="w-full py-2 text-sm font-bold text-[#628075] hover:text-[#0b7660]"
                    >
                      تغيير رقم الجوال
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="request"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onSubmit={submitLogin}
                    className="space-y-5"
                  >
                    {mode === "register" && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-bold text-[#31584e]">الاسم الكامل</span>
                        <span className="relative block">
                          <UserRound className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789087]" />
                          <Input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoComplete="name"
                            maxLength={100}
                            placeholder="اكتب اسمك"
                            className="h-13 rounded-2xl border-[#d8ded5] bg-white pr-11 text-sm"
                            required
                            data-testid="input-register-name"
                          />
                        </span>
                      </label>
                    )}

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-[#31584e]">رقم الجوال</span>
                      <span className="relative block">
                        <Input
                          value={mobile}
                          onChange={(event) => {
                            setMobile(event.target.value.replace(/\D/g, "").slice(-9));
                            setPassword("");
                          }}
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="5X XXX XXXX"
                          dir="ltr"
                          className="h-14 rounded-2xl border-[#d8ded5] bg-white pl-20 text-left text-base font-semibold tracking-wider"
                          required
                          data-testid="input-mobile"
                        />
                        <span className="absolute left-0 top-0 flex h-full items-center rounded-l-2xl border-r border-[#e5e7e1] bg-[#f5f6f2] px-4 text-sm font-bold text-[#62756c]" dir="ltr">+966</span>
                      </span>
                      <span className="mt-2 block text-xs leading-6 text-[#829188]">سيُستخدم الرقم للدخول واستلام إشعارات الإيصالات فقط.</span>
                    </label>

                    {isAdminPhone && (
                      <label className="block">
                        <span className="mb-2 block text-sm font-bold text-[#31584e]">كلمة مرور الإدارة</span>
                        <span className="relative block">
                          <LockKeyhole className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789087]" />
                          <Input
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            autoComplete="current-password"
                            maxLength={256}
                            placeholder="أدخل كلمة مرور الإدارة"
                            className="h-14 rounded-2xl border-[#d8ded5] bg-white pr-11 text-sm"
                            required
                            data-testid="input-admin-password"
                          />
                        </span>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={isAuthPending || digits.length !== 9 || (mode === "register" && name.trim().length < 2) || (isAdminPhone && password.length === 0)}
                      className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0b7660] px-5 text-sm font-black text-white shadow-[0_12px_25px_rgba(11,118,96,.18)] transition hover:-translate-y-0.5 hover:bg-[#075d4e] disabled:cursor-not-allowed disabled:opacity-60"
                      data-testid={isAdminPhone ? "button-admin-password-login" : "button-request-phone-otp"}
                    >
                      {isAuthPending
                        ? <Loader2 className="h-5 w-5 animate-spin" />
                        : isAdminPhone
                          ? <LockKeyhole className="h-5 w-5" />
                          : <MessageCircle className="h-5 w-5" />}
                      {isAdminPhone ? "دخول الإدارة" : "إرسال رمز عبر واتساب"}
                      {!isAuthPending && <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />}
                    </button>

                    <div className="flex gap-3 rounded-2xl border border-[#e5e1d6] bg-white/75 p-4 text-xs leading-6 text-[#71837a]">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0b7660]" />
                      <p>رمز مؤقت صالح لخمس دقائق. إن كان رقم حسابك القديم غير مسجل أو تغيّر، تواصل مع إدارة الجمعية لتحديثه بأمان.</p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <p className="mt-8 text-center text-xs leading-6 text-[#8a9890]">
                باستخدامك الموقع، أنت توافق على{" "}
                <Link href="/privacy-policy" className="font-bold text-[#0b7660] hover:underline">سياسة الخصوصية</Link>
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#e8e4d8] pt-5 text-[11px] font-semibold text-[#8a9890]">
                <ShieldCheck className="h-4 w-4 text-[#b39151]" />
                جمعية مقارئ البيان · دخول موثّق برقم الجوال
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
